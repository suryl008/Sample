import { ChangeDetectorRef, Component, Inject, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProgramAdministrationService } from 'src/app/shared/services/program-administration.service';
import { ConfirmDialogComponent } from '../../../program-info/confirm-dialog/confirm-dialog.component';
import { SetupDialogComponent } from '../setup-dialog/setup-dialog.component';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  @ViewChild(MatSort) sort: any = MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() data: any;
setups:any;
findingSetups: any;
displayedColumnsUsers: string[] = [
  "arcDesc",
  "category",
  "editAppl",
  "delete"
];
arcCategory:any=[];
  constructor(
    public dialog: MatDialog,
    private programAdministrationService: ProgramAdministrationService,
    private cd: ChangeDetectorRef,
   
  ) { }

  ngOnInit(): void {
    this.setups =[{"desc": "eireoiruer","category":"erer","edit":true}];
    this.findingSetups = new MatTableDataSource(this.data);
    this.findingSetups.sort = this.sort;
    this.findingSetups.paginator = this.paginator;
    this.getARCCategory();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.data);

    console.log(changes.data.currentValue);
    this.findingSetups = new MatTableDataSource(changes.data.currentValue);
    if (changes.data.currentValue.length) {
    }
  }
  addFinding(){
    const dialogRef = this.dialog.open(SetupDialogComponent, {
      width: "750px",
      disableClose: true,
      data: {
       
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
    })
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

  openDialog(element: any): void {
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
    this.findingSetups.data.splice(
      this.findingSetups.data.indexOf(data),
      1
    );
    this.findingSetups._updateChangeSubscription();
    this.cd.markForCheck();
  }
}

