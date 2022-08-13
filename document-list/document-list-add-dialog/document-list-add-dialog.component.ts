

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
import { MatTabChangeEvent } from "@angular/material/tabs";

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
  selector: 'app-document-list-add-dialog',
  templateUrl: './document-list-add-dialog.component.html',
  styleUrls: ['./document-list-add-dialog.component.css'],
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
export class DocumentListAddDialogComponent implements OnInit {
  [x: string]: any;
  @Output() emitService = new EventEmitter();
  title = "angular-mat-table-example";
  isEdit = false;
  isRemainderForm=false;
  remainderForm: FormGroup = new FormGroup({});
  documentAddForm: FormGroup

  // All MDE Contacts (ALL_MDE)    All Sub-Recipient Contacts(ALL_SR)

  public emailTemplateList: EmailTemplate[];
  docType="";

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
  addUserFrom: FormGroup;
  addDocumentFrom: FormGroup;
  constructor(
    public fb: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<DocumentListAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.documentAddForm = fb.group({
      documentDetailsForm: fb.group({
        name: ['', Validators.required],
        documentCategory: ['', Validators.required],
          documentType: ['', Validators.required],
          documentEntity: ['', Validators.required],
          documentDefault: ['', Validators.required],
          documentInactive: ['', Validators.required]
      }),
      typeForm: fb.group({
          street: ['', Validators.required],
          suite: ['', Validators.required],
          city: ['', Validators.required],
          zipCode: ['', Validators.required]
      })
  });

    // this.remainderForm = fb.group({
    //   scheduleDaysOffsetFromDueDate: ["", [Validators.required]],
    //   emailTemplateId: ["", [Validators.required]],
    //   to: ["", [Validators.required]],
    //   cc: ["", [Validators.required]],
    //   bcc: ["", [Validators.required]],
    // });

    this.columnsToDisplay = [
      "scheduleDaysOffsetFromDueDate",
      "emailTemplateId",
      "toContact",
      "ccContact",
      "bccContact",
    ];
  }

  ngOnInit(): void {
    console.log(this.data);
    this.documentListFormInit();
    this.dataSourceRemainder = new MatTableDataSource(this.data);
    this.getEmailTemplates();
    this.getAllContactTypeLookup();
    this.address = {
      rvwTypeCompliancePlanSubmissionReminderAddressId: 0,
      rvwTypeCompliancePlanSubmissionReminderScheduleId: 0,
      receiptType: "",
      addressType: "",
      addressValue: "",
      createDt: "",
      createId: 0,
      lastUpdDt: "",
      lastUpdId: 0,
      rvwTypeCompliancePlanSubmissionReminderSchedule: [],
    };
  }

  onDocumentTypeChange(type:any){
    this.docType=type;

  }
  documentListFormInit() {
    this.documentAddForm = this.fb.group({
      name:[''],
      documentDetailsForm: this.fb.group({
        name: ['', Validators.required],
        documentCategory: ['', Validators.required],
          documentType: ['', Validators.required],
          documentEntity: ['', Validators.required],
          documentDefault: ['', Validators.required],
          documentInactive: ['', Validators.required]
      }),
      typeForm: this.fb.group({
          street: ['', Validators.required],
          suite: ['', Validators.required],
          city: ['', Validators.required],
          zipCode: ['', Validators.required]
      })
  });
   
    // this.documentAddForm = this.fb.group({ 
    //   documentName: ["",[ Validators.required]] ,  
    //   documentCategory: ["",[ Validators.required]] ,
    //   documentType: ["",[ Validators.required]] , 
    //   documentEntity: ["",[ Validators.required]] , 
    //   documentDefault: ["",[ Validators.required]] ,
    //   documentInactive: ["",[ Validators.required]] , 
      
      
    // });
  }
  select(){
    console.log("selected")
  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('tabChangeEvent => ', tabChangeEvent.tab.textLabel);
    console.log('index => ', tabChangeEvent.index);
    tabChangeEvent.tab.textLabel==='Remainder'?this.isAddRemainder=true:this.isAddRemainder=false;

  }
  saveDocument(){
    console.log(this.documentAddForm.controls.documentDetailsForm.value)
   
   

  }
  addNewRemind(): void {
    this.isRemainderForm = !this.isRemainderForm;
    this.newObject = {};
    let newRemind = {
      dueDate: 0,
      email: "",
      toContact: "",
      bccContact: "",
      ccContact: "",
    };
    // this.dataSource.push(newRemind);
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
    this.emitService.next(this.newObject);
    this.dataSourceRemainder.data.push(this.newObject);
    this.dataSourceRemainder._updateChangeSubscription();
    this.cd.markForCheck();
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

