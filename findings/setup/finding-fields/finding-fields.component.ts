import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";

@Component({
  selector: "app-finding-fields",
  templateUrl: "./finding-fields.component.html",
  styleUrls: ["./finding-fields.component.css"],
})
export class FindingFieldsComponent implements OnInit {
  @Output() newItemEvent = new EventEmitter<any>();
  public findingForm: FormGroup;
  citationCategory: any;
  findingCategory: any;
  arcCategory: any;
  citationValue: any = {
    cfaRefId: 0,
    recType: "C",
    grantPgmId: 0,
    cfaCd: "",
    cfaSeq: 0,
    cfaShortDesc: "",
    cfaDesc: "",
    cfaCat: "",
    editAppl: "",
    arcAppl: "",
    createDt: "",
    createId: 0,
    lastUpdDt: new Date(),
    lastUpdId: 0,
    origCit: "",
    previousCfaRefId: 0,
    citationCategory: "",
    cfXrefCits: [],
    cfXrefFinds: [],
  };
  findingValue: any = {
    cfaRefId: 0,
    recType: "F",
    grantPgmId: 0,
    cfaCd: "",
    cfaSeq: 0,
    cfaShortDesc: "",
    cfaDesc: "",
    cfaCat: "",
    editAppl: "",
    arcAppl: "",
    createDt: "",
    createId: 0,
    lastUpdDt: new Date(),
    lastUpdId: 0,
    origCit: "",
    previousCfaRefId: 0,
    citationCategory: "",
    cfXrefCits: [],
    cfXrefFinds: [],
  };
  selectedCitation = "";
  selectedFinding = "";
  searchCitation = new FormControl();
  searchFinding = new FormControl();
  citationCat = new FormControl();
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  filteredCitation: any;
  filteredFinding: any;
  findingEdit: any;
  findingARC: any;
  entityLevel: string = "B";
  reviewType: any;
  selectedPgmId: any;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public fb: FormBuilder
  
  ) {}

  ngOnInit(): void {
    this.getCitationCategory();
    this.getFindingCategory();
    this.getARCCategory();

    this.findingForm = this.fb.group({
      searchCitation: [""],
      citationCat: [""],
      searchFinding: [""],
      findingCat: [""],
    });

    this.searchCitation.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredCitation = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService
            .getCitationLookup(1, "EarlyOn", "C", value)
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
          this.filteredCitation = [];
        } else {
          this.errorMsg = "";
          this.filteredCitation = data;
        }
        console.log({ filteredCitation: this.filteredCitation });
      });

    this.searchFinding.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredFinding = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService.getFindingLookup(value).pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredFinding = [];
        } else {
          this.errorMsg = "";
          this.filteredFinding = data;
        }
        console.log({ filteredFinding: this.filteredFinding });
      });
    this.onChanges();
  }

  onChanges() {
    this.findingForm.valueChanges.subscribe((val) => {
      this.emitValue();
    });
  }

  emitValue() {
    if (this.citationValue.cfaRefId === 0) {
      this.citationValue.cfaDesc = this.searchFinding.value;
    }
    if (this.findingValue.cfaRefId === 0) {
      this.findingValue.cfaDesc = this.searchFinding.value;
    }
    let data = {
      citation: this.citationValue,
      finding: this.findingValue,
    };
    this.newItemEvent.emit(data);
  }

  onChangeCitation(e: any) {
    this.findingForm.controls["citationCat"].setValue(e.value);
    this.citationValue.cfaCat = e.value;
  }

  onChangeFinding(e: any) {
    this.findingForm.controls["findingCat"].setValue(e.value);
    this.findingValue.cfaCat = e.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  getCitationCategory() {
    this.programAdministrationService
      .getCitationCategory("CCT", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.citationCategory = res;
          console.log(this.citationCategory);
        }
      });
  }
  getFindingCategory() {
    this.programAdministrationService
      .getFindingCategory("FCT", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.findingCategory = res;
        }
      });
  }
  getARCCategory() {
    this.programAdministrationService
      .getARC("ACT", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.arcCategory = res;
        }
      });
  }
  clearSelection() {
    this.searchCitation.setValue("");
    this.findingForm.controls["searchCitation"].setValue("");
    this.findingForm.controls["citationCat"].setValue("");
    this.citationValue = {
      cfaRefId: 0,
      recType: "C",
      grantPgmId: 0,
      cfaCd: "",
      cfaSeq: 0,
      cfaShortDesc: "",
      cfaDesc: "",
      cfaCat: "",
      editAppl: "",
      arcAppl: "",
      createDt: "",
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      origCit: "",
      previousCfaRefId: 0,
      citationCategory: "",
      cfXrefCits: [],
      cfXrefFinds: [],
    };
    this.clearSelection1();
    this.findingEdit = false;
    this.findingARC = false;
    this.entityLevel = "B";
  }
  clearSelection1() {
    this.searchFinding.setValue("");
    this.findingForm.controls["searchFinding"].setValue("");
    this.findingForm.controls["findingCat"].setValue("");
    this.findingValue = {
      cfaRefId: 0,
      recType: "F",
      grantPgmId: 0,
      cfaCd: "",
      cfaSeq: 0,
      cfaShortDesc: "",
      cfaDesc: "",
      cfaCat: "",
      editAppl: "",
      arcAppl: "",
      createDt: "",
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      origCit: "",
      previousCfaRefId: 0,
      citationCategory: "",
      cfXrefCits: [],
      cfXrefFinds: [],
    };
  }

  displayWith(value: any) {
    console.log("display citation");
    return value?.cfaDesc;
  }
  displayWithFinding(value: any) {
    console.log("display finding");
    return value?.cfaDesc;
  }

  onEditAppToggle(event: any) {
    event.checked === true
      ? (this.findingEdit = "Y")
      : (this.findingEdit = "N");
    event.checked === true
      ? (this.findingValue.editAppl = "Y")
      : (this.findingValue.editAppl = "N");
    this.emitValue();
  }

  onEditArcToggle(event: any) {
    event.checked === true ? (this.findingARC = "Y") : (this.findingARC = "N");
    event.checked === true
      ? (this.findingValue.arcAppl = "Y")
      : (this.findingValue.arcAppl = "N");
    this.emitValue();
  }

  onSelect(citation: any) {
    this.citationValue = citation;
    this.findingForm.controls["searchCitation"].setValue("");
    this.findingForm.controls["citationCat"].setValue(citation.cfaCat);
  }
  selectFinding(finding: any) {
    this.findingValue = finding;
    this.findingForm.controls["searchFinding"].setValue("");
    this.findingForm.controls["findingCat"].setValue(finding.cfaCat);
    this.findingEdit = finding.editAppl;
    this.findingARC = finding.arcAppl;
  }

  onEntityLevelChange(e: any) {
    this.entityLevel = e.value;
  }
}
