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
  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public findingForm: FormGroup;
  public user: User;
  citationCategory :any;
  findingCategory :any; 
  arcCategory :any;
  citationValue:any="";
  findingValue:any="";
  selectedCitation="";
  selectedFinding="";
  citationCat = new FormControl();
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  filteredCitation:any;
  filteredFinding:any;
  findingEdit:any;
  findingARC:any;
  entityLevel:string='B';
  findingResult:any=[];
 
  public filteredFruits$: Observable<Fruit[]>;

  @ViewChild("fruitList") fruitList: MatChipList;
  reviewType: any;
  selectedPgmId: any;
  searchParms: any={};



  constructor(public fb: FormBuilder, 
    private programAdministrationService: ProgramAdministrationService,
    private activatedRoute: ActivatedRoute,) {
   
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

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
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
  ngOnInit(): void {
    this.user = user;
    this.getCitationCategory();
    this.getFindingCategory();
 //   this.getARCCategory();

 this.findingForm = this.fb.group({
  searchCitation: [""],
  citationCat: ["",],
  searchFinding: [""],
  findingCat:[""],
 });

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

    this.findingForm.controls['searchCitation'].valueChanges
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
          .getCitationLookup(value)
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

    this.findingForm.controls['searchFinding'].valueChanges
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
        this.programAdministrationService
          .getFindingLookup(value)
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
        this.filteredFinding= [];
      } else {
        this.errorMsg = "";
        this.filteredFinding = data;
      }
      console.log({ filteredFinding: this.filteredFinding });
    });

   
  }
  getCitationCategory(){
    this.programAdministrationService
    .getCitationCategory("CCT", "000000")
    .subscribe((res: any) => {
      if (res != null) {
        this.citationCategory = res;
        console.log(this.citationCategory )
      }
    });
  }
  getFindingCategory(){
    this.programAdministrationService
    .getFindingCategory("FCT", "000000")
    .subscribe((res: any) => {
      if (res != null) {
        this.findingCategory = res;
      }
    });
  }
  getARCCategory(){
    this.programAdministrationService
    .getARC("ACT", "000000")
    .subscribe((res: any) => {
      if (res != null) {
        this.arcCategory = res;
      }
    });
  }

  clearSelection() {
    this.findingForm.controls['searchCitation'].setValue("");
    this.findingForm.controls['citationCat'].setValue("");
    this.citationValue ="";
  }
  clearSelection1() {
    this.findingForm.controls['searchFinding'].setValue("");
    this.findingForm.controls['findingCat'].setValue("");
    this.findingValue ="";
  }

  displayWith(value: any) {
    console.log("display citation")
    return value?.cfaDesc;
  }
  displayWithFinding(value: any) {
    console.log("display finding")
    return value?.cfaDesc;
  }
  onSelect(citation:any){
    this.citationValue = citation;

    this.findingForm.controls['searchCitation'].setValue("");
    this.findingForm.controls['citationCat'].setValue(citation.citationCategory);

  }
  selectFinding(finding:any){
    this.findingValue = finding;
    this.findingForm.controls['searchFinding'].setValue("");
    this.findingForm.controls['findingCat'].setValue(finding.citationCategory);
    this.findingEdit = finding.editAppl;
    this.findingARC = finding.arcAppl;

  

  }
  onEntityLevelChange(e: any) {
    this.entityLevel = e.value;
  }
  searchFindings(){
    this.searchParms.cfaRefId= this.citationValue.cfaRefId;
    this.searchParms.grantPgmId = this.selectedPgmId;
    this.searchParms.rvwType = this.reviewType;
    this.searchParms.cfaRefIdFinding = this.findingValue.cfaRefId;
    this.searchParms.entityLevel = this.entityLevel;
    console.log({searchParems: this.searchParms});


    this.programAdministrationService
    .getFindingResult("CCT")
    .subscribe((res: any) => {
      if (res != null) {
        this.findingResult = res;
        console.log(this.findingResult )
      }
    });

  }
  public hasError = (controlName: string, errorName: string) => {
    return this.findingForm.controls[controlName].hasError(errorName);
  };
  
  public submitForm(): void {
    console.log({ user: this.user, submitForm: this.findingForm.get("fruits") });
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
