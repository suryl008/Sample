import { AppSettings } from "./../../../../app-settings";
import { ToastrService } from "ngx-toastr";
import { MatDialog } from "@angular/material/dialog";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { DocumentListInfoDialogComponent } from "./document-list-info-dialog/document-list-info-dialog.component";
import { DocumentListRemindersDialogComponent } from "./document-list-reminders-dialog/document-list-reminders-dialog.component";
import {
  labelPosition,
  position,
} from "../review-types/review-types.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { ReviewDocumentList } from "../../models/review-document-list.model";
import { PlanRemaindersDialogComponent } from "../review-types/plan-remainders-dialog/plan-remainders-dialog.component";

@Component({
  selector: "app-document-list",
  templateUrl: "./document-list.component.html",
  styleUrls: ["./document-list.component.css"],
})
export class DocumentListComponent implements OnInit {
  documentOwner: any;
  documentStatus: any;
  documentType: any;
  documentCategoryList: any = [];
  docTypeList: any = [];
  entityList: any = [];
  defaultList: any = [];
  advancedSearch: any;
  isAdvancedSearch: boolean = false;
  isDocumentInactive: boolean = false;
  attachment: any;
  validity: any;
  metadatas: boolean = false;

  documentListForm: FormGroup;
  tooltipPosition: position = "above";
  myLabelPosition: labelPosition = "before";

  documentOwnerSubRecipient: boolean = false;
  documentOwnerMDE: boolean = false;
  documentOwnerFindingPackage: boolean = false;
  documentStatusActive: boolean = false;
  documentStatusInactive: boolean = false;
  documentStatusBoth: boolean = false;

  documentAttachmentYes: boolean = false;
  documentAttachmentNo: boolean = false;
  documentAttachmentAll: boolean = false;
  documentValidityNA: boolean = false;
  documentValidityData: boolean = false;
  documentValidityUnit: boolean = false;
  documentValidityAll: boolean = false;

  documentAttachment: string;
  documentValidity: string;

  documentOwnerList: string[] = ["Sub-Recipient", "MDE", "Finding Package"];
  documentStatusList: string[] = ["Active", "Inactive", "Both"];
  documentAttachmentList: string[] = ["Yes", "No", "All"];
  documentValidityList: string[] = ["Not Applicable", "Date", "Unit", "All"];

  displayedFields: string[] = [
    "position",
    "documentName",
    "documentCategory",
    "type",
    "entity",
    "default",
    "inactive",
    "info",
    "remind",
  ];

