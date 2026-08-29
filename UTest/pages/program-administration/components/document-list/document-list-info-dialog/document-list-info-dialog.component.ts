import { RvwDocSubmissionReminderSchedule } from "./../../../models/rvw-doc-submission-reminder-schedule.model";
import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { EmailTemplate } from "../../../models/email-template.model";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";

export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();
@Component({
    selector: "app-document-list-info-dialog",
    templateUrl: "./document-list-info-dialog.component.html",
    styleUrls: ["./document-list-info-dialog.component.scss"],
    standalone: false
})
export class DocumentListInfoDialogComponent implements OnInit {
  myLabelPosition: labelPosition = "before";
  tooltipPosition: position = "above";
  documentListDialogInfoForm: UntypedFormGroup;

  searchQuestionnaireCtrl = new UntypedFormControl();
  searchFormRulesCtrl = new UntypedFormControl();
  searchFlexformCtrl = new UntypedFormControl();
  filteredQuestionnaire: any;
  filteredFormRules: any;
  filteredFlexform: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedSearchQuestionnaire: any = "";
  selectedSearchFormRules: any = "";
  selectedSearchFlexform: any = "";

  public emailTemplateList: EmailTemplate[];
  docApprovalsImportList: any = [];
  columnsToDisplay: string[];
  dataSourceRemainder: any;
  flip = false;
  questionnaireDetails: any;
  remainderDetails: any;
  approvalsDetails: any;
  formDetails: any;
  effDetails: any;
  attachmentDetails: any = { details: { fileTypeAppl: false }, types: [] };
  isDocModelEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DocumentListInfoDialogComponent>,
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.columnsToDisplay = [
      "refType",
      "refDesc",
      "sel",
      "sizeApply",
      "maxSize",
      "pageApply",
      "Del",
      "min",
      "max",
    ];
    if (this.data.typeInfo.fileTypeInfo) {
      this.dataSourceRemainder = new MatTableDataSource(
        this.data.typeInfo.fileTypeInfo
      );
    }
  }

  displayWith(value: any) {
    return value?.name;
  }

  displayWithForm(value: any) {
    return value?.formDescription;
  }

  clearSelection() {
    this.selectedSearchQuestionnaire = "";
    this.filteredQuestionnaire = [];
    this.selectedSearchFormRules = "";
    this.filteredFormRules = [];
    this.selectedSearchFlexform = "";
    this.filteredFlexform = [];
  }

  ngOnInit(): void {
    this.documentListDialogInfoFormInit();
    this.getEmailTemplates();
    this.docApprovalsImportList = [
      { item_id: "", item_text: "" },
      { item_id: "E", item_text: "EEM" },
      { item_id: "P", item_text: "MEGS+ / CMS" },
      { item_id: "M", item_text: "MEIS" },
      { item_id: "X", item_text: "N/A" },
    ];
  }

  onclick = () => {
    const btn = document.getElementById("flip_content");
    const content = document.getElementById("f1_card") as HTMLElement;
    content.classList.toggle("flip");
    this.flip = !this.flip;
  };

  cancelFlip() {
    this.flip = !this.flip;
  }

  documentListDialogInfoFormInit() {
    this.documentListDialogInfoForm = this.formBuilder.group({
      alloMultipleInsCtrl: [false],
      fileTypeApplCtrl: [false],
    });
  }

  campaignOne = new UntypedFormGroup({
    start: new UntypedFormControl(new Date(year, month, 13)),
    end: new UntypedFormControl(new Date(year, month, 16)),
  });
  campaignTwo = new UntypedFormGroup({
    start: new UntypedFormControl(new Date(year, month, 15)),
    end: new UntypedFormControl(new Date(year, month, 19)),
  });
  docTypeList = [
    { item_id: "", item_text: "" },
    { item_id: "A", item_text: "Attachment" },
    { item_id: "F", item_text: "Form" },
    { item_id: "E", item_text: "EFF" },
    { item_id: "V", item_text: "Approvals" },
    { item_id: "Q", item_text: "Questionnaire" },
  ];

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

  editForm() {
    this.isDocModelEdit = !this.isDocModelEdit;
  }

  GetQuestionnaireForm(val: any) {
    console.log({ val: val });
    this.questionnaireDetails = val;
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

  updateDocumentList() {
    this.data.documentValue.grantPgmId = this.data.grantPgmId;
    this.data.documentValue.rvwType = this.data.rvwType;
    this.data.documentValue.subCat = this.data.subCat;
    this.data.documentValue.createDt = new Date();
    this.data.documentValue.lastUpdDt = new Date();
    this.data.documentValue.subRvwId = 0;
    this.data.documentValue.valDt = new Date();
    this.data.documentValue.recType = "R";

    //Questionnaire
    if (this.data.documentValue.docType === "Q") {
      this.data.documentValue.helpTxt = this.questionnaireDetails.helpTxt;
      this.data.documentValue.questionnaireId =
        this.questionnaireDetails.questionnaireId;
      this.data.documentValue.allowMultipleQuestionnaireInstances =
        this.questionnaireDetails.allowMultipleQuestionnaireInstances;
      this.data.documentValue.questionnaireFieldId =
        this.questionnaireDetails.questionnaireFieldId;
    }

    //Approvals
    else if (this.data.documentValue.docType === "V") {
      this.data.documentValue.helpTxt = this.approvalsDetails.helpTxt;
      this.data.documentValue.dataSrc = this.approvalsDetails.dataSrc;
      this.data.documentValue.approvalEmailTemplateId =
        this.approvalsDetails.approvalEmailTemplateId;
      this.data.documentValue.editableEmail =
        this.approvalsDetails.editableEmail;
      this.data.documentValue.unlimitedRecipients =
        this.approvalsDetails.unlimitedRecipients;
    }

    //Form
    else if (this.data.documentValue.docType === "F") {
      this.data.documentValue.helpTxt = this.formDetails.helpTxt;
      this.data.documentValue.formId = this.formDetails.formId;
    }

    //EFF
    else if (this.data.documentValue.docType === "E") {
      this.data.documentValue.helpTxt = this.effDetails.helpTxt;
      this.data.documentValue.flexFormPdftemplateId =
        this.effDetails.flexFormPdftemplateId;
      this.data.documentValue.allowMultipleFlexformInstances =
        this.effDetails.allowMultipleFlexformInstances;
    }

    //Attachment
    else if (this.data.documentValue.docType === "A") {
      this.data.documentValue.helpTxt = this.attachmentDetails.details.helpTxt;
      this.data.documentValue.minNos = this.attachmentDetails.details.minNos;
      this.data.documentValue.maxNos = this.attachmentDetails.details.maxNos;
      this.data.documentValue.fileTypeAppl =
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
          this.data.documentValue.rvwAttachTypes.push(rvwAttachTypes);
        });
      }
    }

    //Reminder
    this.data.documentValue.rvwDocSubmissionReminderSchedules =
      this.remainderDetails;

    this.programAdministrationService
      .rvwDocumentListInfoSave(this.data.documentValue)
      .subscribe((res: any) => {
        if (res != null) {
          this.dialogRef.close("Save");
          console.log({ DocumentListData: res });
        }
      });
  }
}
