import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  constructor(
    private cd : ChangeDetectorRef, 
    private sharedService: SharedService,
    private dialogRef: MatDialogRef<PopupComponent>,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public headerName = "";
  public pageName = "";
  public emitdata: any;
  public responseData = new MatTableDataSource()
  public refresh : boolean = false;

  public displayedColumns = [
    "action",
    "errandScheduleId",
    "scheduleType",
    "scheduleValue",
    "scheduleTime",
  ];
  public matColumnConfig = [
    {
      "id": "errandScheduleId",
      "name": "Schedule ID"
    },
    {
      "id": "scheduleType",
      "name": "Schedule Type"
    },
    {
      "id": "scheduleValue",
      "name": "Schedule Value"
    },
    {
      "id": "scheduleTime",
      "name": "Schedule Time"
    },
  ]

  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      console.log(this.emitdata)
      this.responseData = new MatTableDataSource(this.emitdata?.errandSchedules)
      console.log( this.data, this.pageName)
    }
  }

  addNewErrandSchedule() {
    this.refresh = true;
    let data = JSON.parse(JSON.stringify(this.data))
    this.responseData.data.push(data);
    this.cd.detectChanges();
    this.responseData._updateChangeSubscription();
    this.refresh = false;
    let id = "errandName_"+ (this.responseData.data?.length - 1);
    console.log(id)
    setTimeout(() => {
      document.getElementById(id)?.focus();
    }, 100);
  }

  enableSaveButton(){
    return this.responseData?.data.filter((x:any) => x.errandName == '')?.length > 0 || this.responseData?.data.filter((x:any) => x.isEdit)?.length > 0
  }

  saveOrUpdate(data :any){
    console.log(data);
    data.isEdit = !data.isEdit;
  }

}
