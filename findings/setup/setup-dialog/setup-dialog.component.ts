import { FindingFieldsComponent } from "./../finding-fields/finding-fields.component";
import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
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
import { CfXref } from "src/app/pages/program-administration/models/cf-xref.model";
@Component({
  selector: "app-setup-dialog",
  templateUrl: "./setup-dialog.component.html",
  styleUrls: ["./setup-dialog.component.css"],
})
export class SetupDialogComponent implements OnInit {
  @Output() newARCItemEvent = new EventEmitter<any>();
  citationCategory: any;
  findingCategory: any;
  arcCategory: any;
  citationValue: any = "";
  findingValue: any = "";
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
  findingEdit: boolean = false;
  findingARC: boolean = false;
  entityLevel: string;
  findingsSaveData: CfXref;
  findingFormDetails: any;
  findingARCDetails: any;
  findingArcCat: any;
  editArc = "N";
  arcDesc: any = "";
  arcJson: any = {
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
      grantPgmId: 0,
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
  };

  arcList: any = {
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
      grantPgmId: 0,
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
  };
  constructor(
    private programAdministrationService: ProgramAdministrationService,

    public dialogRef: MatDialogRef<SetupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.getCitationCategory();
    this.getFindingCategory();
    this.getARCCategory();

    this.findingsSaveData = {
      cfXrefId: 0,
      grantPgmId: this.data.grantPgmId,
      citId: 0,
      findId: 0,
      seqNo: 0,
      createDt: new Date(),
      createId: 0,
      lastUpdDt: new Date(),
      lastUpdId: 0,
      rvwType: this.data.reviewType,
      pcInd: "",
      previousCfXrefId: 0,
      cit: {
        cfaRefId: 0,
        recType: "C",
        grantPgmId: this.data.grantPgmId,
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
        grantPgmId: this.data.grantPgmId,
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
            grantPgmId: this.data.grantPgmId,
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
  }
  clearSelection1() {
    this.searchFinding.setValue("");
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
    this.citationValue = citation.cfaDesc;
    this.searchCitation.setValue("");
    this.citationCat.setValue(citation.citationCategory);
  }
  selectFinding(finding: any) {
    this.findingValue = finding;
    this.arcDesc = finding.cfaDesc;
    this.searchFinding.setValue("");
  }
  onEntityLevelChange(e: any) {
    this.entityLevel = e.value;
  }

  GetFindingForm(val: any) {
    console.log({ val: val });
    this.findingFormDetails = val;
    if (
      this.findingFormDetails.finding &&
      this.findingFormDetails.finding.cfaRefId != 0
    ) {
      this.entityLevel = this.findingFormDetails.finding.cfXrefFinds[0].pcInd;
    }
  }

  GetFindingARC(val: any) {
    console.log({ val: val, data: val.data, filteredData: val.filteredData });
    this.findingARCDetails = val;
    let des = val.desc;
    let cat = val.category;
    if(this.findingARCDetails.arc){
      for(let i= 0;i<des.length;i++){
        for(let j=0;j<this.findingARCDetails.arc.length;j++){
          var returnValue = {...this.findingARCDetails.arc[j]};
          if(i===j){
            returnValue.arcDesc = des[i];
            this.findingARCDetails.arc[j]={...returnValue};
          }
        }
      }

      for(let i= 0;i<cat.length;i++){
        for(let j=0;j<this.findingARCDetails.arc.length;j++){
          var returnValue1 = {...this.findingARCDetails.arc[j]};
          if(i===j){
            returnValue1.arcCat = cat[i];
            this.findingARCDetails.arc[j]={...returnValue1};
          }
        }
      }
     
      
  }
    console.log(this.findingARCDetails)
  }

  addFindings() {
    console.log({ FindingData: this.addFindings });
    if(this.data.mode==='Add'){
    this.findingsSaveData.citId = this.findingFormDetails.citation.cfaRefId;
    this.findingsSaveData.findId = this.findingFormDetails.finding.cfaRefId;
    if (this.findingFormDetails.finding.cfXrefFinds.length > 0) {
      this.findingsSaveData.cfXrefId =
        this.findingFormDetails.finding.cfXrefFinds[0].cfXrefId;
      this.findingsSaveData.pcInd =
        this.findingFormDetails.finding.cfXrefFinds[0].pcInd;
    }

    // add for Citation

    this.findingsSaveData.cit.cfaRefId =
      this.findingFormDetails.citation.cfaRefId;
    this.findingsSaveData.cit.cfaDesc =
      this.findingFormDetails.citation.cfaDesc;
    this.findingsSaveData.cit.cfaCat = this.findingFormDetails.citation.cfaCat;

    // add for Finding

    this.findingsSaveData.find.cfaRefId =
      this.findingFormDetails.finding.cfaRefId;
    this.findingsSaveData.find.cfaDesc =
      this.findingFormDetails.finding.cfaDesc;
    this.findingsSaveData.find.cfaCat = this.findingFormDetails.finding.cfaCat;
    this.findingsSaveData.find.editAppl =
      this.findingFormDetails.finding.editAppl;
    this.findingsSaveData.find.arcAppl =
      this.findingFormDetails.finding.arcAppl;

    // add for ARC
    if(this.findingARCDetails.arc){
      this.findingsSaveData.cfaXrefs  = this.findingARCDetails.arc;
    }
    // this.findingsSaveData.cfaXrefs[0].arc.arcAppl =
    //   this.findingFormDetails.finding.arcAppl;
    // this.findingsSaveData.cfaXrefs[0].arc.editAppl =
    //   this.findingFormDetails.finding.editAppl;
    // this.findingsSaveData.cfaXrefs[0].arc.cfaRefId = this.findingValue.cfaRefId;
    // this.findingsSaveData.cfaXrefs[0].arc.cfaDesc = this.arcList[0].cfaDesc;
    // this.findingsSaveData.cfaXrefs[0].arc.cfaCat = this.findingArcCat;
    // this.findingsSaveData.cfaXrefs[0].arc.editAppl = this.editArc;

    this.programAdministrationService
      .addFindingsSave(this.findingsSaveData)
      .subscribe((res: any) => {
        if (res != null) {
          this.citationCategory = res;
          console.log(this.citationCategory);
        }
      });
    }
    else{
      if(this.findingARCDetails.arc){
        this.dialogRef.close({arc:this.findingARCDetails.arc});
        console.log({arcDetails: this.findingARCDetails.arc}
          );
      }
    }
  }

  changeARC(arcLst: any, i: any) {
    this.arcList[i].arc.arcDesc = arcLst.arc.arcDesc;
  }
}
