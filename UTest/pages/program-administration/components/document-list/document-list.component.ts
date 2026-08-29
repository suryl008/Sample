import { DocumentListRemainderDialogComponent } from "./document-list-remainder-dialog/document-list-remainder-dialog.component";
import { AppSettings } from "./../../../../app-settings";
import { ToastrService } from "ngx-toastr";
import { MatDialog } from "@angular/material/dialog";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
  FormArray,
  UntypedFormGroup,
  FormControl,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { DocumentListInfoDialogComponent } from "./document-list-info-dialog/document-list-info-dialog.component";
import {
  labelPosition,
  position,
} from "../review-types/review-types.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { ReviewDocumentList } from "../../models/review-document-list.model";
import { PlanRemaindersDialogComponent } from "../review-types/plan-remainders-dialog/plan-remainders-dialog.component";
import { DocumentListAddDialogComponent } from "./document-list-add-dialog/document-list-add-dialog.component";
import { ConfirmDialogComponent } from "../program-info/confirm-dialog/confirm-dialog.component";
import { SearchDocumentListParms } from "../../models/Search-document-list-parms.model";

@Component({
    selector: "app-document-list",
    templateUrl: "./document-list.component.html",
    styleUrls: ["./document-list.component.scss"],
    standalone: false
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
  panelOpenState = false;

  documentListForm: UntypedFormGroup;
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

  searchParms: SearchDocumentListParms = {
    subCat: "G",
    recType: "R",
    offCd: "",
    grantPgmId: 0,
    rvwType: "",
    docCat: "",
    docCatDesc: "",
    docCd: "",
    docName: "",
    valInd: "",
    subRvwId: 0,
    inactive: "false",
  };

  documentListResult: any = [];
  documentListInfo: any = [];

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
    "delete",
  ];

  dataSourceDocuments: any;
  reviewType: any;
  public program: any = null;
  selectedPgmId: any;
  documents: Array<ReviewDocumentList>;
  fileTypeInfo: any;
  isDocumentEdit: boolean;
  documentOwnerCtrl: string;
  documentStatusCtrl: string;
  documentCategoryCtrl: any;
  documentNameCtrl: string;
  documentAttachmentCtrl: string;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {
    this.documentOwnerCtrl = "Sub-Recipient";
    this.documentStatusCtrl = "";
    this.documentCategoryCtrl = "";
    this.documentNameCtrl = "";
    this.documentAttachmentCtrl = "";
    this.documentValidity = "";
  }

  ngOnInit(): void {
    this.isDocumentEdit = false;
    this.documentOwnerCtrl = "Sub-Recipient";
    this.documentStatusCtrl = "";
    this.documentCategoryCtrl = "";
    this.documentNameCtrl = "";
    this.documentAttachmentCtrl = "";
    this.documentValidity = "";
    this.reviewType =
      this.activatedRoute.snapshot.queryParamMap.get("review") ||
      sessionStorage.getItem("reviewType") ||
      this.programAdministrationService.reviewType ||
      AppSettings.DEFAULT_REVIEW_TYPE;

    this.programAdministrationService.selectedProgram$.subscribe(
      (programData: any) => {
        if (programData) {
          this.program = programData;
          this.selectedPgmId = programData.grantPgmId;
          // this.searchParms.grantPgmId = this.selectedPgmId;
          // this.searchParms.rvwType = this.reviewType;
          this.searchParms.grantPgmId = 1;
          this.searchParms.rvwType = "EarlyOn";
          this.loadDocuments();
          this.SearchDocuments();
        }
      }
    );

    this.documentOwner = "F";
    this.documentStatus = "A";
    this.documentType = "P";
    this.attachment = "A";
    this.validity = "D";

    this.documentListFormInit();
    this.documentListForm.disable();
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
      .getAllFileTypesInfo("FTY", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.fileTypeInfo = res;
        }
      });
  }
  getTeam(e: any) {
    this.documentCategoryCtrl = e.value;
  }

  private GetDocumentListSearchInfo() {
    this.programAdministrationService
      .GetDocumentListSearchInfo(this.searchParms)
      .subscribe((res: any) => {
        if ((res! = null)) {
          console.log(res);
          this.dataSourceDocuments = new MatTableDataSource(res);
          //this.documentListResult = res;
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
        },
        error: (err) => {
          alert(`Error ${err}!`);
        },
      });
    if (this.documentListForm === undefined) {
      this.documentListFormInit();
    }

    this.documentStatusCtrl = "Active";

    // this.documentListForm.controls["doctblCategoryCtrl"].setValue("G");
    // this.documentListForm.controls["doctblTypeCtrl"].setValue("A");
    // this.documentListForm.controls["doctblEntityCtrl"].setValue("B");
    // this.documentListForm.controls["doctblDefaultCtrl"].setValue("D");
  }

  editDocument() {
    this.isDocumentEdit = !this.isDocumentEdit;
    this.isDocumentEdit === true
      ? this.documentListForm.enable()
      : this.documentListForm.disable();
  }

  addDocument() {
    let data = {
      documentCategoryList: null,
      docTypeList: null,
      entityList: null,
      defaultList: null,
      subCat: "",
      grantPgmId: 0,
      rvwType: "",
    };
    data.documentCategoryList = this.documentCategoryList;
    data.docTypeList = this.docTypeList;
    data.entityList = this.entityList;
    data.defaultList = this.defaultList;
    data.subCat = "G";
    data.grantPgmId = this.selectedPgmId;
    data.rvwType = this.reviewType;
    // data.subCat = this.searchParms.subCat;

    const dialogRef = this.dialog.open(DocumentListAddDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      height: "80%",
      width: "80%",
      panelClass: ["full-screen-modal", "program-admin-overlay"],
      data: data,
    });
    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      // do sth with emmitedValue
      console.log(emmitedValue);
      //    this.planRemainder.push(emmitedValue);
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === "Save") {
        this.SearchDocuments();
      }
    });
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
    this.GetDocumentListSearchInfo();
  }

  getDocumentListInfoByListId(docListId: any) {
    this.programAdministrationService
      .getDocumentListInfoByListId(docListId)
      .subscribe((res: any) => {
        if (res != null) {
          this.documentListInfo = res;
        }
      });
  }

  openDocumentListInfoDialog(controls: any, documentValue: any) {
    if (documentValue.docType === "A") {
    }

    this.getDocumentListInfoByListId(documentValue.docListId);

    const dialogRef = this.dialog.open(DocumentListInfoDialogComponent, {
      panelClass: "program-admin-overlay",
      data: {
        documentValue: documentValue,
        controls: controls,
        typeInfo: {
          fileTypeInfo: this.fileTypeInfo,
          docListInfo: this.documentListInfo,
        },
        grantPgmId: this.selectedPgmId,
        rvwType: this.reviewType,
        subCat: "G",
      },
      height: "500px",
      width: "800px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: ${result}`);
      if (result === "Save") {
        this.SearchDocuments();
      }
    });
  }

  openDocumentListRemindersDialog(docDetails: any) {
    const dialogRef = this.dialog.open(PlanRemaindersDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      height: "80%",
      width: "80%",
      panelClass: ["full-screen-modal", "program-admin-overlay"],
      data: {
        docDetails: docDetails,
        pgmId: this.selectedPgmId,
        reviewType: this.reviewType,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onDocumentOwnerChange(e: any) {
    this.documentOwnerCtrl = e.value;
    if (e.value == "Sub-Recipient") {
      this.documentOwnerSubRecipient = true;
      this.documentOwnerMDE = false;
      this.documentOwnerFindingPackage = false;
      this.searchParms.subCat = "G";
    } else if (e.value == "MDE") {
      this.documentOwnerSubRecipient = false;
      this.documentOwnerMDE = true;
      this.documentOwnerFindingPackage = false;
      this.searchParms.subCat = "A";
    } else if (e.value == "Finding Package") {
      this.documentOwnerSubRecipient = false;
      this.documentOwnerMDE = false;
      this.documentOwnerFindingPackage = true;
      this.searchParms.subCat = "F";
    }
    this.GetDocumentListSearchInfo();
  }

  onDocumentStatusChange(e: any) {
    this.documentStatusCtrl = e.value;
    if (e.value == "Active") {
      this.documentStatusActive = true;
      this.documentStatusInactive = false;
      this.documentStatusBoth = false;
      this.searchParms.inactive = "false";
    } else if (e.value == "Inactive") {
      this.documentStatusActive = false;
      this.documentStatusInactive = true;
      this.documentStatusBoth = false;
      this.searchParms.inactive = "true";
    } else if (e.value == "Both") {
      this.documentStatusActive = false;
      this.documentStatusInactive = false;
      this.documentStatusBoth = true;
      this.searchParms.inactive = "";
    }
    this.GetDocumentListSearchInfo();
  }

  onDocumentAttachmentChange(e: any) {
    this.documentAttachment = e.value;
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
      this.searchParms.valInd = "X";
    } else if (e.value == "Date") {
      this.documentValidityNA = false;
      this.documentValidityData = true;
      this.documentValidityUnit = false;
      this.documentValidityAll = false;
      this.searchParms.valInd = "D";
    } else if (e.value == "Unit") {
      this.documentValidityNA = false;
      this.documentValidityData = false;
      this.documentValidityUnit = true;
      this.documentValidityAll = false;
      this.searchParms.valInd = "U";
    } else if (e.value == "All") {
      this.documentValidityNA = false;
      this.documentValidityData = false;
      this.documentValidityUnit = false;
      this.documentValidityAll = true;
      this.searchParms.valInd = "";
    }
  }

  advanceSearch(label: any, value: any) {
    if (label === "docName") this.searchParms.docName = value;
    if (label === "category") {
      this.searchParms.docCat = value.refCode;
      this.searchParms.docCatDesc = value.refDesc;
    }
  }

  documentListFormInit() {
    this.documentOwnerCtrl = "Sub-Recipient";
    this.documentStatusCtrl = "";
    this.documentCategoryCtrl = "";
    this.documentNameCtrl = "";
    this.documentAttachmentCtrl = "";
    this.documentValidity = "";
    this.documentListForm = this.formBuilder.group({
      advancedSearchCtrl: [false],

      documentValidityCtrl: [false],
      doctblCategoryCtrl: [""],
      doctblTypeCtrl: [""],
      doctblEntityCtrl: [""],
      doctblDefaultCtrl: [""],
    });
  }

  clearFilter() {
    this.documentAttachment = "";
    this.documentCategoryCtrl = "";
    this.documentNameCtrl = "";
    this.documentAttachmentCtrl = "";
  }
  selectedDocumentDetails() {}
  openDialog(element: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "20%",
      panelClass: ["full-screen-modal", "program-admin-overlay"],
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result == "Confirm") {
        this.deleteUserForDialog(element);
      }
    });
  }

  deleteUserForDialog(data: any) {
    console.log({ deletedata: data });
    this.dataSourceDocuments.data.splice(
      this.dataSourceDocuments.data.indexOf(data),
      1
    );
    this.dataSourceDocuments._updateChangeSubscription();
    this.cd.markForCheck();
  }

  bulkUpdateDocumentList() {
    this.dataSourceDocuments.data.map((document: any) => {
      document.grantPgmId = this.selectedPgmId;
      document.rvwType = this.reviewType;
      document.subCat = this.searchParms.subCat;
      document.createDt = new Date();
      document.lastUpdDt = new Date();
      document.valDt = new Date();
      document.recType = "R";
    });
    this.programAdministrationService
      .bulkUpdateDocumentList(this.dataSourceDocuments.data)
      .subscribe((res: any) => {
        if (res != null) {
          this.SearchDocuments();
          this.isDocumentEdit = !this.isDocumentEdit;
        }
      });
  }
}
