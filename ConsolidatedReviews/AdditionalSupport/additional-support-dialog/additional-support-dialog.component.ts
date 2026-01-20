import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { HttpClient } from "@angular/common/http";
import { Observable, ReplaySubject } from "rxjs";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { SharedService } from "src/app/shared/services/shared.service";

@Component({
  selector: "app-additional-support-dialog",
  templateUrl: "./additional-support-dialog.component.html",
  styleUrls: ["./additional-support-dialog.component.scss"],
})
export class AdditionalSupportDialogComponent implements OnInit {
  documentAddForm: FormGroup;

  // Form data
  formDetails: any;
  attachmentDetails: any = { details: { fileTypeAppl: false }, types: [] };
  userDetails: any;
  directorVisitSelectedData: any = {};

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

  // File handling
  selectedFile: File | null = null;
  selectedFileName: string = "";
  selectedSupportFile: File | null = null;
  selectedSupportFileName: string = "";

  // State
  showSpinner: boolean = false;
  isAddOrEdit: boolean = false;
  currentTabIndex: number = 0;

  // Form controls
  fileUploadCtrl = new FormControl();

  constructor(
    private fb: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AdditionalSupportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.documentAddForm = this.fb.group({
      documentDetailsForm: this.fb.group({
        docName: ["", [Validators.required, Validators.minLength(2)]],
        docCat: ["", Validators.required],
        docType: ["A", Validators.required], // Default to Attachment
        entType: ["N", Validators.required], // Default to NA
        defaultDoc: [""],
        inactive: [false],
      }),
    });

    // Set initial values
    this.documentAddForm.get("documentDetailsForm.docType")?.setValue("A");
    this.documentAddForm.get("documentDetailsForm.entType")?.setValue("N");
  }

  private loadInitialData(): void {
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.isAddOrEdit = this.sharedService.checkIsAddOrEdit("PgmAdmin");
    this.directorVisitSelectedData = this.data?.directorVisitSelectedData || {};

    this.getDocCategoryList();
    this.getCommentTypeList();
  }

  // Tab change handler
  tabChanged(event: MatTabChangeEvent): void {
    this.currentTabIndex = event.index;
  }

  // Document type change handler
  onDocumentTypeChange(type: string): void {
    const docType = type === "Attachment" ? "A" : "F";
    this.documentAddForm.get("documentDetailsForm.docType")?.setValue(docType);

    // Reset validity type when switching to Form
    if (docType === "F") {
      this.documentAddForm.get("documentDetailsForm.entType")?.setValue("N");
    }
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

    if (type === "document") {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedSupportFile = file;
      this.selectedSupportFileName = file.name;
    }

    this.cd.detectChanges();
  }

  // Convert file to base64
  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      result.next((event.target as any).result.toString());
    };
    return result;
  }

  // Upload document
  uploadDocument(): void {
    if (!this.selectedFile) return;

    this.showSpinner = true;
    this.convertFile(this.selectedFile).subscribe({
      next: (base64) => {
        console.log(
          "File converted to base64:",
          base64.substring(0, 100) + "...",
        );
        // Here you would typically send the base64 to your API
        this.showSpinner = false;
        // Show success message
      },
      error: (error) => {
        console.error("Error converting file:", error);
        this.showSpinner = false;
        // Show error message
      },
    });
  }

  // Upload support document
  uploadSupportDocument(): void {
    if (!this.selectedSupportFile) return;

    this.showSpinner = true;
    this.convertFile(this.selectedSupportFile).subscribe({
      next: (base64) => {
        console.log("Support file converted to base64");
        this.showSpinner = false;
        // Show success message
      },
      error: (error) => {
        console.error("Error converting support file:", error);
        this.showSpinner = false;
        // Show error message
      },
    });
  }

  // Get form event from child component
  getFormEvent(val: any): void {
    this.formDetails = val;
    console.log("Form details received:", this.formDetails);
  }

  // Get attachment event from child component
  getAttachmentEventForm(val: any): void {
    this.attachmentDetails = val;
    console.log("Attachment details received:", this.attachmentDetails);
  }

  // Save document
  saveDocument(): void {
    if (this.documentAddForm.invalid) {
      this.markFormGroupTouched(this.documentAddForm);
      return;
    }

    this.showSpinner = true;

    const formData = {
      ...this.documentAddForm.get("documentDetailsForm")?.value,
      attachmentDetails: this.attachmentDetails,
      formDetails: this.formDetails,
      uploadType: this.uploadDocTypeValue,
    };

    console.log("Saving document:", formData);

    // Simulate API call
    setTimeout(() => {
      this.showSpinner = false;
      this.dialogRef.close({ success: true, type: "document", data: formData });
    }, 1000);
  }

  // Save support
  saveSupport(): void {
    if (!this.supportComment.trim()) {
      // Show validation error
      return;
    }

    this.showSpinner = true;

    const supportData = {
      commentType: this.selectedCommentType,
      comment: this.supportComment,
      uploadType: this.uploadSupportTypeValue,
      user: this.userDetails,
    };

    console.log("Saving support:", supportData);

    // Simulate API call
    setTimeout(() => {
      this.showSpinner = false;
      this.dialogRef.close({
        success: true,
        type: "support",
        data: supportData,
      });
    }, 1000);
  }

  // Change upload type for document
  changeDocUploadType(value: string): void {
    this.uploadDocTypeValue = value;
    if (value !== "E") {
      this.selectedFile = null;
      this.selectedFileName = "";
    }
  }

  // Change upload type for support
  changeSupportUploadType(value: string): void {
    this.uploadSupportTypeValue = value;
    if (value !== "E") {
      this.selectedSupportFile = null;
      this.selectedSupportFileName = "";
    }
  }

  // Get document category list
  getDocCategoryList(): void {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getDocCategoryList.json")
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.documentCategoryList = [
              { refCode: "", refDesc: "Please Select" },
              ...res,
            ];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading document categories:", error);
          this.showSpinner = false;
        },
      });
  }

  // Get comment type list
  getCommentTypeList(): void {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getCommentTypeList.json")
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.commentTypeList = [
              { refCode: "", refDesc: "Please Select" },
              ...res,
            ];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading comment types:", error);
          this.showSpinner = false;
        },
      });
  }

  // Helper to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Close dialog
  closeDialog(): void {
    this.dialogRef.close();
  }
}

