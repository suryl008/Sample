import { Validators } from "@angular/forms";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

@Component({
    selector: "app-questionnaire",
    templateUrl: "./questionnaire.component.html",
    styleUrls: ["./questionnaire.component.scss"],
    standalone: false
})
export class QuestionnaireComponent implements OnInit {
  @Output() newItemEvent = new EventEmitter<string>();
  @Input() data: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  searchQuestionnaireCtrl = new UntypedFormControl();
  questionnaireForm: UntypedFormGroup;
  myLabelPosition: labelPosition = "before";

  filteredQuestionnaire: any;
  selectedSearchQuestionnaire: any = "";

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder
  ) {}

  displayWith(value: any) {
    return value?.name;
  }

  clearSelection() {
    this.filteredQuestionnaire = [];
    this.searchQuestionnaireCtrl.setValue("");
  }

  ngOnInit(): void {
    this.questionnaireForm = this.formBuilder.group({
      helpTxt: ["", Validators.required],
      questionnaireId: ["", Validators.required],
      allowMultipleQuestionnaireInstances: [false, Validators.required],
      questionnaireFieldId: [0, Validators.required],
    });
    if (this.data != "new") {
      this.questionnaireForm.controls["helpTxt"].setValue(
        this.data.documentValue.helpTxt
      );
      this.questionnaireForm.controls["questionnaireId"].setValue(
        this.data.documentValue.questionnaireId
      );
      this.searchQuestionnaireCtrl.setValue({
        name: this.data.documentValue.questionnaireName,
      });
      this.questionnaireForm.controls[
        "allowMultipleQuestionnaireInstances"
      ].setValue(this.data.documentValue.allowMultipleQuestionnaireInstances);
      this.questionnaireForm.controls["questionnaireFieldId"].setValue(
        this.data.documentValue.questionnaireFieldId
      );
    }
    this.searchQuestionnaireCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredQuestionnaire = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .GetAllQuestionnaireLookup(value)
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
          this.filteredQuestionnaire = [];
        } else {
          this.errorMsg = "";
          this.filteredQuestionnaire = data;
        }
        console.log({ filteredQuestionnaire: this.filteredQuestionnaire });
      });
    this.onChanges();
  }

  onChanges() {
    this.questionnaireForm.valueChanges.subscribe((val) => {
      this.newItemEvent.emit(val);
    });
  }

  OnSelect(questionnaire: any) {
    this.questionnaireForm.value.questionnaireId =
      questionnaire.questionnaireId;
    this.questionnaireForm.controls["questionnaireId"].setValue(
      questionnaire.questionnaireId
    );
    this.newItemEvent.emit(this.questionnaireForm.value);
  }
}
