

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgramAdministrationService } from 'src/app/shared/services/program-administration.service';
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
  
} from "rxjs/operators";

@Component({
  selector: 'app-finding-fields',
  templateUrl: './finding-fields.component.html',
  styleUrls: ['./finding-fields.component.css']
})
export class FindingFieldsComponent implements OnInit {
  public findingForm: FormGroup;
  citationCategory :any;
  findingCategory :any; 
  arcCategory :any;
  citationValue:any="";
  findingValue:any="";
  selectedCitation="";
  selectedFinding="";
  searchCitation = new FormControl();
  searchFinding = new FormControl();
  citationCat = new FormControl();
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  filteredCitation:any;
  filteredFinding:any;
  findingEdit:any;
  findingARC:any;
  entityLevel:string
 
  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public fb: FormBuilder, 
      public dialogRef: MatDialogRef<FindingFieldsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getCitationCategory();
    this.getFindingCategory();
   this.getARCCategory();
   
 this.findingForm = this.fb.group({
  searchCitation: [""],
  citationCat: ["",],
  searchFinding: [""],
  findingCat:[""],
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
    this.searchCitation.setValue("");
  }
  clearSelection1() {
    this.searchFinding.setValue("");
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
}