  dataSourceDocuments: any;
  reviewType: any;
  public program: any = null;
  selectedPgmId: any;
  documents: Array<ReviewDocumentList>;
  fileTypeInfo: any;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.reviewType =
      this.route.snapshot.queryParamMap.get("review") ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;
          this.selectedPgmId = value.grantPgmId;
          this.loadDocuments();
        }
      }
    );

    this.documentOwner = "F";
    this.documentStatus = "A";
    this.documentType = "P";
    this.attachment = "A";
    this.validity = "D";

    this.documentListFormInit();
    this.getAllDocumentCategory();

    this.docTypeList = [
      { item_id: "", item_text: "" },
      { item_id: "A", item_text: "Attachment" },
      { item_id: "F", item_text: "Form" },
      { item_id: "E", item_text: "EFF" },
      { item_id: "V", item_text: "Approvals" },
      { item_id: "Q", item_text: "Questionnaire" },
    ];

    this.entityList = [
      { item_id: "0", item_text: "" },
      { item_id: "P", item_text: "Parent" },
      { item_id: "C", item_text: "Child" },
      { item_id: "B", item_text: "Both" },
    ];

    this.defaultList = [
      { item_id: "0", item_text: "" },
      { item_id: "D", item_text: "Default" },
      { item_id: "DM", item_text: "Req.Mand" },
    ];
    this.programAdministrationService
      .getAllFileTypesInfo(1, 1)
      .subscribe((res: any) => {
        if (res != null) {
          this.fileTypeInfo = res;
        }
      });
  }

  private loadDocuments() {
    console.log({
      program: this.program,
    });
    this.programAdministrationService
      .GetDocumentNameLookup(this.selectedPgmId, this.reviewType)
      .subscribe({
        next: (data) => {
          this.documents = data;

          this.dataSourceDocuments = new MatTableDataSource(this.documents);
          console.log({ LoadDocuments: this.dataSourceDocuments });
        },
        error: (err) => {
          alert(`Error ${err}!`);
        },
      });
    if (this.documentListForm === undefined) {
      this.documentListFormInit();
    }
    this.documentListForm.controls["documentOwnerCtrl"].setValue(
      "Sub-Recipient"
    );
    this.documentListForm.controls["documentStatusCtrl"].setValue("Active");

    this.documentListForm.controls["doctblCategoryCtrl"].setValue("G");
    this.documentListForm.controls["doctblTypeCtrl"].setValue("A");
    this.documentListForm.controls["doctblEntityCtrl"].setValue("B");
    this.documentListForm.controls["doctblDefaultCtrl"].setValue("D");
  }

  onAdvancedSearch(e: any) {
    if (e.target.value == "yes") {
      this.isAdvancedSearch = true;
    } else {
      this.isAdvancedSearch = false;
    }
  }

  getAllDocumentCategory() {
    this.programAdministrationService
      .GetRefDataDocumentCategory("DCT", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.documentCategoryList = res;
        }
      });
  }

  SearchDocuments() {
    this.isAdvancedSearch = false;
  }

  openDocumentListInfoDialog(controls: any, documentValue: any) {
    if (documentValue.docType === "A") {
    }

    const dialogRef = this.dialog.open(DocumentListInfoDialogComponent, {
      data: {
        documentValue: documentValue,
        controls: controls,
        fileTypeInfo: this.fileTypeInfo,
      },
      height: "500px",
      width: "800px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDocumentListRemindersDialog() {
    const dialogRef = this.dialog.open(PlanRemaindersDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      height: "80%",
      width: "80%",
      panelClass: "full-screen-modal",
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onDocumentOwnerChange(e: any) {
    if (e.value == "Sub-Recipient") {
      this.documentOwnerSubRecipient = true;
      this.documentOwnerMDE = false;
      this.documentOwnerFindingPackage = false;
    } else if (e.value == "MDE") {
      this.documentOwnerSubRecipient = false;
      this.documentOwnerMDE = true;
      this.documentOwnerFindingPackage = false;
    } else if (e.value == "Finding Package") {
      this.documentOwnerSubRecipient = false;
      this.documentOwnerMDE = false;
      this.documentOwnerFindingPackage = true;
    }
  }

  onDocumentStatusChange(e: any) {
    if (e.value == "Active") {
      this.documentStatusActive = true;
      this.documentStatusInactive = false;
      this.documentStatusBoth = false;
    } else if (e.value == "Inactive") {
      this.documentStatusActive = false;
      this.documentStatusInactive = true;
      this.documentStatusBoth = false;
    } else if (e.value == "Both") {
      this.documentStatusActive = false;
      this.documentStatusInactive = false;
      this.documentStatusBoth = true;
    }
  }

  onDocumentAttachmentChange(e: any) {
    if (e.value == "Yes") {
      this.documentAttachmentYes = true;
      this.documentAttachmentNo = false;
      this.documentAttachmentAll = false;
    } else if (e.value == "No") {
      this.documentAttachmentYes = false;
      this.documentAttachmentNo = true;
      this.documentAttachmentAll = false;
    } else if (e.value == "All") {
      this.documentAttachmentYes = false;
      this.documentAttachmentNo = false;
      this.documentAttachmentAll = true;
    }

    //   documentAttachmentList: string[] = ['Yes', 'No', 'All'];
    // documentValidityList: string[] = ['Not Applicable', 'Date', 'Unit', 'All'];
  }

  onDocumentValidityChange(e: any) {
    if (e.value == "Not Applicable") {
      this.documentValidityNA = true;
      this.documentValidityData = false;
      this.documentValidityUnit = false;
      this.documentValidityAll = false;
    } else if (e.value == "Date") {
      this.documentValidityNA = false;
      this.documentValidityData = true;
      this.documentValidityUnit = false;
      this.documentValidityAll = false;
    } else if (e.value == "Unit") {
      this.documentValidityNA = false;
      this.documentValidityData = false;
      this.documentValidityUnit = true;
      this.documentValidityAll = false;
    } else if (e.value == "All") {
      this.documentValidityNA = false;
      this.documentValidityData = false;
      this.documentValidityUnit = false;
      this.documentValidityAll = true;
    }
  }

  documentListFormInit() {
    this.documentListForm = this.formBuilder.group({
      documentOwnerCtrl: [
        (this.documentOwnerSubRecipient = true),
        Validators.required,
      ],
      documentStatusCtrl: [""],
      documentCategoryCtrl: [""],
      documentNameCtrl: [""],
      advancedSearchCtrl: [false],
      documentAttachmentCtrl: [false],
      documentValidityCtrl: [false],
      doctblCategoryCtrl: [""],
      doctblTypeCtrl: [""],
      doctblEntityCtrl: [""],
      doctblDefaultCtrl: [""],
    });
  }

  selectedDocumentDetails() {}
}
