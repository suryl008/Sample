import { SetupDialogComponent } from "./setup/setup-dialog/setup-dialog.component";
import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent, MatChipList } from "@angular/material/chips";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

import { Observable } from "rxjs";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { AppSettings } from "src/app/app-settings";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CfXref } from "../../models/cf-xref.model";
import { ThisReceiver } from "@angular/compiler";

const user = {
  firstName: "Lindsey",
  lastName: "Broos",
  fruits: [],
};

@Component({
  selector: "app-findings",
  templateUrl: "./findings.component.html",
  styleUrls: ["./findings.component.css"],
})
export class FindingsComponent implements OnInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl("");
  filteredFruits: Observable<string[]>;
  fruits: string[] = ["Lemon"];
  allFruits: string[] = ["Apple", "Lemon", "Lime", "Orange", "Strawberry"];

  @ViewChild("fruitInput") fruitInput: ElementRef<HTMLInputElement>;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public findingForm: FormGroup;
  public user: User;
  citationCategory: any;
  findingCategory: any;
  arcCategory: any;
  citationValue: any = "";
  findingValue: any = "";
  selectedCitation = "";
  selectedFinding = "";
  citationCat = new FormControl();
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  filteredCitation: any;
  filteredFinding: any;
  findingEdit: any;
  findingARC: any;
  entityLevel: string = "";
  findingResult: any = [];
  changeText: boolean = false;
  citaModel: any;
  commentFC = new FormControl();
  isEditSetup: boolean = false;
  findingDesc: any = "";
  findingDescCopy: any = "";
  citationDesc: any = "";
  citationDescCopy: any = "";
  findingsSaveData: CfXref;
  categoryCopy:any="";

  public filteredFruits$: Observable<Fruit[]>;

  @ViewChild("fruitList") fruitList: MatChipList;
  reviewType: any;
  selectedPgmId: any;
  searchParms: any = {};

  constructor(
    public fb: FormBuilder,
    public dialog: MatDialog,
    private programAdministrationService: ProgramAdministrationService,
    private activatedRoute: ActivatedRoute
  ) {}
  add(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = "";
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter((fruit) =>
      fruit.toLowerCase().includes(filterValue)
    );
  }
  ngOnInit(): void {
    this.user = user;
    this.getCitationCategory();
    this.getFindingCategory();
    this.reviewType =
    this.activatedRoute.snapshot.queryParamMap.get("review") ||
    sessionStorage.getItem("reviewType") ||
    this.programAdministrationService.reviewType ||
    AppSettings.DEFAULT_REVIEW_TYPE;

  this.programAdministrationService.selectedProgram$.subscribe(
    (programData: any) => {
      if (programData) {
        this.selectedPgmId = programData.grantPgmId;

        this.searchParms.rvwType = "EarlyOn";
      }
    }
  );

    this.findingsSaveData = {
      cfXrefId: 0,
      grantPgmId: this.selectedPgmId,
      citId: 0,
      findId: 0,
      seqNo: 0,
      createDt: new Date(),
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      rvwType: this.reviewType,
      pcInd: "",
      previousCfXrefId: 0,
      cit: {
        cfaRefId: 0,
        recType: "C",
        grantPgmId: this.selectedPgmId,
        cfaCd: "",
        cfaSeq: 0,
        cfaShortDesc: "",
        cfaDesc: "",
        cfaCat: "",
        editAppl: "",
        arcAppl: "",
        createDt: new Date(),
        createId: 0,
        lastUpdDt: new Date(),
        lastUpdId: 0,
        origCit: "",
        previousCfaRefId: 0,
        citationCategory: "",
        cfXrefCits: [],
        cfXrefFinds: [],
      },
      find: {
        cfaRefId: 0,
        recType: "F",
        grantPgmId: this.selectedPgmId,
        cfaCd: "",
        cfaSeq: 0,
        cfaShortDesc: "",
        cfaDesc: "",
        cfaCat: "",
        editAppl: "",
        arcAppl: "",
        createDt: new Date(),
        createId: 0,
        lastUpdDt: new Date(),
        lastUpdId: 0,
        origCit: "",
        previousCfaRefId: 0,
        citationCategory: "",
        cfXrefCits: [],
        cfXrefFinds: [],
      },
      cfaXrefs: [
        {
          cfaXrefId: 0,
          cfXrefId: 0,
          arcId: 0,
          seqNo: 0,
          createDt: new Date(),
          createId: 0,
          lastUpdDt: new Date(),
          lastUpdId: 0,
          previousCfaXrefId: 0,
          arc: {
            cfaRefId: 0,
            recType: "R",
            grantPgmId: this.selectedPgmId,
            cfaCd: "",
            cfaSeq: 0,
            cfaShortDesc: "",
            cfaDesc: "",
            cfaCat: "",
            editAppl: "",
            arcAppl: "",
            createDt: new Date(),
            createId: 0,
            lastUpdDt: new Date(),
            lastUpdId: 0,
            origCit: "",
            previousCfaRefId: 0,
            citationCategory: "",
            cfXrefCits: [],
            cfXrefFinds: [],
          },
        },
      ],
    };
    //   this.getARCCategory();

    this.findingForm = this.fb.group({
      searchCitation: [""],
      citationCat: [""],
      searchFinding: [""],
      findingCat: [""],
      valueData: [""],
    });

   
    this.findingForm.controls["searchCitation"].valueChanges
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
            .getCitationLookup(this.selectedPgmId, this.reviewType, "C", value)
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

    this.findingForm.controls["searchFinding"].valueChanges
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
    this.findingForm.controls["searchCitation"].setValue("");
    this.findingForm.controls["citationCat"].setValue("");
    this.citationValue = "";
    this.clearSelection1();
    this.findingEdit = false;
    this.findingARC = false;
    this.entityLevel = "";
  }
  clearSelection1() {
    this.findingForm.controls["searchFinding"].setValue("");
    this.findingForm.controls["findingCat"].setValue("");
    this.findingValue = "";
  }

  displayWith(value: any) {
    console.log("display citation");
    return value?.cfaDesc;
  }
  displayWithFinding(value: any) {
    console.log("display finding");
    return value?.cfaDesc;
  }
  onSelect(citation: any) {
    this.citationValue = citation;
    this.citationDesc = citation.cfaDesc;
    this.citationDescCopy = citation.cfaDesc;
    this.categoryCopy =citation.citationCategory;
    
    this.findingForm.controls["searchCitation"].setValue("");

    this.findingForm.controls["citationCat"].setValue(
      citation.cfaCat
    );
  }
  selectFinding(finding: any) {
    this.findingValue = finding;
    this.findingDesc = finding.cfaDesc;
    this.findingDescCopy = finding.cfaDesc;
    this.citaModel = finding.cfaDesc;
    this.findingForm.controls["searchFinding"].setValue("");
    this.findingForm.controls["findingCat"].setValue(finding.cfaCat);
    this.findingEdit = finding.editAppl;
    this.findingARC = finding.arcAppl;
    this.entityLevel = finding.cfXrefFinds[0].pcInd;
  }
  onEntityLevelChange(e: any) {
    this.entityLevel = e.value;
  }
  searchFindings() {
    this.searchParms.cfaRefId = this.citationValue.cfaRefId;
    this.searchParms.grantPgmId = this.selectedPgmId;
    this.searchParms.rvwType = this.reviewType;
    this.searchParms.cfaRefIdFinding = this.findingValue.cfaRefId;
    this.searchParms.entityLevel = this.entityLevel;
    console.log({ searchParems: this.searchParms });

    this.programAdministrationService
      .getFindingResult(
        this.selectedPgmId,
        this.reviewType,
        this.citationValue.cfaRefId,
        this.findingValue.cfaRefId
      )
      .subscribe((res: any) => {
        if (res != null) {
          this.findingResult = res;
          console.log(this.findingResult);
        }
      });
  }
  editFindingSetup() {
    this.isEditSetup = !this.isEditSetup;
    if(this.isEditSetup ===false){
      this.citationDesc = this.citationDescCopy;
      this.findingDesc = this.findingDescCopy;
      this.citationValue.cfaDesc = this.citationDescCopy;
      this.findingValue.cfaDesc = this.findingDescCopy;
      if(this.categoryCopy!=this.findingForm.controls["citationCat"].value){
      this.findingForm.controls["citationCat"].setValue(
      this.categoryCopy
    );
    }
  }
    }
  changeCitationDesc(event: any) {
    this.citationDesc = event.target.value;
    console.log("change");
    this.citationValue.cfaDesc = this.citationDesc;
  }
  changefindingDesc(event: any) {
    this.findingDesc = event.target.value;
    console.log("change");
    this.findingValue.cfaDesc = this.findingDesc;
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.findingForm.controls[controlName].hasError(errorName);
  };

  public submitForm(): void {
    console.log({
      user: this.user,
      submitForm: this.findingForm.get("fruits"),
    });
  }

  addFinding() {
    const dialogRef = this.dialog.open(SetupDialogComponent, {
      width: "750px",
      disableClose: true,
      data: {
        grantPgmId: this.selectedPgmId,
        reviewType: this.reviewType,
        mode: "Add",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
     
    });
  }

  saveFindings(){
    console.log({citation: this.citationValue, finding: this.findingValue, pgID: this.selectedPgmId });
    this.findingsSaveData.citId = this.citationValue.cfaRefId;
    this.findingsSaveData.findId = this.findingValue.cfaRefId;
    this.findingsSaveData.pcInd = this.entityLevel;
  
    // if (this.findingFormDetails.finding.cfXrefFinds.length > 0) {
    //   this.findingsSaveData.cfXrefId =
    //     this.findingFormDetails.finding.cfXrefFinds[0].cfXrefId;
    //   this.findingsSaveData.pcInd =
    //     this.findingFormDetails.finding.cfXrefFinds[0].pcInd;
    // }
    this.findingsSaveData.cit = this.citationValue;
    this.findingsSaveData.cit.cfaCat = this.findingForm.value.citationCat;
  
    this.findingsSaveData.find = this.findingValue; 
    this.findingsSaveData.find.cfaCat = this.findingForm.value.findingCat;
    this.findingEdit===true? this.findingsSaveData.find.editAppl='Y':this.findingsSaveData.find.editAppl='N';
    this.findingARC===true? this.findingsSaveData.find.arcAppl='Y':this.findingsSaveData.find.arcAppl='N';
   
      this.findingsSaveData.cfaXrefs  = this.findingResult;
      this.programAdministrationService
      .addFindingsSave(this.findingsSaveData)
      .subscribe((res: any) => {
        if (res != null) {
         
        }
      });
  
    console.log({saveData: this.findingsSaveData})

  }

  GetFindingARC(val: any) {
    console.log({val: val})
    this.findingResult  = val;
  }

  onChangeCategory(e: any) {
    console.log(this.findingForm.value)
    if(this.categoryCopy!=e.value){

    }
    else{
      
    }
      
  }
}

export interface User {
  firstName: string;
  lastName: string;
  fruits: Fruit[];
}

export interface Fruit {
  id: number;
  name: string;
}
