import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
  Inject,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
} from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { of, Subject } from "rxjs";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface SubRecipient {
  agency_id: number;
  sub_rec_cd: string;
  sub_rec_name: string;
  sub_rec_type_label: string;
}

interface DialogData {
  pageName: string;
  mode: string;
  headerName: string;
  subrecData: any;
  grantPgmId: number;
  currentTabId: string;
  currentTabTitle: string;
}

@Component({
  selector: "app-add-sub-recipient",
  templateUrl: "./add-sub-recipient.component.html",
  styleUrls: ["./add-sub-recipient.component.scss"],
})
export class AddSubRecipientComponent implements OnInit, OnChanges {
  @Output() formItemEvent = new EventEmitter<any>();

  // Form Controls
  searchFormRulesCtrl = new FormControl();
  formRulesForm: FormGroup;

  // Data
  allFormRules: SubRecipient[] = [];
  filteredFormRules: SubRecipient[] = [];
  selectedSubRecipient: SubRecipient | null = null;
  isLoading = false;
  errorMsg = "";
  showSpinner: boolean = false;
  totalCount: number = 0;
  maxResults: number = 10;
  grantPgmId: number = 570; // Default value

  // Search subject for debouncing API calls
  private searchSubject = new Subject<string>();

  constructor(
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddSubRecipientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.initializeForms();
    this.setupSearchSubscription();

    // Set grantPgmId from dialog data
    if (this.data?.grantPgmId) {
      this.grantPgmId = this.data.grantPgmId;
    }
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupFormChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Remove isDocModelEdit logic if not needed
  }

