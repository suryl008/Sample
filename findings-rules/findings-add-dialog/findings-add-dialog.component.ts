import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { CitFindArc } from "../../../models/cit-find-arc.model";

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

/**
 * @title Data table with sorting, pagination, and filtering.
 */

@Component({
  selector: "app-findings-add-dialog",
  templateUrl: "./findings-add-dialog.component.html",
  styleUrls: ["./findings-add-dialog.component.css"],
})
export class FindingsAddDialogComponent implements OnInit {
  @Output() emitService = new EventEmitter();
  displayedColumns: string[] = ["selected", "citation", "finding", "arc"];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addNewFindings: any;
  dataSourceFindingARC: any = [];
  finalSelectedData: any = [];
  selectedElement: any = [];

  dataForTable: any = [];

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FindingsAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  addNewStage() {
    this.addNewFindings = {
      citation: this.selectedElement.citation,
      findings: this.selectedElement.finding,
      ARC: this.selectedElement.ARC,
    };
    console.log(this.addNewFindings);
    this.dialogRef.close({ result: this.addNewFindings });
  }

  ngOnInit(): void {
    console.log("data init " + JSON.stringify(this.data.loadFindingRuleArcData));
    this.getFindingARC();
    //this.selectedElement = this.finalSelectedData;
    // if(this.data.loadFindingRuleArcData){
    //   var _arrdataForTable = this.data.loadFindingRuleArcData;
     // _arrdataForTable.find((cfaXrefs) => {
        // this.dataForTable.push({
        //   citation: _arrdataForTable.citation,
        //   finding: _arrdataForTable.finding,
        //   ARC: _arrdataForTable.ARC,
        //   checked : _arrdataForTable.checked
        // });
      //});
      
      // this.selectedElement = _arrdataForTable;
      // this.dataSource = new MatTableDataSource(this.selectedElement);
      
      //this.dataSource.paginator = this.paginator;
      //this.dataSource.sort = this.sort;
    // }
    // else {
    //   this.getFindingARC();
    // }
  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getFindingARC() {
    this.programAdministrationService
      .getFindingRuleArcData(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.dataSourceFindingARC = res;
          console.log("data" + JSON.stringify(this.dataSourceFindingARC));
          //this.dataSource = this.dataSourceFindingARC;
          //this.dataSource = new MatTableDataSource(this.dataSourceFindingARC);
          //this.dataSource = this.dataSourceFindingARC;

          this.dataSourceFindingARC.forEach(
            (group: {
              cfaXrefs: any[];
              cit: { cfaDesc: any };
              find: { cfaDesc: any };
            }) => {
              group.cfaXrefs.forEach((cfaXrefs) => {
               
                if(this.data.loadFindingRuleArcData?.citation===group.cit.cfaDesc ){
                this.dataForTable.push({
                  citation: group.cit.cfaDesc,
                  finding: group.find.cfaDesc,
                  ARC: cfaXrefs.arc.cfaDesc, 
                  selected: true
                });
              }
              else{
                this.dataForTable.push({
                  citation: group.cit.cfaDesc,
                  finding: group.find.cfaDesc,
                  ARC: cfaXrefs.arc.cfaDesc, 
                  selected: false
                  
                });
              }
              });
            }
          );
          this.dataSource = new MatTableDataSource(this.dataForTable);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.finalSelectedData = this.dataForTable;
          this.selectedElement = this.dataForTable;
          var getdata = this.selectedElement.citation;
          //this.dataSource = [...this.dataSource];
          console.log({
            dataSourceQuestionnaireFields: this.dataSourceFindingARC,
          });
          console.log("table data:", this.dataForTable);
        }
      });
  }

  radioSelected() {
    console.log(this.selectedElement);
  }

  close() {
    document
      .getElementsByClassName("animate__animated")[0]
      .classList.remove("animate__slideInLeft");
    document
      .getElementsByClassName("animate__animated")[0]
      .classList.add("animate__slideOutRight");
    setTimeout(() => {
      this.dialog.closeAll();
    }, 1000);
  }
}