// import {
//   ChangeDetectorRef,
//   Component,
//   EventEmitter,
//   Inject,
//   OnInit,
//   Output,
// } from "@angular/core";
// import {
//   animate,
//   state,
//   style,
//   transition,
//   trigger,
// } from "@angular/animations";
// import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
// import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
// import { SharedService } from "src/app/shared/services/shared.service";
// import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
// import { MatTabChangeEvent } from "@angular/material/tabs";
// import { Observable, ReplaySubject } from "rxjs";

// @Component({
//   selector: "app-additional-support-dialog",
//   templateUrl: "./additional-support-dialog.component.html",
//   styleUrls: ["./additional-support-dialog.component.scss"],
//   animations: [
//     trigger("detailExpand", [
//       state("collapsed", style({ height: "0px", minHeight: "0" })),
//       state("expanded", style({ height: "*" })),
//       transition(
//         "expanded <=> collapsed",
//         animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
//       ),
//     ]),
//   ],
// })
// export class AdditionalSupportDialogComponent implements OnInit {
//   [x: string]: any;
//   @Output() emitService = new EventEmitter();
//   title = "angular-mat-table-example";
//   isEdit = false;
//   documentAddForm: FormGroup;
//   formDetails: any;
//   attachmentDetails: any = { details: { fileTypeAppl: false }, types: [] };
//   userDetails: any;
//   public directorVisitSelectedData: any = {};
//   public commentTypeList: any = [];
//   public docUploadType: any;
//   public validityType: any;
//   public formType: any;
//   public documentCategoryList: any = [];
//   public docType = "Attachment";
//   public valType = "NA";
//   public uploadDocTypeValue = "E";
//   public uploadSupportTypeValue = "E";
//   contactTypeList: any = [];
//   newObject: any = {};
//   addDocumentFrom: FormGroup;
//   showSpinner: boolean = false;
//   public isAddOrEdit: boolean = false;

//   constructor(
//     public fb: FormBuilder,
//     private programAdministrationService: ProgramAdministrationService,
//     private consolidatedReviewService: ConsolidatedReviewService,
//     private sharedService: SharedService,
//     private cd: ChangeDetectorRef,
//     public dialogRef: MatDialogRef<AdditionalSupportDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any
//   ) {
//     this.documentAddForm = fb.group({
//       documentDetailsForm: fb.group({
//         docName: ["", Validators.required],
//         docCat: ["", Validators.required],
//         docType: ["", Validators.required],
//         entType: ["", Validators.required],
//         defaultDoc: [""],
//         inactive: [false],
//       }),
//     });
//   }

//   ngOnInit(): void {
//     this.userDetails = this.programAdministrationService.getUserDetails();
//     this.isAddOrEdit = this.sharedService.checkIsAddOrEdit("PgmAdmin");
//     this.documentListFormInit();
//     // this.getEmailTemplates();
//     // this.getAllContactTypeLookup();

//     this.formType = [
//       { type: "Attachment", value: "A", active: true },
//       { type: "Form", value: "F", active: false },
//     ];

//     this.validityType = [
//       { type: "NA", value: "N", active: true },
//       { type: "Date", value: "D", active: false },
//       { type: "Units", value: "U", active: false },
//     ];

//     this.docUploadType = [
//       { type: "Electronic", value: "E", active: true },
//       { type: "Hard Copy", value: "H", active: false },
//     ];

