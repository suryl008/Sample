import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
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
  styleUrls: ["./document-list-info-dialog.component.css"],
})
export class DocumentListInfoDialogComponent implements OnInit {
  myLabelPosition: labelPosition = "before";
  tooltipPosition: position = "above";
  documentListDialogInfoForm: FormGroup;

  searchQuestionnaireCtrl = new FormControl();
  searchFormRulesCtrl = new FormControl();
  searchFlexformCtrl = new FormControl();
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

  constructor(
    public dialogRef: MatDialogRef<DocumentListInfoDialogComponent>,
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: FormBuilder,
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
    if (this.data.fileTypeInfo) {
      this.dataSourceRemainder = new MatTableDataSource(this.data.fileTypeInfo);
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

    this.searchQuestionnaireCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredQuestionnaire = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .GetAllQuestionnaireLookup(value)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredQuestionnaire = [];
        } else {
          this.errorMsg = "";
          this.filteredQuestionnaire = data;
        }
        console.log({ filteredQuestionnaire: this.filteredQuestionnaire });
      });

    this.searchFormRulesCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredFormRules = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .GetFormMasterLookup("1", value)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredFormRules = [];
        } else {
          this.errorMsg = "";
          this.filteredFormRules = data;
        }
        console.log({ filteredFormRules: this.filteredFormRules });
      });

    this.searchFlexformCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredFlexform = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .GetFlexFormPdftemplateLookup("1", "EarlyOn", "OGS", value)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredFlexform = [];
        } else {
          this.errorMsg = "";
          this.filteredFlexform = data;
        }
        console.log({ filteredFlexform: this.filteredFlexform });
      });
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

  campaignOne = new FormGroup({
    start: new FormControl(new Date(year, month, 13)),
    end: new FormControl(new Date(year, month, 16)),
  });
  campaignTwo = new FormGroup({
    start: new FormControl(new Date(year, month, 15)),
    end: new FormControl(new Date(year, month, 19)),
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
}
