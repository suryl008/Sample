import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.css"],
})
export class FormComponent implements OnInit, OnChanges {
  @Output() formItemEvent = new EventEmitter<any>();
  @Input() data: any;
  @Input() isDocModelEdit: boolean = true;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;

  // Form Controls
  searchFormRulesCtrl = new FormControl();
  formRulesForm: FormGroup;
  dateRangeForm: FormGroup;

  // Data
  allFormRules: any[] = [];
  filteredFormRules: any[] = [];
  selectedFormRule: any = null;
  isLoading = false;
  errorMsg = "";

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.initializeData();
    this.loadAllFormRules();
    this.setupFormSearch();
    this.setupFormChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isDocModelEdit) {
      this.updateFormStates();
    }
  }

  private initializeForms(): void {
    // Main form rules form
    this.formRulesForm = this.formBuilder.group({
      helpTxt: ["", [Validators.required, Validators.minLength(10)]],
      formId: ["", Validators.required],
      isRequired: [false],
    });

    // Date range form
    this.dateRangeForm = this.formBuilder.group({
      start: ["", Validators.required],
      end: ["", Validators.required],
    });
  }

  private initializeData(): void {
    if (this.data && this.data !== "new") {
      this.populateFormData();
    }
    this.updateFormStates();
  }

  private populateFormData(): void {
    if (!this.data?.documentValue) return;

    const docValue = this.data.documentValue;

    // Set form values
    this.formRulesForm.patchValue({
      helpTxt: docValue.helpTxt || "",
      formId: docValue.formId || "",
      isRequired: docValue.isRequired || false,
    });

    // Set date range
    if (docValue.startDate || docValue.endDate) {
      this.dateRangeForm.patchValue({
        start: docValue.startDate ? new Date(docValue.startDate) : "",
        end: docValue.endDate ? new Date(docValue.endDate) : "",
      });
    }

    // Set selected form rule if available
    if (docValue.formDescription || docValue.formCode) {
      this.selectedFormRule = {
        formDescription: docValue.formDescription,
        formCode: docValue.formCode,
        formMasterId: docValue.formId,
      };

      // Set both the value and the display value
      this.searchFormRulesCtrl.setValue(this.selectedFormRule);
    }
  }

  private loadAllFormRules(): void {
    this.isLoading = true;
    this.errorMsg = "";

    // Load all form rules initially
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetFormMasterLookup.json")
      // Uncomment for actual service call:
      // this.programAdministrationService.GetAllFormRules()
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          if (data?.length > 0) {
            // Transform data to match expected structure
            this.allFormRules = data.map((item: any) => ({
              formDescription:
                item.refDesc || item.formDescription || "No Description",
              formCode: item.refCode || item.formCode || "N/A",
              formMasterId: item.id || item.formMasterId || item.refCode,
            }));

            this.filteredFormRules = [...this.allFormRules];
          } else {
            this.allFormRules = [];
            this.filteredFormRules = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = "Error loading form rules. Please try again.";
          console.error("Error loading form rules:", error);
          this.allFormRules = [];
          this.filteredFormRules = [];
        },
      });
  }

  private setupFormSearch(): void {
    // Setup local filtering on search input
    this.searchFormRulesCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (searchTerm: string | any) => {
          this.filterFormRules(searchTerm);
        },
      });
  }

  private filterFormRules(searchTerm: string | any): void {
    if (!searchTerm || typeof searchTerm !== "string") {
      this.filteredFormRules = [...this.allFormRules];
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();

    if (searchTermLower.length === 0) {
      this.filteredFormRules = [...this.allFormRules];
      return;
    }

    // Filter locally from allFormRules
    this.filteredFormRules = this.allFormRules.filter((formRule) => {
      const description = (formRule.formDescription || "").toLowerCase();
      const code = (formRule.formCode || "").toLowerCase();

      return (
        description.includes(searchTermLower) ||
        code.includes(searchTermLower) ||
        `${description} (${code})`.toLowerCase().includes(searchTermLower)
      );
    });
  }

  private setupFormChanges(): void {
    // Emit form changes
    this.formRulesForm.valueChanges.subscribe((val) => {
      this.emitFormData();
    });

    this.dateRangeForm.valueChanges.subscribe(() => {
      this.emitFormData();
    });
  }

  private updateFormStates(): void {
    if (this.isDocModelEdit) {
      this.formRulesForm.enable();
      this.dateRangeForm.enable();
      this.searchFormRulesCtrl.enable();
    } else {
      this.formRulesForm.disable();
      this.dateRangeForm.disable();
      this.searchFormRulesCtrl.disable();
    }
  }

  // Public methods - FIXED displayWithForm
  displayWithForm(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;

    // Return formatted string for display
    if (value.formDescription) {
      return `${value.formDescription} (${value.formCode || "N/A"})`;
    }

    // Handle different data structures
    if (value.refDesc) {
      return `${value.refDesc} (${value.refCode || "N/A"})`;
    }

    return "";
  }

  onSelect(formRule: any): void {
    if (!formRule) return;

    this.selectedFormRule = formRule;

    // Update form with selected form rule
    this.formRulesForm.patchValue({
      formId: formRule.formMasterId || formRule.refCode || formRule.id,
    });

    // Set search control display value (will use displayWithForm)
    this.searchFormRulesCtrl.setValue(formRule);

    // Close autocomplete panel
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }

    // Emit updated data
    this.emitFormData();
  }

  clearSelection(): void {
    this.selectedFormRule = null;
    this.searchFormRulesCtrl.setValue("");
    this.filteredFormRules = [...this.allFormRules];

    // Clear form ID
    this.formRulesForm.patchValue({
      formId: "",
    });

    // Open autocomplete panel
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.openPanel();
    }

    // Emit updated data
    this.emitFormData();
  }

  private emitFormData(): void {
    if (this.formRulesForm.valid && this.dateRangeForm.valid) {
      const formData = {
        ...this.formRulesForm.value,
        dateRange: this.dateRangeForm.value,
        selectedFormRule: this.selectedFormRule,
      };

      this.formItemEvent.emit(formData);
    } else {
      // Emit null or partial data based on your requirements
      this.formItemEvent.emit(null);
    }
  }

  // Focus on search field and show all options
  focusSearch(): void {
    if (this.isDocModelEdit) {
      this.filteredFormRules = [...this.allFormRules];
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.openPanel();
      }
    }
  }

  // Check if we should show "no results" message
  shouldShowNoResults(): boolean {
    return (
      !this.isLoading &&
      this.searchFormRulesCtrl.value &&
      typeof this.searchFormRulesCtrl.value === "string" &&
      this.searchFormRulesCtrl.value.length >= 1 &&
      this.filteredFormRules.length === 0
    );
  }

  // Helper method to check if form is valid
  isFormValid(): boolean {
    return this.formRulesForm.valid && this.dateRangeForm.valid;
  }

  // Helper method to get all form data
  getFormData(): any {
    return {
      formRules: this.formRulesForm.value,
      dateRange: this.dateRangeForm.value,
      selectedFormRule: this.selectedFormRule,
    };
  }
}