  private initializeForms(): void {
    this.formRulesForm = this.formBuilder.group({
      formId: ["", Validators.required],
    });
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading = true;
          this.errorMsg = "";
        }),
        switchMap((searchTerm) => {
          if (!searchTerm || searchTerm.length < 2) {
            this.filteredFormRules = [];
            this.totalCount = 0;
            this.isLoading = false;
            return of({ data: [], totalCount: 0 });
          }

          // Create payload with current grantPgmId
          const payload = {
            input: searchTerm,
            maxResults: this.maxResults,
            grantPgmId: this.grantPgmId, // Use the grantPgmId from dialog data
          };

          // Log for debugging
          console.log(
            "Searching with grantPgmId:",
            this.grantPgmId,
            "for term:",
            searchTerm,
          );

          return this.httpClient
            .get<
              any[]
            >("assets/api-data/ConsolidatedReview/GetConsSubRecInfoAuto.json")
            .pipe(
              catchError((error) => {
                console.error("Search error:", error);
                this.errorMsg =
                  "Error searching sub-recipients. Please try again.";
                return of({ data: [], totalCount: 0 });
              }),
            );
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          // Handle the response structure from your JSON
          if (Array.isArray(response) && response.length >= 2) {
            const dataArray = response[0] || [];
            const countArray = response[1] || [];

            this.allFormRules = dataArray.map((item: any) => ({
              agency_id: item.agency_id || 0,
              sub_rec_cd: item.sub_rec_cd || "",
              sub_rec_name: item.sub_rec_name || "",
              sub_rec_type_label: item.sub_rec_type_label || "",
            }));

            this.filteredFormRules = [...this.allFormRules];

            // Extract total count from second array
            if (countArray.length > 0 && countArray[0].Column1) {
              this.totalCount = countArray[0].Column1;
            } else {
              this.totalCount = dataArray.length;
            }
          } else {
            this.allFormRules = [];
            this.filteredFormRules = [];
            this.totalCount = 0;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = "Error loading sub-recipients. Please try again.";
          console.error("Error loading sub-recipients:", error);
          this.allFormRules = [];
          this.filteredFormRules = [];
          this.totalCount = 0;
        },
      });
  }

  private initializeData(): void {
    // If data is passed when opening dialog, populate the form
    if (this.data) {
      this.populateFormData();
    }

    // Always enable the form for dialog
    this.formRulesForm.enable();
    this.searchFormRulesCtrl.enable();
  }

  private populateFormData(): void {
    if (!this.data) return;

    // Check if subrecData contains a selected sub-recipient
    if (this.data.subrecData && this.data.subrecData.sub_rec_name) {
      const subRecipient: SubRecipient = {
        agency_id: this.data.subrecData.agency_id || 0,
        sub_rec_cd: this.data.subrecData.sub_rec_cd || "",
        sub_rec_name: this.data.subrecData.sub_rec_name || "",
        sub_rec_type_label: this.data.subrecData.sub_rec_type_label || "",
      };

      // Set form values
      this.formRulesForm.patchValue({
        formId: this.data.subrecData.sub_rec_cd || "",
      });

      // Set selected sub-recipient
      this.selectedSubRecipient = subRecipient;
      this.searchFormRulesCtrl.setValue(subRecipient);
    }
  }

  private setupFormChanges(): void {
    this.searchFormRulesCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (searchTerm: string | SubRecipient) => {
          if (typeof searchTerm === "string") {
            // Trigger API search
            this.searchSubject.next(searchTerm);
          } else if (searchTerm && typeof searchTerm === "object") {
            // User selected an option
            this.selectedSubRecipient = searchTerm;
            this.formRulesForm.patchValue({
              formId: searchTerm.sub_rec_cd,
            });
            this.emitFormData();
          }
        },
      });

    this.formRulesForm.valueChanges.subscribe(() => {
      this.emitFormData();
    });
  }

  // Public Methods
  displayWithForm(value: SubRecipient): string {
    if (!value) return "";
    if (typeof value === "string") return value;

    return value.sub_rec_name || value.sub_rec_cd || "";
  }

  onSelect(subRecipient: SubRecipient): void {
    if (!subRecipient) return;

    this.selectedSubRecipient = subRecipient;

    this.formRulesForm.patchValue({
      formId: subRecipient.sub_rec_cd,
    });

    this.searchFormRulesCtrl.setValue(subRecipient);
    this.emitFormData();
  }

  clearSelection(): void {
    this.selectedSubRecipient = null;
    this.searchFormRulesCtrl.setValue("");
    this.filteredFormRules = [];
    this.totalCount = 0;

    this.formRulesForm.patchValue({
      formId: "",
    });

    this.emitFormData();
  }

  saveForm(): void {
    if (this.formRulesForm.valid && this.selectedSubRecipient) {
      const formData = this.getFormData();

      // Add additional data from dialog
      formData.grantPgmId = this.grantPgmId;
      formData.currentTabId = this.data?.currentTabId;
      formData.currentTabTitle = this.data?.currentTabTitle;

      // Emit the data and close the dialog
      this.formItemEvent.emit(formData);
      this.closePopup(formData);
    } else {
      this.markFormAsTouched();
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.formRulesForm.controls).forEach((key) => {
      const control = this.formRulesForm.get(key);
      control?.markAsTouched();
    });
  }

  private emitFormData(): void {
    if (this.formRulesForm.valid && this.selectedSubRecipient) {
      this.formItemEvent.emit(this.getFormData());
    }
  }

  getFormData(): any {
    return {
      formId: this.formRulesForm.get("formId")?.value,
      selectedSubRecipient: this.selectedSubRecipient,
      sub_rec_name: this.selectedSubRecipient?.sub_rec_name,
      sub_rec_cd: this.selectedSubRecipient?.sub_rec_cd,
      agency_id: this.selectedSubRecipient?.agency_id,
      sub_rec_type_label: this.selectedSubRecipient?.sub_rec_type_label,
      grantPgmId: this.grantPgmId,
    };
  }

  closePopup(result?: any): void {
    this.dialogRef.close(result);
  }

  // Form Validation Helpers
  isFormValid(): boolean {
    return this.formRulesForm.valid && this.selectedSubRecipient !== null;
  }
}
// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   SimpleChanges,
//   OnChanges,
//   Inject,
// } from "@angular/core";
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   Validators,
// } from "@angular/forms";
// import {
//   debounceTime,
//   distinctUntilChanged,
//   switchMap,
//   catchError,
//   tap,
// } from "rxjs/operators";
// import { HttpClient } from "@angular/common/http";
// import { of, Subject } from "rxjs";
// import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

