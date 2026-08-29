import { ReviewTypesComponent } from "./../../review-types/review-types.component";
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
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { RvwTypeCompliancePlanSubmissionReminderAddress } from "../../../models/rvwtype-compliance-plan-reminder-address.model";
import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "../../../models/rvwtype-complianceplan-reminder-schedule.model";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ReviewDocumentList } from "../../../models/review-document-list.model";

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
    selector: "app-document-list-add-dialog",
    templateUrl: "./document-list-add-dialog.component.html",
    styleUrls: ["./document-list-add-dialog.component.scss"],
    animations: [
        trigger("detailExpand", [
            state("collapsed", style({ height: "0px", minHeight: "0" })),
            state("expanded", style({ height: "*" })),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
        ]),
    ],
    standalone: false
})
export class DocumentListAddDialogComponent implements OnInit {
  [x: string]: any;
  @Output() emitService = new EventEmitter();
  title = "angular-mat-table-example";
  isEdit = false;
  isRemainderForm = false;
  remainderForm: UntypedFormGroup = new UntypedFormGroup({});
  documentAddForm: UntypedFormGroup;
  docTypeDetails: any;
  remainderDetails: any;
  approvalsDetails: any;
  formDetails: any;
  effDetails: any;
  attachmentDetails: any = {
    details: { fileTypeAppl: false },
    types: [],
  };
  docListData: ReviewDocumentList[] = [];

  // All MDE Contacts (ALL_MDE)    All Sub-Recipient Contacts(ALL_SR)

  public emailTemplateList: EmailTemplate[];
  docType = "";

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
  addUserFrom: UntypedFormGroup;
  addDocumentFrom: UntypedFormGroup;

