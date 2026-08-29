import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";

@Component({
    selector: "app-form",
    templateUrl: "./form.component.html",
    styleUrls: ["./form.component.scss"],
    standalone: false
})
export class FormComponent implements OnInit, OnChanges {
  @Output() formItemEvent = new EventEmitter<any>();
  @Input() data: any;
  @Input() isDocModelEdit: boolean = true;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;

  // Form Controls
  searchFormRulesCtrl = new UntypedFormControl();
  formRulesForm: UntypedFormGroup;
  dateRangeForm: UntypedFormGroup;

  // Data
  allFormRules: any[] = [];
  filteredFormRules: any[] = [];
  selectedFormRule: any = null;
  isLoading = false;
  errorMsg = "";

  constructor(
    private httpClient: HttpClient,
    private formBuilder: UntypedFormBuilder,
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

    // Default form rules
    const defaultRules = [
      { refCode: "FR001", refDesc: "OGS-1 Initial Review Form", id: "FR001" },
      { refCode: "FR002", refDesc: "OGS-2 Site Visit Form", id: "FR002" },
      { refCode: "FR003", refDesc: "OGS-3 Financial Assessment", id: "FR003" },
      { refCode: "FR004", refDesc: "OGS-4 Compliance Checklist", id: "FR004" },
      { refCode: "FR005", refDesc: "OGS-5 Risk Assessment", id: "FR005" },
    ];

    setTimeout(() => {
      this.isLoading = false;
      this.allFormRules = defaultRules.map((item: any) => ({
        formDescription: item.refDesc || "No Description",
        formCode: item.refCode || "N/A",
        formMasterId: item.id || item.refCode,
      }));
      this.filteredFormRules = [...this.allFormRules];
    }, 500);
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
        (description + " " + code).includes(searchTermLower)
      );
    });
  }

  private setupFormChanges(): void {
    this.formRulesForm.valueChanges.subscribe(() => {
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

  // Public methods
  displayWithForm(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.formDescription
      ? `${value.formDescription} (${value.formCode || "N/A"})`
      : "";
  }

  onSelect(formRule: any): void {
    if (!formRule) return;

    this.selectedFormRule = formRule;
    this.formRulesForm.patchValue({
      formId: formRule.formMasterId || formRule.formCode,
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
    const formData = {
      helpTxt: this.formRulesForm.get("helpTxt")?.value || "",
      formId: this.formRulesForm.get("formId")?.value || "",
      formDescription: this.selectedFormRule?.formDescription || "",
      formCode: this.selectedFormRule?.formCode || "",
      dateRange: this.dateRangeForm.valid
        ? {
            start: this.dateRangeForm.get("start")?.value,
            end: this.dateRangeForm.get("end")?.value,
          }
        : null,
      isValid: this.isFormValid(),
    };

    this.formItemEvent.emit(formData);
  }

  focusSearch(): void {
    if (this.isDocModelEdit) {
      this.filteredFormRules = [...this.allFormRules];
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.openPanel();
      }
    }
  }

  isFormValid(): boolean {
    return this.formRulesForm.valid && this.dateRangeForm.valid;
  }
}
