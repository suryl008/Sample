import { EventEmitter, Input } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
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
    selector: "app-eff",
    templateUrl: "./eff.component.html",
    styleUrls: ["./eff.component.scss"],
    standalone: false
})
export class EffComponent implements OnInit {
  @Output() newFlexFormEvent = new EventEmitter<string>();
  @Input() data: any;
  flexForm: UntypedFormGroup;
  searchFlexformCtrl = new UntypedFormControl();
  filteredFlexform: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedSearchFlexform: any = "";

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.flexForm = this.formBuilder.group({
      helpTxt: ["", Validators.required],
      flexFormPdftemplateId: ["", Validators.required],
      allowMultipleFlexformInstances: [false, Validators.required],
    });
    if (this.data != "new") {
      this.flexForm.controls["helpTxt"].setValue(
        this.data.documentValue.helpTxt
      );
      this.flexForm.controls["flexFormPdftemplateId"].setValue(
        this.data.documentValue.flexFormPdftemplateId
      );
      this.flexForm.controls["allowMultipleFlexformInstances"].setValue(
        this.data.documentValue.allowMultipleFlexformInstances
      );
      this.searchFlexformCtrl.setValue({
        name: this.data.documentValue.flexFormPDFTemplateName,
      });
    }
    this.searchFlexformCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredFlexform = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .GetFlexFormPdftemplateLookup("1", "EarlyOn", "OGS", value)
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
          this.filteredFlexform = [];
        } else {
          this.errorMsg = "";
          this.filteredFlexform = data;
        }
        console.log({ filteredFlexform: this.filteredFlexform });
      });
    this.onChanges();
  }

  onChanges() {
    this.flexForm.valueChanges.subscribe((val) => {
      this.newFlexFormEvent.emit(val);
    });
  }

  OnSelect(flexFormVal: any) {
    this.flexForm.value.flexFormPdftemplateId =
      flexFormVal.flexFormPdftemplateId;
    this.flexForm.controls["flexFormPdftemplateId"].setValue(
      flexFormVal.flexFormPdftemplateId
    );
    this.newFlexFormEvent.emit(this.flexForm.value);
  }

  displayWith(value: any) {
    return value?.name;
  }

  clearSelection() {
    this.selectedSearchFlexform = "";
    this.filteredFlexform = [];
  }
}
