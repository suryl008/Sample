import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ValidationErrors,
  AbstractControl,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { HttpClient } from "@angular/common/http";
import { Observable, Subscription } from "rxjs";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-additional-support-dialog",
  templateUrl: "./additional-support-dialog.component.html",
  styleUrls: ["./additional-support-dialog.component.scss"],
  providers: [DatePipe],
})
export class AdditionalSupportDialogComponent implements OnInit, OnDestroy {
  // Form Groups
  documentAddForm: FormGroup;
  supportCommentForm: FormGroup;

  // Form data
  formDetails: any = null;
  attachmentDetails: any = { details: { fileTypeAppl: false }, types: [] };
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
  validityComment: string = "";

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
    private fb: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<AdditionalSupportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
    this.updateCurrentDate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForms(): void {
    // Document form
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
        entType: ["N", Validators.required],
        submissionComment: [""],
        validityComment: [""],
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
      submissionComment: [""],
    });

    // Initialize radio groups
    this.uploadDocTypeValue = "E";
    this.uploadSupportTypeValue = "E";
  }

  private setupFormListeners(): void {
    // Listen to document type changes
    const docTypeSub = this.documentAddForm
      .get("documentDetailsForm.docType")
      ?.valueChanges.subscribe((value) => {
        if (value === "F") {
          this.documentAddForm
            .get("documentDetailsForm.entType")
            ?.setValue("N");
        }
        this.hasUnsavedChanges = true;
      });

    if (docTypeSub) {
      this.subscriptions.add(docTypeSub);
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
    // Load document categories
    this.getDocCategoryList();

    // Load comment types
    this.getCommentTypeList();
  }

  // Tab change handler
  tabChanged(event: MatTabChangeEvent): void {
    this.currentTabIndex = event.index;

    // Check for unsaved changes
    if (this.hasUnsavedChanges) {
      const confirmChange = confirm(
        "You have unsaved changes. Are you sure you want to switch tabs?",
      );
      if (!confirmChange) {
        // Delay to prevent immediate tab switch
        setTimeout(() => {
          // This would require access to MatTabGroup
        }, 0);
        return;
      }
    }
  }

  // Document type change handler
  onDocumentTypeChange(type: string): void {
    const docType = type === "Attachment" ? "A" : "F";
    this.documentAddForm.get("documentDetailsForm.docType")?.setValue(docType);
  }

  // Validity type change handler
  onValidityTypeChange(type: string): void {
    const entType = type === "NA" ? "N" : type === "Date" ? "D" : "U";
    this.documentAddForm.get("documentDetailsForm.entType")?.setValue(entType);
  }

  // File selection handler
  onFileSelected(
    event: Event,
    type: "document" | "support" = "document",
  ): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      this.showMessage(validation.error, "error");
      input.value = ""; // Clear file input
      return;
    }

    if (type === "document") {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      // Convert to base64 immediately
      this.convertFileToBase64(file, "document");
    } else {
      this.selectedSupportFile = file;
      this.selectedSupportFileName = file.name;
      // Convert to base64 immediately
      this.convertFileToBase64(file, "support");
    }

    this.hasUnsavedChanges = true;
    this.cd.detectChanges();
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // Check file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error:
          "File type not allowed. Allowed types: PDF, Word, Excel, Images, Text",
      };
    }

    return { isValid: true };
  }

  // Convert file to base64
  private convertFileToBase64(file: File, type: "document" | "support"): void {
    this.showSpinner = true;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64 = reader.result as string;

      if (type === "document") {
        this.base64Document = base64.split(",")[1]; // Remove data URL prefix
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

  // Upload document (for preview or validation)
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

    // Simulate upload process
    setTimeout(() => {
      this.showSpinner = false;
      this.showMessage("File ready for submission", "success");
    }, 1000);
  }

  // Upload support document
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

    // Simulate upload process
    setTimeout(() => {
      this.showSpinner = false;
      this.showMessage("Support file ready for submission", "success");
    }, 1000);
  }

  // Get form event from child component
  getFormEvent(val: any): void {
    this.formDetails = val;
    this.hasUnsavedChanges = true;
    console.log("Form details received:", this.formDetails);
  }

  // Get attachment event from child component
  getAttachmentEventForm(val: any): void {
    this.attachmentDetails = val;
    this.hasUnsavedChanges = true;
    console.log("Attachment details received:", this.attachmentDetails);
  }

  // Save document - COMPLETE METHOD
  saveDocument(): void {
    // Validate form
    this.updateDocumentFormErrors();
    if (this.documentFormErrors.length > 0) {
      this.showMessage("Please fix all errors before saving", "error");
      return;
    }

    const docType = this.documentAddForm.get(
      "documentDetailsForm.docType",
    )?.value;
    const docDetails = this.documentAddForm.get("documentDetailsForm")?.value;

    // Validate based on document type
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

    if (
      docType === "A" &&
      this.attachmentDetails.types.length === 0 &&
      this.attachmentDetails.details.fileTypeAppl
    ) {
      this.showMessage("Please select at least one file type", "error");
      return;
    }

    this.isSaving = true;
    this.showSpinner = true;

    // Prepare document data
    const documentData = {
      // Basic document info
      documentName: docDetails.docName,
      documentCategory: docDetails.docCat,
      documentType: docDetails.docType,
      entityType: docDetails.entType,

      // Context info
      programId: this.directorVisitSelectedData.programId,
      programName: this.directorVisitSelectedData.programName,
      reviewType: this.directorVisitSelectedData.rvw_type,
      reviewTypeDesc: this.directorVisitSelectedData.rvw_type_desc,
      subRecipientId: this.directorVisitSelectedData.sub_rec_cd,
      subRecipientName: this.directorVisitSelectedData.sub_rec_name,
      subRvwId: this.directorVisitSelectedData.subRvwId,

      // User info
      userId: this.userDetails?.userId || 0,
      userName: this.userDetails?.fullName || "Unknown",
      userEmail: this.userDetails?.email || "",

      // Upload info
      uploadType: this.uploadDocTypeValue,
      fileName: this.selectedFile ? this.selectedFileName : null,
      fileSize: this.selectedFile ? this.selectedFile.size : null,
      fileType: this.selectedFile ? this.selectedFile.type : null,
      fileData: this.base64Document,

      // Rules and details
      attachmentDetails: docType === "A" ? this.attachmentDetails : null,
      formDetails: docType === "F" ? this.formDetails : null,

      // Comments
      validityComment: docDetails.validityComment,
      submissionComment: docDetails.submissionComment,

      // Status and dates
      status: "Pending",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      // Metadata
      isActive: true,
      version: 1,
      checksum: this.generateChecksum(),
    };

    console.log("Saving document:", documentData);

    // Call API service
    this.consolidatedReviewService
      .saveAdditionalDocument(documentData)
      .subscribe({
        next: (response) => {
          this.showSpinner = false;
          this.isSaving = false;
          this.hasUnsavedChanges = false;

          this.showMessage("Document saved successfully!", "success");

          this.dialogRef.close({
            success: true,
            type: "document",
            data: documentData,
            response: response,
            timestamp: new Date(),
          });
        },
        error: (error) => {
          console.error("Error saving document:", error);
          this.showSpinner = false;
          this.isSaving = false;

          let errorMessage = "Error saving document";
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }

          this.showMessage(errorMessage, "error");
        },
        complete: () => {
          this.showSpinner = false;
          this.isSaving = false;
        },
      });
  }

  // Save support - COMPLETE METHOD
  saveSupport(): void {
    // Validate form
    this.updateSupportFormErrors();
    if (this.supportFormErrors.length > 0) {
      this.showMessage("Please fix all errors before saving", "error");
      return;
    }

    const supportDetails = this.supportCommentForm.value;

    // Validate file upload
    if (this.uploadSupportTypeValue === "E" && !this.selectedSupportFile) {
      this.showMessage("Please upload a file or select Hard Copy", "error");
      return;
    }

    this.isSaving = true;
    this.showSpinner = true;

    // Prepare support data
    const supportData = {
      // Comment info
      commentType: supportDetails.commentType,
      comment: supportDetails.comment,
      commentTitle: `Comment by ${this.userDetails?.fullName || "User"}`,
      submissionComment: supportDetails.submissionComment,

      // Context info
      programId: this.directorVisitSelectedData.programId,
      programName: this.directorVisitSelectedData.programName,
      reviewType: this.directorVisitSelectedData.rvw_type,
      reviewTypeDesc: this.directorVisitSelectedData.rvw_type_desc,
      subRecipientId: this.directorVisitSelectedData.sub_rec_cd,
      subRecipientName: this.directorVisitSelectedData.sub_rec_name,
      subRvwId: this.directorVisitSelectedData.subRvwId,

      // User info
      userId: this.userDetails?.userId || 0,
      userName: this.userDetails?.fullName || "Unknown",
      userEmail: this.userDetails?.email || "",

      // Upload info
      uploadType: this.uploadSupportTypeValue,
      fileName: this.selectedSupportFile ? this.selectedSupportFileName : null,
      fileSize: this.selectedSupportFile ? this.selectedSupportFile.size : null,
      fileType: this.selectedSupportFile ? this.selectedSupportFile.type : null,
      fileData: this.base64Support,

      // Status and dates
      status: "Active",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      // Metadata
      isResolved: false,
      priority: "Medium",
      category: "Additional Support",

      // Audit info
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    console.log("Saving support:", supportData);

    // Call API service
    this.consolidatedReviewService.saveSupportComment(supportData).subscribe({
      next: (response) => {
        this.showSpinner = false;
        this.isSaving = false;
        this.hasUnsavedChanges = false;

        this.showMessage("Support comment saved successfully!", "success");

        this.dialogRef.close({
          success: true,
          type: "support",
          data: supportData,
          response: response,
          timestamp: new Date(),
        });
      },
      error: (error) => {
        console.error("Error saving support comment:", error);
        this.showSpinner = false;
        this.isSaving = false;

        let errorMessage = "Error saving support comment";
        if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }

        this.showMessage(errorMessage, "error");
      },
      complete: () => {
        this.showSpinner = false;
        this.isSaving = false;
      },
    });
  }

  // Get document category list
  getDocCategoryList(): void {
    this.showSpinner = true;

    // For demo - using local JSON
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getDocCategoryList.json")
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.documentCategoryList = [
              { refCode: "", refDesc: "Please Select" },
              ...res,
            ];
          } else {
            // Default categories if API fails
            this.documentCategoryList = [
              { refCode: "", refDesc: "Please Select" },
              { refCode: "CAT1", refDesc: "Category 1" },
              { refCode: "CAT2", refDesc: "Category 2" },
              { refCode: "CAT3", refDesc: "Category 3" },
            ];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading document categories:", error);
          // Load default categories
          this.documentCategoryList = [
            { refCode: "", refDesc: "Please Select" },
            { refCode: "CAT1", refDesc: "Financial Documents" },
            { refCode: "CAT2", refDesc: "Legal Documents" },
            { refCode: "CAT3", refDesc: "Technical Specifications" },
            { refCode: "CAT4", refDesc: "Meeting Minutes" },
            { refCode: "CAT5", refDesc: "Reports" },
          ];
          this.showSpinner = false;
        },
      });
  }

  // Get comment type list
  getCommentTypeList(): void {
    this.showSpinner = true;

    // For demo - using local JSON
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getCommentTypeList.json")
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.commentTypeList = [
              { refCode: "", refDesc: "Please Select" },
              ...res,
            ];
          } else {
            // Default types if API fails
            this.commentTypeList = [
              { refCode: "", refDesc: "Please Select" },
              { refCode: "GEN", refDesc: "General Comment" },
              { refCode: "ISS", refDesc: "Issue" },
              { refCode: "QUS", refDesc: "Question" },
              { refCode: "SUG", refDesc: "Suggestion" },
            ];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading comment types:", error);
          // Load default types
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
        },
      });
  }

  // FIXED: Update document form errors - Type-safe version
  private updateDocumentFormErrors(): void {
    this.documentFormErrors = [];

    if (!this.documentAddForm.valid) {
      // Get the documentDetailsForm form group with type casting
      const documentDetailsForm = this.documentAddForm.get(
        "documentDetailsForm",
      );

      if (documentDetailsForm && documentDetailsForm instanceof FormGroup) {
        // Get controls from the nested form group
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
              if (errors["pattern"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} has an invalid format`,
                );
              }
              if (errors["email"]) {
                this.documentFormErrors.push(
                  `${this.getFieldLabel(key)} must be a valid email`,
                );
              }
            }
          }
        });
      }
    }
  }

  // FIXED: Update support form errors
  private updateSupportFormErrors(): void {
    this.supportFormErrors = [];

    if (!this.supportCommentForm.valid) {
      // Get controls safely
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
            if (errors["pattern"]) {
              this.supportFormErrors.push(
                `${this.getFieldLabel(key)} has an invalid format`,
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
      commentType: "Comment Type",
      comment: "Comment",
      submissionComment: "Submission Comment",
      validityComment: "Validity Comment",
    };

    return labels[fieldName] || this.capitalizeFirstLetter(fieldName);
  }

  private capitalizeFirstLetter(text: string): string {
    return (
      text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, " $1")
    );
  }

  // Change upload type for document
  changeDocUploadType(value: string): void {
    this.uploadDocTypeValue = value;
    if (value !== "E") {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
    }
    this.hasUnsavedChanges = true;
  }

  // Change upload type for support
  changeSupportUploadType(value: string): void {
    this.uploadSupportTypeValue = value;
    if (value !== "E") {
      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
    }
    this.hasUnsavedChanges = true;
  }

  // Clear file selection
  clearFileSelection(type: "document" | "support" = "document"): void {
    if (type === "document") {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
    } else {
      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
    }
    this.hasUnsavedChanges = true;
    this.cd.detectChanges();
  }

  // Reset document form
  resetDocumentForm(): void {
    if (
      confirm(
        "Are you sure you want to reset the form? All unsaved changes will be lost.",
      )
    ) {
      this.documentAddForm.reset({
        documentDetailsForm: {
          docName: "",
          docCat: "",
          docType: "A",
          entType: "N",
          submissionComment: "",
          validityComment: "",
        },
      });

      this.selectedFile = null;
      this.selectedFileName = "";
      this.base64Document = "";
      this.uploadDocTypeValue = "E";
      this.formDetails = null;
      this.attachmentDetails = { details: { fileTypeAppl: false }, types: [] };

      this.documentFormErrors = [];
      this.hasUnsavedChanges = false;
    }
  }

  // Reset support form
  resetSupportForm(): void {
    if (
      confirm(
        "Are you sure you want to reset the form? All unsaved changes will be lost.",
      )
    ) {
      this.supportCommentForm.reset({
        commentType: "",
        comment: "",
        submissionComment: "",
      });

      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
      this.base64Support = "";
      this.uploadSupportTypeValue = "E";

      this.supportFormErrors = [];
      this.hasUnsavedChanges = false;
    }
  }

  // Show message
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

  // Close dialog
  closeDialog(): void {
    if (this.hasUnsavedChanges) {
      const confirmClose = confirm(
        "You have unsaved changes. Are you sure you want to close?",
      );
      if (!confirmClose) {
        return;
      }
    }

    this.dialogRef.close({
      success: false,
      hasUnsavedChanges: this.hasUnsavedChanges,
      timestamp: new Date(),
    });
  }

  // Helper methods
  private generateChecksum(): string {
    const data = JSON.stringify({
      timestamp: new Date().getTime(),
      user: this.userDetails?.userId,
      program: this.directorVisitSelectedData.programId,
    });

    // Simple checksum - in production use proper hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  private getClientIP(): string {
    // This is a placeholder - in production, get from server or use a service
    return "127.0.0.1";
  }

  // Format date for display
  formatDate(date: Date): string {
    return this.datePipe.transform(date, "medium") || "";
  }

  // Get form errors for display
  getFormErrors(formName: "document" | "support" = "document"): string[] {
    return formName === "document"
      ? this.documentFormErrors
      : this.supportFormErrors;
  }

  // Check if form is valid
  isDocumentFormValid(): boolean {
    return this.documentAddForm.valid && this.documentFormErrors.length === 0;
  }

  isSupportFormValid(): boolean {
    return this.supportCommentForm.valid && this.supportFormErrors.length === 0;
  }

  // Get current tab label
  getCurrentTabLabel(): string {
    const tabs = ["Miscellaneous", "Add Other Document", "Add Other Support"];
    return tabs[this.currentTabIndex] || "Unknown";
  }

  // Additional helper methods for form validation
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Check if form has errors
  hasFormErrors(): boolean {
    return (
      this.documentFormErrors.length > 0 || this.supportFormErrors.length > 0
    );
  }

  // Get all form data
  getAllFormData(): any {
    return {
      documentData: this.documentAddForm.value,
      supportData: this.supportCommentForm.value,
      selectedFile: this.selectedFile,
      selectedSupportFile: this.selectedSupportFile,
      hasUnsavedChanges: this.hasUnsavedChanges,
    };
  }

  private updateCurrentDate(): void {
    this.currentDate = this.formatDate(new Date());

    // Update every minute if you want it to stay current
    setInterval(() => {
      this.currentDate = this.formatDate(new Date());
      this.cd.detectChanges();
    }, 60000); // Update every minute
  }
}