// import { HttpClient } from "@angular/common/http";
// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   SimpleChanges,
// } from "@angular/core";
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   Validators,
// } from "@angular/forms";
// import {
//   debounceTime,
//   tap,
//   switchMap,
//   finalize,
//   distinctUntilChanged,
//   filter,
// } from "rxjs/operators";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

// @Component({
//   selector: "app-form",
//   templateUrl: "./form.component.html",
//   styleUrls: ["./form.component.css"],
// })
// export class FormComponent implements OnInit {
//   @Output() formItemEvent = new EventEmitter<string>();
//   @Input() data: any;
//   @Input() isDocModelEdit: boolean;
//   searchFormRulesCtrl = new FormControl();
//   formRulesForm: FormGroup;
//   filteredFormRules: any;
//   isLoading = false;
//   errorMsg!: string;
//   minLengthTerm = 3;
//   selectedSearchFormRules: any = "";

//   constructor(
//     private programAdministrationService: ProgramAdministrationService,
//     private httpClient: HttpClient,
//     private formBuilder: FormBuilder
//   ) {}

//   ngOnInit(): void {
//     this.formRulesForm = this.formBuilder.group({
//       helpTxt: ["", Validators.required],
//       formId: ["", Validators.required],
//     });
//     if (this.data != "new") {
//       this.formRulesForm.controls["helpTxt"].setValue(
//         this.data.documentValue.helpTxt
//       );
//       this.formRulesForm.controls["formId"].setValue(
//         this.data.documentValue.formId
//       );
//       this.searchFormRulesCtrl.setValue({
//         formDescription:
//           this.data.documentValue.formDescription +
//           " (" +
//           this.data.documentValue.formCode +
//           ")",
//       });
//       if (!this.isDocModelEdit) {
//         this.formRulesForm.disable();
//         this.searchFormRulesCtrl.disable();
//       } else {
//         this.formRulesForm.enable();
//         this.searchFormRulesCtrl.enable();
//       }
//     }

//     this.searchFormRulesCtrl.valueChanges
//       .pipe(
//         filter((res) => {
//           return res !== null && res.length >= this.minLengthTerm;
//         }),
//         distinctUntilChanged(),
//         debounceTime(1000),
//         tap(() => {
//           this.errorMsg = "";
//           this.filteredFormRules = [];
//           this.isLoading = true;
//         }),
//         switchMap((value) =>
//           this.httpClient
//             .get("assets/api-data/ConsolidatedReview/getAllFileTypesInfo.json")
//             // this.programAdministrationService
//             //   .GetFormMasterLookup("570", value)
//             .pipe(
//               finalize(() => {
//                 this.isLoading = false;
//               })
//             )
//         )
//       )
//       .subscribe((data: any) => {
//         if (data !== null) {
//           console.log(data);
//           this.filteredFormRules = data;
//         }
//       });
//     this.onChanges();
//   }

//   onChanges() {
//     this.formRulesForm.valueChanges.subscribe((val) => {
//       this.formItemEvent.emit(val);
//     });
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     if (changes.isDocModelEdit.currentValue === true) {
//       this.formRulesForm.enable();
//       this.searchFormRulesCtrl.enable();
//     } else {
//       this.formRulesForm.disable();
//       this.searchFormRulesCtrl.disable();
//     }
//   }

//   displayWithForm(value: any) {
//     return value?.formDescription;
//   }

//   clearSelection() {
//     this.selectedSearchFormRules = "";
//     this.filteredFormRules = [];
//   }

//   OnSelect(formRule: any) {
//     this.formRulesForm.value.formId = formRule.formMasterId;
//     this.formRulesForm.controls["formRule"].setValue(formRule.formMasterId);
//     this.formItemEvent.emit(this.formRulesForm.value);
//   }
// }