//     this.directorVisitSelectedData = this.data?.directorVisitSelectedData;
//     console.log(this.directorVisitSelectedData);

//     this.getDocCategoryList();
//     this.getCommentTypeList();
//   }

//   onDocumentTypeChange(type: any) {
//     console.log(type);
//     this.docType = type;
//     this.valType = "NA";
//   }

//   onValidityTypeChange(type: any) {
//     this.valType = type;
//   }

//   documentListFormInit() {
//     this.documentAddForm = this.fb.group({
//       name: [""],
//       documentDetailsForm: this.fb.group({
//         docName: ["", Validators.required],
//         docType: ["", Validators.required],
//         entType: ["", Validators.required],
//         defaultDoc: [""],
//         inactive: [false],
//       }),
//     });
//   }

//   select() {}

//   tabChangeEvent(tabChangeEvent: MatTabChangeEvent): void {
//     tabChangeEvent.tab.textLabel === "Reminder"
//       ? (this.addReminder = true)
//       : (this.addReminder = false);
//   }
//   saveDocument() {}

//   onChangeEmail(email: any) {
//     this.emailTemplate = email;
//     this.newObject.emailTemplateId = email.emailTemplateId;
//   }

//   getAllContactTypeLookup() {
//     this.programInspirationService
//       .subscriptionTypeLookup("CTY", "A,G")
//       .subscribe((res: any) => {
//         console.log(res);
//       });
//   }

//   getEmailTemplates() {
//     this.programAdministrationService
//       .getEmailTemplates()
//       .subscribe((res: any) => {
//         if (res != null) {
//           this.emailTemplateList = res;
//         }
//       });
//   }

//   GetFormEvent(val: any) {
//     this.formDetails = val;
//   }

//   GetAttachmentEventForm(val: any) {
//     this.attachmentDetails = val;
//   }

//   closeForm(val: any) {
//     console.log(val);
//     if (val.data === "close") {
//       this.isReminderForm = false;
//     }
//   }

//   disabledButton() {
//     let isButtonEnabled: boolean = true;
//     var valdocName =
//       this.documentAddForm.controls.documentDetailsForm.value.docName;
//     var valdocCat =
//       this.documentAddForm.controls.documentDetailsForm.value.docCat;
//     var valdocType =
//       this.documentAddForm.controls.documentDetailsForm.value.docType;
//     var valentType =
//       this.documentAddForm.controls.documentDetailsForm.value.entType;
//     if (
//       valdocName.trim() !== "" &&
//       valdocCat.trim() !== "" &&
//       valdocType.trim() !== "" &&
//       valentType.trim() !== ""
//     ) {
//       isButtonEnabled = false;
//     }
//     return isButtonEnabled;
//   }

//   saveOverallComment() {}

//   closePopup(data) {
//     this.dialogRef.close({
//       pageName: this.pageName,
//       data: data,
//       entidata: [this.entidata],
//     });
//   }
//   getDocCategoryList() {
//     this.documentcategoryList = [];
//     this.documentcategoryList.push({
//       refCode: "",
//       refDesc: "Please Select",
//     });
//     // this.consolidatedReviewService
//     //   .getConsRefDataInfo("DCT", "000000")
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/getDocCategoryList.json")
//       .toPromise()
//       .then((res: any) => {
//         if (res != null && res.length > 0) {
//           console.log(res);
//           res.forEach((element: any) => {
//             this.documentcategoryList.push(element);
//           });
//         }
//       });
//   }

//   getCommentTypeList() {
//     this.commentTypeList = [];
//     this.commentTypeList.push({
//       refCode: "",
//       refDesc: "Please Select",
//     });
//     // this.consolidatedReviewService
//     //   .getConsRefDataInfo("STY", "000000")
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/getCommentTypeList.json")
//       .toPromise()
//       .then((res: any) => {
//         if (res != null && res.length > 0) {
//           console.log(res);
//           res.forEach((element: any) => {
//             this.commentTypeList.push(element);
//           });
//         }
//       });
//   }

//   onFileSelected(event) {
//     this.fileToUpload = event.target.files[0];
//     this.convertFile(this.fileToUpload).subscribe((base64) => {
//       this.base64Output = base64;
//     });
//   }

//   convertFile(file: File): Observable<string> {
//     const result = new ReplaySubject<string>(1);
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (event) => {
//       result.next((<any>event.target).result.toString());
//     };
//     return result;
//   }
//   async changeSupportUploadTypeValue(type: any) {
//     this.uploadSupportTypeValue = type;
//   }

//   onclick = () => {
//     const btn = document.getElementById("flip-content");
//     const content = document.getElementById("f1_card1") as HTMLElement;
//     content.classList.toggle("flip");
//     this.flip = !this.flip;
//   };

//   cancelFlip() {
//     this.flip = !this.flip;
//   }
// }