  addDocumentListData: ReviewDocumentList;
  constructor(
    public fb: UntypedFormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<DocumentListAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.documentAddForm = fb.group({
      documentDetailsForm: fb.group({
        docName: ["", Validators.required],
        docCat: ["", Validators.required],
        docType: ["", Validators.required],
        entType: ["", Validators.required],
        defaultDoc: ["", Validators.required],
        inactive: ["", Validators.required],
      }),
      typeForm: fb.group({
        street: ["", Validators.required],
        suite: ["", Validators.required],
        city: ["", Validators.required],
        zipCode: ["", Validators.required],
      }),
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
      createDt: new Date(),
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      rvwTypeCompliancePlanSubmissionReminderSchedule: [],
    };

    this.addDocumentListData = {
      docListId: 0,
      recType: "R",
      offCd: "",
      grantPgmId: this.data.grantPgmId,
      seqNo: 21,
      subRvwId: 0,
      docCat: "",
      docCd: "",
      docName: "",
      docType: "",
      valInd: "D",
      valDt: new Date(),
      valUnits: 0,
      valUm: "",
      minNos: 0,
      maxNos: 0,
      fileTypeAppl: "",
      helpTxt: "",
      fileTitle: "",
      attachName: "",
      createDt: new Date(),
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      subCat: this.data.subCat,
      rvwType: this.data.rvwType,
      entType: "",
      formId: 0,
      requireDocumentComment: false,
      requireCheckListComment: false,
      inactive: false,
      defaultDoc: "",
      documentDueDateDaysOffsetFromReviewStartDate: 0,
      flexFormPdftemplateId: 0,
      allowMultipleFlexformInstances: false,
      unlimitedRecipients: false,
      dataSrc: "",
      approvalEmailTemplateId: 0,
      editableEmail: false,
      approvalHtml: "",
      approvalConfirmationEmailTemplateId: 0,
      questionnaireId: 0,
      allowMultipleQuestionnaireInstances: false,
      questionnaireFieldId: 0,
      mapQuestionnaireWorkflowCriteria: false,
      remapQuestionnaire: false,
      rvwAttachTypes: [],
      rvwDocSubmissionReminderSchedules: [
        {
          rvwDocSubmissionReminderScheduleId: 0,
          docListId: 0,
          emailTemplateId: 0,
          scheduleDaysOffsetFromDueDate: 0,
          createDt: new Date(),
          createId: 0,
          lastUpdDt: new Date(),
          lastUpdId: 0,
          createBy: "",
          lastUpdBy: "",
          templateName: "",
          rvwDocSubmissionReminderAddresses: [
            {
              rvwDocSubmissionReminderAddressId: 0,
              rvwDocSubmissionReminderScheduleId: 0,
              receiptType: "",
              addressType: "",
              addressValue: "",
              createDt: new Date(),
              createId: 0,
              lastUpdDt: new Date(),
              lastUpdId: 0,
            },
          ],
        },
      ],
    };
  }

  onDocumentTypeChange(type: any) {
    this.docType = type;
  }
  documentListFormInit() {
    this.documentAddForm = this.fb.group({
      name: [""],
      documentDetailsForm: this.fb.group({
        docName: ["", Validators.required],
        docCat: ["", Validators.required],
        docType: ["", Validators.required],
        entType: ["", Validators.required],
        defaultDoc: ["", Validators.required],
        inactive: [false],
      }),
      typeForm: this.fb.group({
        street: ["", Validators.required],
        suite: ["", Validators.required],
        city: ["", Validators.required],
        zipCode: ["", Validators.required],
      }),
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
  select() {
    console.log("selected");
  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log("tabChangeEvent => ", tabChangeEvent);
    console.log("tabChangeEvent => ", tabChangeEvent.tab.textLabel);
    console.log("index => ", tabChangeEvent.index);
    tabChangeEvent.tab.textLabel === "Remainder"
      ? (this.isAddRemainder = true)
      : (this.isAddRemainder = false);
  }
  saveDocument() {
    console.log(this.documentAddForm.controls.documentDetailsForm.value);
    this.addDocumentListData.docName =
      this.documentAddForm.controls.documentDetailsForm.value.docName;
    this.addDocumentListData.docCat =
      this.documentAddForm.controls.documentDetailsForm.value.docCat;
    this.addDocumentListData.docType =
      this.documentAddForm.controls.documentDetailsForm.value.docType;
    this.addDocumentListData.entType =
      this.documentAddForm.controls.documentDetailsForm.value.entType;
    this.addDocumentListData.defaultDoc =
      this.documentAddForm.controls.documentDetailsForm.value.defaultDoc;
    this.addDocumentListData.inactive =
      this.documentAddForm.controls.documentDetailsForm.value.inactive;

    //Questionnaire
    if (
      this.documentAddForm.controls.documentDetailsForm.value.docType === "Q"
    ) {
      this.addDocumentListData.helpTxt = this.docTypeDetails.helpTxt;
      this.addDocumentListData.questionnaireId =
        this.docTypeDetails.questionnaireId;
      this.addDocumentListData.allowMultipleQuestionnaireInstances =
        this.docTypeDetails.allowMultipleQuestionnaireInstances;
      this.addDocumentListData.questionnaireFieldId =
        this.docTypeDetails.questionnaireFieldId;
    }

    //Approvals
    else if (
      this.documentAddForm.controls.documentDetailsForm.value.docType === "V"
    ) {
      this.addDocumentListData.helpTxt = this.approvalsDetails.helpTxt;
      this.addDocumentListData.dataSrc = this.approvalsDetails.dataSrc;
      this.addDocumentListData.approvalEmailTemplateId =
        this.approvalsDetails.approvalEmailTemplateId;
      this.addDocumentListData.editableEmail =
        this.approvalsDetails.editableEmail;
      this.addDocumentListData.unlimitedRecipients =
        this.approvalsDetails.unlimitedRecipients;
    }
    //Form
    else if (
      this.documentAddForm.controls.documentDetailsForm.value.docType === "F"
    ) {
      this.addDocumentListData.helpTxt = this.formDetails.helpTxt;
      this.addDocumentListData.formId = this.formDetails.formId;
    }
    //EFF
    else if (
      this.documentAddForm.controls.documentDetailsForm.value.docType === "E"
    ) {
      this.addDocumentListData.helpTxt = this.effDetails.helpTxt;
      this.addDocumentListData.flexFormPdftemplateId =
        this.effDetails.flexFormPdftemplateId;
      this.addDocumentListData.allowMultipleFlexformInstances =
        this.effDetails.allowMultipleFlexformInstances;
    }
    //Attachment
    else if (
      this.documentAddForm.controls.documentDetailsForm.value.docType === "A"
    ) {
      this.addDocumentListData.helpTxt = this.attachmentDetails.details.helpTxt;
      this.addDocumentListData.minNos = this.attachmentDetails.details.minNos;
      this.addDocumentListData.maxNos = this.attachmentDetails.details.maxNos;
      this.addDocumentListData.fileTypeAppl =
        this.attachmentDetails.details.fileTypeAppl === true ? "Y" : "N";
      if (this.attachmentDetails.types) {
        this.attachmentDetails.types.map((detail: any) => {
          let rvwAttachTypes = {
            docListId: 0,
            fileType: detail.refCode,
            fileSizeAppl: detail.size_appl === true ? "Y" : "N",
            maxSize: detail.max_size,
            pgNosAppl: detail.page_appl === true ? "Y" : "N",
            minPg: detail.minLen,
            maxPg: detail.maxLen,
            createDt: new Date(),
            createId: 0,
            lastUpdDt: new Date(),
            lastUpdId: 0,
          };
          this.addDocumentListData.rvwAttachTypes.push(rvwAttachTypes);
        });
      }
    }
    //Remainder
    this.addDocumentListData.rvwDocSubmissionReminderSchedules =
      this.remainderDetails;

    this.programAdministrationService
      .rvwDocumentListInfoSave(this.addDocumentListData)
      .subscribe((res) => {
        this.dialogRef.close("Save");
        console.log({ DocumentListInfoData: res });
      });
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

  GetQuestionnaireForm(val: any) {
    console.log({ val: val });
    this.docTypeDetails = val;
  }

  GetRemainderEventForm(val: any) {
    console.log({ val: val });
    this.remainderDetails = val;
  }

  GetApprovalsEventForm(val: any) {
    console.log({ val: val });
    this.approvalsDetails = val;
  }

  GetFormEvent(val: any) {
    console.log({ val: val });
    this.formDetails = val;
  }

  GetEFFEventForm(val: any) {
    console.log({ val: val });
    this.effDetails = val;
  }

  GetAttachmentEventForm(val: any) {
    console.log({ val: val });
    this.attachmentDetails = val;
  }
}
