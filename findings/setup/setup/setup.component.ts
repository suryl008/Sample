import { dateInputsHaveChanged } from "@angular/material/datepicker/datepicker-input-base";
import { EventEmitter, Output } from "@angular/core";
import { outputAst } from "@angular/compiler";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { ConfirmDialogComponent } from "../../../program-info/confirm-dialog/confirm-dialog.component";
import { SetupDialogComponent } from "../setup-dialog/setup-dialog.component";
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-setup",
  templateUrl: "./setup.component.html",
  styleUrls: ["./setup.component.css"],
})
export class SetupComponent implements OnInit {
  @Output() newARCItemEvent = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  @ViewChild(MatSort) sort: any = MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() data: any;
  @Input() citationValue: any;
  @Input() findingValue: any;
  @Input() selectedPgmId: any;
  @Input() reviewType: any;
  @Input() mode: any;
  searchFinding = new FormControl();
  setups: any;
  findingSetups: any;
  displayedColumnsUsers: string[] = [
    "arcDesc",
    "category",
    "editAppl",
    "delete",
  ];
  arcCategory: any = [];
  findingValueCopy: any = "";
  citationValueCopy: any = "";
  arcDescforNewRow: any = [];
  arcCatforNewRow:any=[];
  arcEditAppforNewRow:any=[];
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  filteredCitation: any;
  filteredFinding: any;

  newEmptyRow = {
    findId: 0,
    findCd: "",
    findSeq: 0,
    findDesc: "",
    findCat: "",
    editAppl: 'N',
    arcAppl: "",
    findCatDesc: "",
    cfXrefId: 0,
    cfXrefSeq: 0,
    arcId: 0,
    arcCd: "",
    arcSeq: 0,
    arcDesc: "",
    arcCat: "",
    editArc: "",
    cfaXrefSeq: 0,
    pcInd: "",
  };
  arcDesc: any;
 
  constructor(
    public dialog: MatDialog,
    private programAdministrationService: ProgramAdministrationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.setups = [{ desc: "eireoiruer", category: "erer", edit: true }];

    this.findingSetups = new MatTableDataSource(this.data);
    this.findingValueCopy = this.findingValue;
    this.citationValueCopy = this.citationValue;

    this.findingSetups.sort = this.sort;
    this.findingSetups.paginator = this.paginator;
    this.getARCCategory();
    

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
  
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.data);
    if (changes.findingValue)
      this.findingValueCopy = changes.findingValue.currentValue;
    if (changes.citationValue)
      this.citationValueCopy = changes.citationValue.currentValue;
    if (changes.data)
      this.findingSetups = new MatTableDataSource(changes.data.currentValue);
  }
  addFinding() {
    const dialogRef = this.dialog.open(SetupDialogComponent, {
      width: "750px",
      disableClose: true,
      data: { grantPgmId: this.selectedPgmId, reviewType: this.reviewType , mode: "edit",},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result.arc){
        for(let i=0;i<result.arc.length;i++){
          this.findingSetups.data.push(result.arc[i]);
        }
        
        this.findingSetups = new MatTableDataSource(this.findingSetups.data);
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

  openDialog(element: any): void {
    var data = {
      data: element,
      grantPgmId: this.selectedPgmId,
      reviewType: this.reviewType,
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "20%",
      panelClass: "full-screen-modal",
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result == "Confirm") {
        this.deleteUserForDialog(element);
      }
    });
  }

  deleteUserForDialog(data: any) {
    this.findingSetups.data.splice(this.findingSetups.data.indexOf(data), 1);
    this.findingSetups._updateChangeSubscription();
    this.cd.markForCheck();
  }

  addFindingNewRow() {
    let temp = this.findingSetups.data;
    temp.push(this.newEmptyRow);
    this.findingSetups = new MatTableDataSource(temp);
    this.findingSetups._updateChangeSubscription();
    this.cd.markForCheck();
  }

  changeNewARC(element: any, data: any) {
    console.log({ NewArcDesc: this.arcDescforNewRow });
    let temp = {arc: this.findingSetups.data, desc:this.arcDescforNewRow, category:this.arcCatforNewRow};
   
    
    this.newARCItemEvent.emit(temp);
  }
  
  changeEditApp(element:any,event:any,i:any){
console.log(element.editAppl)
console.log(event.checked)
console.log(event.target.checked)
  }
  selectFinding(finding: any) {
    this.findingValue = finding;
    this.arcDesc = finding.cfaDesc;
    this.searchFinding.setValue("");
  }
  displayWithFinding(value: any) {
    console.log("display finding");
    return value?.cfaDesc;
  }

  clearSelection1() {
    this.searchFinding.setValue("");
  }
}
