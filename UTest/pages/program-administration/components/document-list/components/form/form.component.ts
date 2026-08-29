import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

@Component({
    selector: "app-form",
    templateUrl: "./form.component.html",
    styleUrls: ["./form.component.scss"],
    standalone: false
})
export class FormComponent implements OnInit {
  @Output() formItemEvent = new EventEmitter<string>();
  @Input() data: any;
  searchFormRulesCtrl = new UntypedFormControl();
  formRulesForm: UntypedFormGroup;
  filteredFormRules: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedSearchFormRules: any = "";

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.formRulesForm = this.formBuilder.group({
      helpTxt: ["", Validators.required],
      formId: ["", Validators.required],
    });
    if (this.data != "new") {
      this.formRulesForm.controls["helpTxt"].setValue(
        this.data.documentValue.helpTxt
      );
      this.formRulesForm.controls["formId"].setValue(
        this.data.documentValue.formId
      );
      this.searchFormRulesCtrl.setValue({
        formDescription: this.data.documentValue.formName,
      });
    }

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
    this.onChanges();
  }

  onChanges() {
    this.formRulesForm.valueChanges.subscribe((val) => {
      this.formItemEvent.emit(val);
    });
  }

  displayWithForm(value: any) {
    return value?.formDescription;
  }

  clearSelection() {
    this.selectedSearchFormRules = "";
    this.filteredFormRules = [];
  }

  OnSelect(formRule: any) {
    this.formRulesForm.value.formId = formRule.formMasterId;
    this.formRulesForm.controls["formRule"].setValue(formRule.formMasterId);
    this.formItemEvent.emit(this.formRulesForm.value);
  }
}