// interface SubRecipient {
//   agency_id: number;
//   sub_rec_cd: string;
//   sub_rec_name: string;
//   sub_rec_type_label: string;
// }

// @Component({
//   selector: "app-add-sub-recipient",
//   templateUrl: "./add-sub-recipient.component.html",
//   styleUrls: ["./add-sub-recipient.component.scss"],
// })
// export class AddSubRecipientComponent implements OnInit, OnChanges {
//   @Output() formItemEvent = new EventEmitter<any>();

//   // Form Controls
//   searchFormRulesCtrl = new FormControl();
//   formRulesForm: FormGroup;

//   // Data
//   allFormRules: SubRecipient[] = [];
//   filteredFormRules: SubRecipient[] = [];
//   selectedSubRecipient: SubRecipient | null = null;
//   isLoading = false;
//   errorMsg = "";
//   showSpinner: boolean = false;
//   totalCount: number = 0;
//   maxResults: number = 10;
//   grantPgmId: number = 570;

//   // Search subject for debouncing API calls
//   private searchSubject = new Subject<string>();

//   constructor(
//     private httpClient: HttpClient,
//     private formBuilder: FormBuilder,
//     public dialogRef: MatDialogRef<AddSubRecipientComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//   ) {
//     this.initializeForms();
//     this.setupSearchSubscription();
//   }

//   ngOnInit(): void {
//     this.initializeData();
//     this.setupFormChanges();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     // Remove isDocModelEdit logic if not needed
//   }

//   private initializeForms(): void {
//     this.formRulesForm = this.formBuilder.group({
//       formId: ["", Validators.required],
//     });
//   }

//   private setupSearchSubscription(): void {
//     this.searchSubject
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged(),
//         tap(() => {
//           this.isLoading = true;
//           this.errorMsg = "";
//         }),
//         switchMap((searchTerm) => {
//           if (!searchTerm || searchTerm.length < 2) {
//             this.filteredFormRules = [];
//             this.totalCount = 0;
//             this.isLoading = false;
//             return of({ data: [], totalCount: 0 });
//           }

//           return this.httpClient
//             .get<
//               any[]
//             >("assets/api-data/ConsolidatedReview/GetConsSubRecInfoAuto.json")
//             .pipe(
//               catchError((error) => {
//                 console.error("Search error:", error);
//                 this.errorMsg =
//                   "Error searching sub-recipients. Please try again.";
//                 return of({ data: [], totalCount: 0 });
//               }),
//             );
//         }),
//       )
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;

//           // Handle the response structure from your JSON
//           if (Array.isArray(response) && response.length >= 2) {
//             const dataArray = response[0] || [];
//             const countArray = response[1] || [];

//             this.allFormRules = dataArray.map((item: any) => ({
//               agency_id: item.agency_id || 0,
//               sub_rec_cd: item.sub_rec_cd || "",
//               sub_rec_name: item.sub_rec_name || "",
//               sub_rec_type_label: item.sub_rec_type_label || "",
//             }));

//             this.filteredFormRules = [...this.allFormRules];

//             // Extract total count from second array
//             if (countArray.length > 0 && countArray[0].Column1) {
//               this.totalCount = countArray[0].Column1;
//             } else {
//               this.totalCount = dataArray.length;
//             }
//           } else {
//             this.allFormRules = [];
//             this.filteredFormRules = [];
//             this.totalCount = 0;
//           }
//         },
//         error: (error) => {
//           this.isLoading = false;
//           this.errorMsg = "Error loading sub-recipients. Please try again.";
//           console.error("Error loading sub-recipients:", error);
//           this.allFormRules = [];
//           this.filteredFormRules = [];
//           this.totalCount = 0;
//         },
//       });
//   }

//   private initializeData(): void {
//     // If data is passed when opening dialog, populate the form
//     if (this.data) {
//       this.populateFormData();
//     }

