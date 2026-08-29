import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { HttpClient } from "@angular/common/http";
import { Subscription, firstValueFrom } from "rxjs";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatePipe } from "@angular/common";
import { MiscdataConfirmDialogComponent } from "../components/miscdata-confirm-dialog/miscdata-confirm-dialog.component";

@Component({
    selector: "app-additional-support-dialog",
    templateUrl: "./additional-support-dialog.component.html",
    styleUrls: ["./additional-support-dialog.component.scss"],
    providers: [DatePipe],
    standalone: false
})
export class AdditionalSupportDialogComponent implements OnInit, OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef;
  @ViewChild("supportFileInput") supportFileInput!: ElementRef;

  // Form Groups
  documentAddForm: UntypedFormGroup;
  supportCommentForm: UntypedFormGroup;

  // Form data
  formDetails: any = null;
  attachmentDetails: any = {
    details: {
      helpTxt: "",
      minNos: 1,
      maxNos: 5,
      fileTypeAppl: false,
    },
    types: [],
    isValid: true,
    validationErrors: [],
  };
  userDetails: any;
  directorVisitSelectedData: any = {};
  miscData: any[] = [];

  // Lists
  commentTypeList: any[] = [];
  documentCategoryList: any[] = [];

  // Type options
  docUploadType: any[] = [
    { type: "Electronic", value: "E", active: true },
    { type: "Hard Copy", value: "H", active: false },
  ];

  validityType: any[] = [
    { type: "NA", value: "N", active: true },
    { type: "Date", value: "D", active: false },
    { type: "Units", value: "U", active: false },
  ];

  formType: any[] = [
    { type: "Attachment", value: "A", active: true },
    { type: "Form", value: "F", active: false },
  ];

  // Current values
  uploadDocTypeValue: string = "E";
  uploadSupportTypeValue: string = "E";
  selectedCommentType: string = "";
  supportComment: string = "";
  submissionComment: string = "";

  // File handling
  selectedFile: File | null = null;
  selectedFileName: string = "";
  selectedSupportFile: File | null = null;
  selectedSupportFileName: string = "";
  base64Document: string = "";
  base64Support: string = "";

  currentDate: string = "";

  // State
  showSpinner: boolean = false;
  isAddOrEdit: boolean = false;
  currentTabIndex: number = 0;
  isSaving: boolean = false;
  hasUnsavedChanges: boolean = false;

  // Form validation
  documentFormErrors: string[] = [];
  supportFormErrors: string[] = [];

  // Subscriptions
  private subscriptions: Subscription = new Subscription();
  private dateUpdateInterval: any;

  // Max file size (10MB)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Allowed file types
  private readonly ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "text/plain",
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AdditionalSupportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.initializeForms();
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
    this.updateCurrentDate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.dateUpdateInterval) {
      clearInterval(this.dateUpdateInterval);
    }
  }

  private initializeForms(): void {
    // Document form with all controls properly initialized
    this.documentAddForm = this.fb.group({
      documentDetailsForm: this.fb.group({
        docName: [
          "",
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        docCat: ["", Validators.required],
        docType: ["A", Validators.required],
        entType: ["N"],
        validityDate: [null],
        validityUnits: [null, [Validators.min(1)]],
        validityUnitType: ["day"],
      }),
    });

    // Support comment form
    this.supportCommentForm = this.fb.group({
      commentType: ["", Validators.required],
      comment: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
    });

    // Initialize radio groups
    this.uploadDocTypeValue = "E";
    this.uploadSupportTypeValue = "E";
    this.submissionComment = "";

    // Set initial validators
    this.updateValidityValidators("N");
  }

  private setupFormListeners(): void {
    // Listen to document type changes
    const docTypeSub = this.documentAddForm
      .get("documentDetailsForm.docType")
      ?.valueChanges.subscribe((value) => {
        if (value === "F") {
          // If Form type selected, set validity to NA and clear validators
          this.documentAddForm
            .get("documentDetailsForm.entType")
            ?.setValue("N");
          this.updateValidityValidators("N");
        }
        this.hasUnsavedChanges = true;
      });

    if (docTypeSub) {
      this.subscriptions.add(docTypeSub);
    }

    // Listen to entType changes to update validators
    const entTypeSub = this.documentAddForm
      .get("documentDetailsForm.entType")
      ?.valueChanges.subscribe((value) => {
        this.updateValidityValidators(value);
        this.hasUnsavedChanges = true;
      });

    if (entTypeSub) {
      this.subscriptions.add(entTypeSub);
    }

    // Listen to form value changes
    const docFormSub = this.documentAddForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = true;
      this.updateDocumentFormErrors();
    });

    const supportFormSub = this.supportCommentForm.valueChanges.subscribe(
      () => {
        this.hasUnsavedChanges = true;
        this.updateSupportFormErrors();
      },
    );

    this.subscriptions.add(docFormSub);
    this.subscriptions.add(supportFormSub);
  }

  private updateValidityValidators(entType: string): void {
    const validityDateCtrl = this.documentAddForm.get(
      "documentDetailsForm.validityDate",
    );
    const validityUnitsCtrl = this.documentAddForm.get(
      "documentDetailsForm.validityUnits",
    );
    const validityUnitTypeCtrl = this.documentAddForm.get(
      "documentDetailsForm.validityUnitType",
    );

    // Check if controls exist
    if (!validityDateCtrl || !validityUnitsCtrl || !validityUnitTypeCtrl) {
      return;
    }

    // Clear all validators first
    validityDateCtrl.clearValidators();
    validityUnitsCtrl.clearValidators();
    validityUnitTypeCtrl.clearValidators();

    // Reset values
    validityDateCtrl.setValue(null, { emitEvent: false });
    validityUnitsCtrl.setValue(null, { emitEvent: false });
    validityUnitTypeCtrl.setValue("day", { emitEvent: false });

    // Set validators based on entType
    if (entType === "D") {
      validityDateCtrl.setValidators([Validators.required]);
      validityUnitsCtrl.setValidators([]);
      validityUnitTypeCtrl.setValidators([]);
    } else if (entType === "U") {
      validityDateCtrl.setValidators([]);
      validityUnitsCtrl.setValidators([Validators.required, Validators.min(1)]);
      validityUnitTypeCtrl.setValidators([Validators.required]);
    } else {
      validityDateCtrl.setValidators([]);
      validityUnitsCtrl.setValidators([]);
      validityUnitTypeCtrl.setValidators([]);
    }

    // Update validity
    validityDateCtrl.updateValueAndValidity({ emitEvent: false });
    validityUnitsCtrl.updateValueAndValidity({ emitEvent: false });
    validityUnitTypeCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private loadInitialData(): void {
    this.showSpinner = true;

    try {
      this.userDetails = this.programAdministrationService.getUserDetails() || {
        userId: 1,
        fullName: "System User",
        email: "user@system.com",
      };

      this.isAddOrEdit = this.sharedService.checkIsAddOrEdit("PgmAdmin");
      this.directorVisitSelectedData = this.data?.directorVisitSelectedData || {
        programName: "Sample Program",
        rvw_type_desc: "Review Type",
        rvw_type: "RT001",
        sub_rec_name: "Sub Recipient",
        sub_rec_cd: "SR001",
        programId: 1,
        subRvwId: 119619,
      };

      // Load dropdown data
      this.loadDropdownData();
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.showMessage("Error loading initial data", "error");
    } finally {
      this.showSpinner = false;
    }
  }

  private loadDropdownData(): void {
    this.getDocCategoryList();
    this.getCommentTypeList();
  }

  tabChanged(event: MatTabChangeEvent): void {
    if (this.hasUnsavedChanges && event.index !== this.currentTabIndex) {
      void this.confirmTabChange(event.index);
      return;
    }

    this.currentTabIndex = event.index;
  }

  private async confirmTabChange(nextIndex: number): Promise<void> {
    const stayOn = this.currentTabIndex;
    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Unsaved changes",
        message: "You have unsaved changes. Switch tabs without saving?",
        subMessage: "Form values on this tab are kept until you save, reset, or close.",
        confirmText: "Switch",
        cancelText: "Stay",
        type: "warning",
      },
    });

    const confirmed = !!(await firstValueFrom(dialogRef.afterClosed()));
    if (!confirmed) {
      this.currentTabIndex = nextIndex;
      this.cd.detectChanges();
      setTimeout(() => {
        this.currentTabIndex = stayOn;
        this.cd.detectChanges();
      });
      return;
    }

    this.currentTabIndex = nextIndex;
  }

  onDocumentTypeChange(type: string): void {
    const docType = type === "Attachment" ? "A" : "F";
    this.documentAddForm.get("documentDetailsForm.docType")?.setValue(docType);
  }

  onValidityTypeChange(type: string): void {
    const entType = type === "NA" ? "N" : type === "Date" ? "D" : "U";
    this.documentAddForm.get("documentDetailsForm.entType")?.setValue(entType);
    this.hasUnsavedChanges = true;
  }

  onFileSelected(
    event: Event,
    type: "document" | "support" = "document",
  ): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    const validation = this.validateFile(file);
    if (!validation.isValid) {
      this.showMessage(validation.error, "error");
      input.value = "";
      return;
    }

    if (type === "document") {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.convertFileToBase64(file, "document");
    } else {
      this.selectedSupportFile = file;
      this.selectedSupportFileName = file.name;
      this.convertFileToBase64(file, "support");
    }

    this.hasUnsavedChanges = true;
    this.cd.detectChanges();
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error:
          "File type not allowed. Allowed types: PDF, Word, Excel, Images, Text",
      };
    }

    return { isValid: true };
  }

  private convertFileToBase64(file: File, type: "document" | "support"): void {
    this.showSpinner = true;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64 = reader.result as string;

      if (type === "document") {
        this.base64Document = base64.split(",")[1];
      } else {
        this.base64Support = base64.split(",")[1];
      }

      this.showSpinner = false;
      this.showMessage(
        `${type === "document" ? "Document" : "Support"} file loaded successfully`,
        "success",
      );
    };

    reader.onerror = (error) => {
      console.error("Error converting file:", error);
      this.showSpinner = false;
      this.showMessage("Error loading file", "error");
    };
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      this.showMessage("Please select a file first", "error");
      return;
    }

    if (!this.base64Document) {
      this.showMessage("File not properly loaded. Please try again.", "error");
      return;
    }

    this.showSpinner = true;

    setTimeout(() => {
      this.showSpinner = false;
      this.showMessage("File ready for submission", "success");
    }, 1000);
  }

  uploadSupportDocument(): void {
    if (!this.selectedSupportFile) {
      this.showMessage("Please select a file first", "error");
      return;
    }

    if (!this.base64Support) {
      this.showMessage("File not properly loaded. Please try again.", "error");
      return;
    }

    this.showSpinner = true;

    setTimeout(() => {
      this.showSpinner = false;
      this.showMessage("Support file ready for submission", "success");
    }, 1000);
  }

  getFormEvent(val: any): void {
    this.formDetails = val;
    this.hasUnsavedChanges = true;
  }

  getAttachmentEventForm(val: any): void {
    this.attachmentDetails = {
      details: val.details || this.attachmentDetails.details,
      types: val.types || [],
      isValid: val.isValid === true,
      validationErrors: val.validationErrors || [],
    };
    this.hasUnsavedChanges = true;
  }

  saveDocument(): void {
    this.updateDocumentFormErrors();
    if (this.documentFormErrors.length > 0) {
      this.showMessage("Please fix all errors before saving", "error");
      return;
    }

    const docType = this.documentAddForm.get(
      "documentDetailsForm.docType",
    )?.value;
    const docDetails = this.documentAddForm.get("documentDetailsForm")?.value;

    if (
      docType === "A" &&
      this.uploadDocTypeValue === "E" &&
      !this.selectedFile
    ) {
      this.showMessage("Please upload a file or select Hard Copy", "error");
      return;
    }

    if (docType === "F" && !this.formDetails) {
      this.showMessage("Please configure form rules", "error");
      return;
    }

    if (docType === "A" && this.attachmentDetails) {
      if (this.attachmentDetails.validationErrors?.length > 0) {
        this.showMessage("Please fix attachment configuration errors", "error");
        return;
      }
    }

    // Validate based on entType (only for Attachment type)
    if (docType === "A") {
      if (docDetails.entType === "D" && !docDetails.validityDate) {
        this.showMessage("Please select a validity date", "error");
        return;
      }

      if (docDetails.entType === "U" && !docDetails.validityUnits) {
        this.showMessage("Please enter validity units", "error");
        return;
      }
    }

    this.isSaving = true;
    this.showSpinner = true;

    let formattedDate = null;
    if (docDetails.validityDate) {
      if (docDetails.validityDate instanceof Date) {
        formattedDate = docDetails.validityDate.toISOString();
      } else {
        try {
          formattedDate = new Date(docDetails.validityDate).toISOString();
        } catch (e) {
          formattedDate = docDetails.validityDate;
        }
      }
    }

    const documentData = {
      documentName: docDetails.docName,
      documentCategory: docDetails.docCat,
      documentType: docDetails.docType,
      entityType: docDetails.entType,

      programId: this.directorVisitSelectedData.programId,
      programName: this.directorVisitSelectedData.programName,
      reviewType: this.directorVisitSelectedData.rvw_type,
      reviewTypeDesc: this.directorVisitSelectedData.rvw_type_desc,
      subRecipientId: this.directorVisitSelectedData.sub_rec_cd,
      subRecipientName: this.directorVisitSelectedData.sub_rec_name,
      subRvwId: this.directorVisitSelectedData.subRvwId,

      userId: this.userDetails?.userId || 0,
      userName: this.userDetails?.fullName || "Unknown",
      userEmail: this.userDetails?.email || "",

      uploadType: this.uploadDocTypeValue,
      fileName: this.selectedFile ? this.selectedFileName : null,
      fileSize: this.selectedFile ? this.selectedFile.size : null,
      fileType: this.selectedFile ? this.selectedFile.type : null,
      fileData: this.base64Document,

      attachmentConfig:
        docType === "A"
          ? {
              details: {
                helpTxt: this.attachmentDetails.details?.helpTxt || "",
                minNos: this.attachmentDetails.details?.minNos || 1,
                maxNos: this.attachmentDetails.details?.maxNos || 5,
                fileTypeAppl: this.attachmentDetails.details?.fileTypeAppl
                  ? "Y"
                  : "N",
              },
              types:
                this.attachmentDetails.types?.map((type: any) => ({
                  fileType: type.fileType,
                  fileSizeAppl: type.fileSizeAppl || "N",
                  maxSize: type.maxSize || 0,
                  pgNosAppl: type.pgNosAppl || "N",
                  minPg: type.minPg || 0,
                  maxPg: type.maxPg || 0,
                })) || [],
            }
          : null,

      formConfig:
        docType === "F"
          ? {
              helpTxt: this.formDetails?.helpTxt || "",
              formId: this.formDetails?.formId || "",
              formDescription: this.formDetails?.formDescription || "",
              formCode: this.formDetails?.formCode || "",
              dateRange: this.formDetails?.dateRange || null,
              isRequired: this.formDetails?.isRequired || false,
            }
          : null,

      validityData:
        docType === "A"
          ? docDetails.entType === "D"
            ? {
                type: "date",
                date: formattedDate,
              }
            : docDetails.entType === "U"
              ? {
                  type: "units",
                  units: docDetails.validityUnits,
                  unitType: docDetails.validityUnitType || "day",
                }
              : {
                  type: "na",
                }
          : null,

      submissionComment: this.submissionComment || "",

      status: "Pending",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      isActive: true,
      version: 1,
    };

    console.log("Saving document:", documentData);

    // Simulate API call
    setTimeout(() => {
      this.showSpinner = false;
      this.isSaving = false;
      this.hasUnsavedChanges = false;

      this.showMessage("Document saved successfully!", "success");

      this.dialogRef.close({
        success: true,
        type: "document",
        data: documentData,
        timestamp: new Date(),
      });
    }, 1500);
  }

  saveSupport(): void {
    this.updateSupportFormErrors();
    if (this.supportFormErrors.length > 0) {
      this.showMessage("Please fix all errors before saving", "error");
      return;
    }

    const supportDetails = this.supportCommentForm.value;

    if (this.uploadSupportTypeValue === "E" && !this.selectedSupportFile) {
      this.showMessage("Please upload a file or select Hard Copy", "error");
      return;
    }

    this.isSaving = true;
    this.showSpinner = true;

    const supportData = {
      commentType: supportDetails.commentType,
      comment: supportDetails.comment,
      commentTitle: `Comment by ${this.userDetails?.fullName || "User"}`,
      submissionComment: this.submissionComment || "",

      programId: this.directorVisitSelectedData.programId,
      programName: this.directorVisitSelectedData.programName,
      reviewType: this.directorVisitSelectedData.rvw_type,
      reviewTypeDesc: this.directorVisitSelectedData.rvw_type_desc,
      subRecipientId: this.directorVisitSelectedData.sub_rec_cd,
      subRecipientName: this.directorVisitSelectedData.sub_rec_name,
      subRvwId: this.directorVisitSelectedData.subRvwId,

      userId: this.userDetails?.userId || 0,
      userName: this.userDetails?.fullName || "Unknown",
      userEmail: this.userDetails?.email || "",

      uploadType: this.uploadSupportTypeValue,
      fileName: this.selectedSupportFile ? this.selectedSupportFileName : null,
      fileSize: this.selectedSupportFile ? this.selectedSupportFile.size : null,
      fileType: this.selectedSupportFile ? this.selectedSupportFile.type : null,
      fileData: this.base64Support,

      status: "Active",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      isResolved: false,
      priority: "Medium",
      category: "Additional Support",
    };

    console.log("Saving support:", supportData);

    setTimeout(() => {
      this.showSpinner = false;
      this.isSaving = false;
      this.hasUnsavedChanges = false;

      this.showMessage("Support comment saved successfully!", "success");

      this.dialogRef.close({
        success: true,
        type: "support",
        data: supportData,
        timestamp: new Date(),
      });
    }, 1500);
  }

  getDocCategoryList(): void {
    this.showSpinner = true;

    setTimeout(() => {
      this.documentCategoryList = [
        { refCode: "", refDesc: "Please Select" },
        { refCode: "CAT1", refDesc: "Financial Documents" },
        { refCode: "CAT2", refDesc: "Legal Documents" },
        { refCode: "CAT3", refDesc: "Technical Specifications" },
        { refCode: "CAT4", refDesc: "Meeting Minutes" },
        { refCode: "CAT5", refDesc: "Reports" },
      ];
      this.showSpinner = false;
    }, 500);
  }

  getCommentTypeList(): void {
    this.showSpinner = true;

    setTimeout(() => {
      this.commentTypeList = [
        { refCode: "", refDesc: "Please Select" },
        { refCode: "GEN", refDesc: "General Comment" },
        { refCode: "ISS", refDesc: "Issue" },
        { refCode: "QUS", refDesc: "Question" },
        { refCode: "SUG", refDesc: "Suggestion" },
        { refCode: "REV", refDesc: "Review Note" },
        { refCode: "CLR", refDesc: "Clarification" },
        { refCode: "DEC", refDesc: "Decision" },
      ];
      this.showSpinner = false;
    }, 500);
  }

  private updateDocumentFormErrors(): void {
    this.documentFormErrors = [];

    if (!this.documentAddForm.valid) {
      const documentDetailsForm = this.documentAddForm.get(
        "documentDetailsForm",
      );

      if (documentDetailsForm && documentDetailsForm instanceof UntypedFormGroup) {
        const controls = documentDetailsForm.controls;

        Object.keys(controls).forEach((key) => {
          const control = controls[key];
          if (control.invalid && control.touched) {
            const errors = control.errors;
            if (errors) {
              if (errors["required"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} is required`,
                );
              }
              if (errors["minlength"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} must be at least ${errors["minlength"].requiredLength} characters`,
                );
              }
              if (errors["maxlength"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} cannot exceed ${errors["maxlength"].requiredLength} characters`,
                );
              }
              if (errors["min"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} must be at least ${errors["min"].min}`,
                );
              }
            }
          }
        });
      }
    }
  }

  private updateSupportFormErrors(): void {
    this.supportFormErrors = [];

    if (!this.supportCommentForm.valid) {
      const controls = this.supportCommentForm.controls;

      Object.keys(controls).forEach((key) => {
        const control = controls[key];
        if (control.invalid && control.touched) {
          const errors = control.errors;
          if (errors) {
            if (errors["required"]) {
              this.supportFormErrors.push(
                `${this.getFieldLabel(key)} is required`,
              );
            }
            if (errors["minlength"]) {
              this.supportFormErrors.push(
                `${this.getFieldLabel(key)} must be at least ${errors["minlength"].requiredLength} characters`,
              );
            }
            if (errors["maxlength"]) {
              this.supportFormErrors.push(
                `${this.getFieldLabel(key)} cannot exceed ${errors["maxlength"].requiredLength} characters`,
              );
            }
          }
        }
      });
    }
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      docName: "Document Name",
      docCat: "Document Category",
      docType: "Document Type",
      entType: "Validity Type",
      validityDate: "Validity Date",
      validityUnits: "Validity Units",
      validityUnitType: "Unit Type",
      commentType: "Comment Type",
      comment: "Comment",
    };

    return labels[fieldName] || this.capitalizeFirstLetter(fieldName);
  }

  private capitalizeFirstLetter(text: string): string {
    return (
      text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, " $1")
    );
  }

  changeDocUploadType(value: string): void {
    this.uploadDocTypeValue = value;
    if (value !== "E") {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
      if (this.fileInput) {
        this.fileInput.nativeElement.value = "";
      }
    }
    this.hasUnsavedChanges = true;
  }

  changeSupportUploadType(value: string): void {
    this.uploadSupportTypeValue = value;
    if (value !== "E") {
      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
      if (this.supportFileInput) {
        this.supportFileInput.nativeElement.value = "";
      }
    }
    this.hasUnsavedChanges = true;
  }

  clearFileSelection(type: "document" | "support" = "document"): void {
    if (type === "document") {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
      if (this.fileInput) {
        this.fileInput.nativeElement.value = "";
      }
    } else {
      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
      if (this.supportFileInput) {
        this.supportFileInput.nativeElement.value = "";
      }
    }
    this.hasUnsavedChanges = true;
    this.cd.detectChanges();
  }

  resetDocumentForm(): void {
    void this.confirmResetForm().then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.documentAddForm.get("documentDetailsForm")?.reset({
        docName: "",
        docCat: "",
        docType: "A",
        entType: "N",
        validityDate: null,
        validityUnits: null,
        validityUnitType: "day",
      });

      this.updateValidityValidators("N");

      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
      this.uploadDocTypeValue = "E";
      this.submissionComment = "";
      this.formDetails = null;
      this.attachmentDetails = {
        details: {
          helpTxt: "",
          minNos: 1,
          maxNos: 5,
          fileTypeAppl: false,
        },
        types: [],
        isValid: true,
        validationErrors: [],
      };

      if (this.fileInput) {
        this.fileInput.nativeElement.value = "";
      }

      this.documentFormErrors = [];
      this.hasUnsavedChanges = false;
      this.cd.detectChanges();
    });
  }

  resetSupportForm(): void {
    void this.confirmResetForm().then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.supportCommentForm.reset({
        commentType: "",
        comment: "",
      });

      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
      this.uploadSupportTypeValue = "E";
      this.submissionComment = "";

      if (this.supportFileInput) {
        this.supportFileInput.nativeElement.value = "";
      }

      this.supportFormErrors = [];
      this.hasUnsavedChanges = false;
      this.cd.detectChanges();
    });
  }

  private showMessage(
    message: string,
    type: "success" | "error" | "warning" | "info",
  ): void {
    const panelClass = `${type}-snackbar`;

    this.snackBar.open(message, "Close", {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: "right",
      verticalPosition: "top",
    });
  }

  closeDialog(): void {
    void this.confirmLeaveIfDirty().then((canClose) => {
      if (!canClose) {
        return;
      }

      this.dialogRef.close({
        success: false,
        hasUnsavedChanges: this.hasUnsavedChanges,
        timestamp: new Date(),
      });
    });
  }

  private async confirmLeaveIfDirty(): Promise<boolean> {
    if (!this.hasUnsavedChanges) {
      return true;
    }

    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Unsaved changes",
        message: "You have unsaved changes. Close without saving?",
        subMessage: "Edits on this tab will be lost.",
        confirmText: "Close",
        cancelText: "Stay",
        type: "warning",
      },
    });

    return !!(await firstValueFrom(dialogRef.afterClosed()));
  }

  private async confirmResetForm(): Promise<boolean> {
    if (!this.hasUnsavedChanges) {
      return true;
    }

    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Reset form",
        message: "Reset this form? Unsaved changes will be lost.",
        subMessage: "",
        confirmText: "Reset",
        cancelText: "Stay",
        type: "warning",
      },
    });

    return !!(await firstValueFrom(dialogRef.afterClosed()));
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, "medium") || "";
  }

  getFormErrors(formName: "document" | "support" = "document"): string[] {
    return formName === "document"
      ? this.documentFormErrors
      : this.supportFormErrors;
  }

  isDocumentFormValid(): boolean {
    return this.documentAddForm.valid && this.documentFormErrors.length === 0;
  }

  isSupportFormValid(): boolean {
    return this.supportCommentForm.valid && this.supportFormErrors.length === 0;
  }

  getCurrentTabLabel(): string {
    const tabs = ["Miscellaneous", "Add Other Document", "Add Other Support"];
    return tabs[this.currentTabIndex] || "Unknown";
  }

  markFormGroupTouched(formGroup: UntypedFormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof UntypedFormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasFormErrors(): boolean {
    return (
      this.documentFormErrors.length > 0 || this.supportFormErrors.length > 0
    );
  }

  getAllFormData(): any {
    return {
      documentData: this.documentAddForm.value,
      supportData: this.supportCommentForm.value,
      selectedFile: this.selectedFile,
      selectedSupportFile: this.selectedSupportFile,
      submissionComment: this.submissionComment,
      hasUnsavedChanges: this.hasUnsavedChanges,
    };
  }

  private updateCurrentDate(): void {
    this.currentDate = this.formatDate(new Date());

    this.dateUpdateInterval = setInterval(() => {
      this.currentDate = this.formatDate(new Date());
      this.cd.detectChanges();
    }, 60000);
  }

  // Helper to check if validity rules should be shown
  showValidityRules(): boolean {
    const docType = this.documentAddForm?.get(
      "documentDetailsForm.docType",
    )?.value;
    const entType = this.documentAddForm?.get(
      "documentDetailsForm.entType",
    )?.value;

    // Show only for Attachment type AND when entType is not "N" (NA)
    return docType === "A" && entType !== "N";
  }
}
