import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { EmailTemplate } from "../../../models/email-template.model";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { RvwTypeCompliancePlanSubmissionReminderAddress } from "../../../models/rvwtype-compliance-plan-reminder-address.model";
import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "../../../models/rvwtype-complianceplan-reminder-schedule.model";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  company: string;
  expanded: boolean;
}

//const ELEMENT_DATA:any= [{dueDate:-7,email:"Data",ccContact:"tere",toContact:"erer",bccContact:"454545"}];

@Component({
  selector: "app-plan-remainders-dialog",
  templateUrl: "./plan-remainders-dialog.component.html",
  styleUrls: ["./plan-remainders-dialog.component.css"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class PlanRemaindersDialogComponent implements OnInit {
  @Output() emitService = new EventEmitter();
  title = "angular-mat-table-example";
  isEdit = false;
  remainderForm: FormGroup = new FormGroup({});

  // All MDE Contacts (ALL_MDE)    All Sub-Recipient Contacts(ALL_SR)

  public emailTemplateList: EmailTemplate[];

  dataSource = [
    {
      "Due Date offset": -7,
      "Email Template": "Data",
      "CC Contact Types": "tere",
      "To Contact Types": "erer",
      "BCC Contact Types": "454545",
    },
  ];

  // columnsToDisplay = [
  // {name:"dueDate", key:"Due Date offset ",type:"text"},
  // {name:"email", key:"Email Template",type:"select"},
  // {name:"toContact", key:"To Contact Types",type:"select"},
  // {name:"ccContact", key:"CC Contact Types",type:"select"},
  // {name:"bccContact", key:"BCC Contact Types",type:"select"}];
  contactTypeList: any = [];
  columnsToDisplay: any = [];
  dataSourceUsers: any;
  dataSourceRemainder: MatTableDataSource<unknown>;
  newObject: any = {};
  address: RvwTypeCompliancePlanSubmissionReminderAddress;
  newRemainder: RvwTypeCompliancePlanSubmissionReminderSchedule;
  editRemainderObject: boolean;
  editIndex: any;
  constructor(
    public fb: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PlanRemaindersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.remainderForm = fb.group({
      scheduleDaysOffsetFromDueDate: ["", [Validators.required]],
      emailTemplateId: ["", [Validators.required]],
      to: ["", [Validators.required]],
      cc: ["", [Validators.required]],
      bcc: ["", [Validators.required]],
    });

    this.columnsToDisplay = [
      "scheduleDaysOffsetFromDueDate",
      "emailTemplateId",
      "toContact",
      "ccContact",
      "bccContact",
      "edit"
    ];
  }

  ngOnInit(): void {
    console.log(this.data);
    this.dataSourceRemainder = new MatTableDataSource(this.data);
    this.getEmailTemplates();
    this.getAllContactTypeLookup();
    this.address = {
      rvwTypeCompliancePlanSubmissionReminderAddressId: 0,
      rvwTypeCompliancePlanSubmissionReminderScheduleId: 0,
      receiptType: "",
      addressType: "",
      addressValue: "",
      createDt: new Date(),
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      rvwTypeCompliancePlanSubmissionReminderSchedule: [],
    };
  }

  addNewRemind(): void {
    this.editRemainderObject = false;
    this.isEdit = !this.isEdit;
    this.newObject = {};
    let newRemind = {
      dueDate: 0,
      email: "",
      toContact: "",
      bccContact: "",
      ccContact: "",
    };
    this.remainderForm.reset();
  }

  editRemainder(element: any, index: any) {
    this.isEdit = !this.isEdit;
    this.editRemainderObject = true;
    this.newObject = {};
    console.log({ element: element });
    this.editIndex=this.dataSourceRemainder.data.indexOf(element)
    this.remainderForm.controls["scheduleDaysOffsetFromDueDate"].setValue(
      element.scheduleDaysOffsetFromDueDate
    );
    this.remainderForm.controls["emailTemplateId"].setValue(
      element.emailTemplateId
    );
    let temp: any[] = [];
    element.rvwTypeCompliancePlanSubmissionReminderAddresses.map((a: any) => {
      if (a.receiptType === "TO") temp.push(a.addressValue);
    });
    this.remainderForm.controls["to"].setValue(temp);
    let temp1: any[] = [];
    element.rvwTypeCompliancePlanSubmissionReminderAddresses.map((a: any) => {
      if (a.receiptType === "BCC") temp1.push(a.addressValue);
    });
    this.remainderForm.controls["bcc"].setValue(temp1);
    let temp2: any[] = [];
    element.rvwTypeCompliancePlanSubmissionReminderAddresses.map((a: any) => {
      if (a.receiptType === "CC") temp2.push(a.addressValue);
    });
    this.remainderForm.controls["cc"].setValue(temp2);
    this.remainderForm.controls["emailTemplateId"].setValue(
      element.emailTemplate.emailTemplateId
    );
    console.log(this.remainderForm.value);
    this.newObject.emailTemplate = element.emailTemplate;
    this.newObject.emailTemplateId = element.emailTemplate.emailTemplateId;
  }
  onChangeEmail(email: any) {
    this.newObject.emailTemplate = email;
    this.newObject.emailTemplateId = email.emailTemplateId;
  }
  saveReminder(newo: any) {
    this.newObject.scheduleDaysOffsetFromDueDate =
      this.remainderForm.value.scheduleDaysOffsetFromDueDate;
    this.newObject.emailTemplateId = this.remainderForm.value.emailTemplateId;
    this.newObject.rvwTypeCompliancePlanSubmissionReminderAddresses = [];
    this.remainderForm.value.to.map((to: string) => {
      this.newObject.rvwTypeCompliancePlanSubmissionReminderAddresses.push({
        ...this.address,
        receiptType: "TO",
        addressValue: to,
      });
    });
    this.remainderForm.value.to.map((cc: string) => {
      this.newObject.rvwTypeCompliancePlanSubmissionReminderAddresses.push({
        ...this.address,
        receiptType: "CC",
        addressValue: cc,
      });
    });
    this.remainderForm.value.cc.map((bcc: string) => {
      this.newObject.rvwTypeCompliancePlanSubmissionReminderAddresses.push({
        ...this.address,
        receiptType: "BCC",
        addressValue: bcc,
      });
    });

    console.log(JSON.stringify(this.newObject));
    console.log(this.editIndex);
    console.log(JSON.stringify(this.editRemainderObject));
    this.emitService.next(this.editRemainderObject );
    if (this.editRemainderObject === true) {
      this.dataSourceRemainder.data[this.editIndex] = this.newObject;
    } else {
      this.dataSourceRemainder.data.push(this.newObject);
    }
    this.dataSourceRemainder._updateChangeSubscription();
    this.cd.markForCheck();
    this.addNewRemind();
  }

  toggleRow(element: { expanded: boolean }) {
    // Uncommnet to open only single row at once
    // ELEMENT_DATA.forEach(row => {
    //   row.expanded = false;
    // })
    element.expanded = !element.expanded;
  }

  // manageAllRows(flag: boolean) {
  //   ELEMENT_DATA.forEach((row) => {
  //     row.expanded = flag;
  //   });
  // }

  getAllContactTypeLookup() {
    this.programAdministrationService
      .getAllContactTypeLookup("CTY", "A,G")
      .subscribe((res: any) => {
        if (res != null) {
          this.contactTypeList = res;
          console.log({
            AllContactTypes: this.contactTypeList,
          });
        }
      });
  }

  getEmailTemplates() {
    this.programAdministrationService
      .getEmailTemplates()
      .subscribe((res: any) => {
        if (res != null) {
          this.emailTemplateList = res;
          console.log({
            EmailTemplates: this.emailTemplateList,
          });
        }
      });
  }
}