//     // Always enable the form for dialog
//     this.formRulesForm.enable();
//     this.searchFormRulesCtrl.enable();
//   }

//   private populateFormData(): void {
//     if (!this.data) return;

//     const subRecipient: SubRecipient = {
//       agency_id: this.data.agency_id || 0,
//       sub_rec_cd: this.data.sub_rec_cd || "",
//       sub_rec_name: this.data.sub_rec_name || "",
//       sub_rec_type_label: this.data.sub_rec_type_label || "",
//     };

//     // Set form values
//     this.formRulesForm.patchValue({
//       formId: this.data.sub_rec_cd || "",
//     });

//     // Set selected sub-recipient
//     if (this.data.sub_rec_name) {
//       this.selectedSubRecipient = subRecipient;
//       this.searchFormRulesCtrl.setValue(subRecipient);
//     }
//   }

//   private setupFormChanges(): void {
//     this.searchFormRulesCtrl.valueChanges
//       .pipe(debounceTime(300), distinctUntilChanged())
//       .subscribe({
//         next: (searchTerm: string | SubRecipient) => {
//           if (typeof searchTerm === "string") {
//             // Trigger API search
//             this.searchSubject.next(searchTerm);
//           } else if (searchTerm && typeof searchTerm === "object") {
//             // User selected an option
//             this.selectedSubRecipient = searchTerm;
//             this.formRulesForm.patchValue({
//               formId: searchTerm.sub_rec_cd,
//             });
//             this.emitFormData();
//           }
//         },
//       });

//     this.formRulesForm.valueChanges.subscribe(() => {
//       this.emitFormData();
//     });
//   }

//   // Public Methods
//   displayWithForm(value: SubRecipient): string {
//     if (!value) return "";
//     if (typeof value === "string") return value;

//     return value.sub_rec_name || value.sub_rec_cd || "";
//   }

//   onSelect(subRecipient: SubRecipient): void {
//     if (!subRecipient) return;

//     this.selectedSubRecipient = subRecipient;

//     this.formRulesForm.patchValue({
//       formId: subRecipient.sub_rec_cd,
//     });

//     this.searchFormRulesCtrl.setValue(subRecipient);
//     this.emitFormData();
//   }

//   clearSelection(): void {
//     this.selectedSubRecipient = null;
//     this.searchFormRulesCtrl.setValue("");
//     this.filteredFormRules = [];
//     this.totalCount = 0;

//     this.formRulesForm.patchValue({
//       formId: "",
//     });

//     this.emitFormData();
//   }

//   saveForm(): void {
//     if (this.formRulesForm.valid && this.selectedSubRecipient) {
//       const formData = this.getFormData();

//       // Emit the data and close the dialog
//       this.formItemEvent.emit(formData);
//       this.closePopup(formData);
//     } else {
//       this.markFormAsTouched();
//     }
//   }

//   private markFormAsTouched(): void {
//     Object.keys(this.formRulesForm.controls).forEach((key) => {
//       const control = this.formRulesForm.get(key);
//       control?.markAsTouched();
//     });
//   }

//   private emitFormData(): void {
//     if (this.formRulesForm.valid && this.selectedSubRecipient) {
//       this.formItemEvent.emit(this.getFormData());
//     }
//   }

//   getFormData(): any {
//     return {
//       formId: this.formRulesForm.get("formId")?.value,
//       selectedSubRecipient: this.selectedSubRecipient,
//       sub_rec_name: this.selectedSubRecipient?.sub_rec_name,
//       sub_rec_cd: this.selectedSubRecipient?.sub_rec_cd,
//       agency_id: this.selectedSubRecipient?.agency_id,
//       sub_rec_type_label: this.selectedSubRecipient?.sub_rec_type_label,
//     };
//   }

//   closePopup(result?: any): void {
//     this.dialogRef.close(result);
//   }

//   // Form Validation Helpers
//   isFormValid(): boolean {
//     return this.formRulesForm.valid && this.selectedSubRecipient !== null;
//   }
// }
