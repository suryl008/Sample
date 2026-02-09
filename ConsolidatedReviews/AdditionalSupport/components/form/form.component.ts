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
  @Output() saveEvent = new EventEmitter<any>();
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

  // Save State
  isSaving = false;
  saveStatus: { success: boolean; message: string } | null = null;
  saveTimeout: any;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
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
    this.formRulesForm = this.formBuilder.group({
      helpTxt: ["", [Validators.required, Validators.minLength(10)]],
      formId: ["", Validators.required],
      isRequired: [false],
    });

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

    this.formRulesForm.patchValue({
      helpTxt: docValue.helpTxt || "",
      formId: docValue.formId || "",
      isRequired: docValue.isRequired || false,
    });

    if (docValue.startDate || docValue.endDate) {
      this.dateRangeForm.patchValue({
        start: docValue.startDate ? new Date(docValue.startDate) : "",
        end: docValue.endDate ? new Date(docValue.endDate) : "",
      });
    }

    if (docValue.formDescription || docValue.formCode) {
      this.selectedFormRule = {
        formDescription: docValue.formDescription,
        formCode: docValue.formCode,
        formMasterId: docValue.formId,
      };

      this.searchFormRulesCtrl.setValue(this.selectedFormRule);
    }
  }

  private loadAllFormRules(): void {
    this.isLoading = true;
    this.errorMsg = "";

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetFormMasterLookup.json")
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          if (data?.length > 0) {
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

  // Save Configuration Method
  saveFormConfiguration(): void {
    if (!this.isFormValid()) {
      this.showSaveStatus(false, "Please fix validation errors before saving");
      return;
    }

    this.isSaving = true;
    this.clearSaveStatus();

    const formData = this.getFormDataForSave();

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.isSaving = false;

      // Mock success/failure - replace with actual API response handling
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo

      if (isSuccess) {
        this.showSaveStatus(true, "Form configuration saved successfully");
        this.emitSaveEvent(formData);
      } else {
        this.showSaveStatus(false, "Failed to save form configuration");
      }
    }, 1500);

    // Actual service call would look like:
    // this.programAdministrationService.saveFormConfiguration(formData)
    //   .subscribe({
    //     next: (response) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(true, "Form configuration saved successfully");
    //       this.emitSaveEvent(formData);
    //     },
    //     error: (error) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(false, "Failed to save form configuration: " + error.message);
    //     }
    //   });
  }

  private getFormDataForSave(): any {
    return {
      formRules: this.formRulesForm.value,
      dateRange: this.dateRangeForm.value,
      selectedFormRule: this.selectedFormRule,
      timestamp: new Date().toISOString(),
      isValid: this.isFormValid(),
    };
  }

  private emitSaveEvent(data: any): void {
    this.saveEvent.emit({
      type: "form",
      data: data,
      timestamp: new Date().toISOString(),
      success: true,
    });
  }

  private showSaveStatus(success: boolean, message: string): void {
    this.saveStatus = { success, message };

    // Auto-hide success messages after 3 seconds
    if (success) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.saveStatus = null;
      }, 3000);
    }
  }

  private clearSaveStatus(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveStatus = null;
  }

  // Public methods
  displayWithForm(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;

    if (value.formDescription) {
      return `${value.formDescription} (${value.formCode || "N/A"})`;
    }

    if (value.refDesc) {
      return `${value.refDesc} (${value.refCode || "N/A"})`;
    }

    return "";
  }

  onSelect(formRule: any): void {
    if (!formRule) return;

    this.selectedFormRule = formRule;

    this.formRulesForm.patchValue({
      formId: formRule.formMasterId || formRule.refCode || formRule.id,
    });

    this.searchFormRulesCtrl.setValue(formRule);

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }

    this.emitFormData();
  }

  clearSelection(): void {
    this.selectedFormRule = null;
    this.searchFormRulesCtrl.setValue("");
    this.filteredFormRules = [...this.allFormRules];

    this.formRulesForm.patchValue({
      formId: "",
    });

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.openPanel();
    }

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
      this.formItemEvent.emit(null);
    }
  }

  focusSearch(): void {
    if (this.isDocModelEdit) {
      this.filteredFormRules = [...this.allFormRules];
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.openPanel();
      }
    }
  }

  shouldShowNoResults(): boolean {
    return (
      !this.isLoading &&
      this.searchFormRulesCtrl.value &&
      typeof this.searchFormRulesCtrl.value === "string" &&
      this.searchFormRulesCtrl.value.length >= 1 &&
      this.filteredFormRules.length === 0
    );
  }

  isFormValid(): boolean {
    return this.formRulesForm.valid && this.dateRangeForm.valid;
  }

  getFormData(): any {
    return {
      formRules: this.formRulesForm.value,
      dateRange: this.dateRangeForm.value,
      selectedFormRule: this.selectedFormRule,
    };
  }
}
