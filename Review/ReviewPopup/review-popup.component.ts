import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-review-popup',
  templateUrl: './review-popup.component.html',
  styleUrls: ['./review-popup.component.scss']
})
export class ReviewPopupComponent implements OnInit {
  @Output() emitService = new EventEmitter();
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  constructor(
    private sharedService : SharedService,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ReviewPopupComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public headerName = "";
  public pageName = "";
  public emitdata: any;

  public matColumnConfig = [
    {
      "id": "code",
      "name": "Code"
    },
    {
      "id": "type",
      "name": "Type"
    },
    {
      "id": "description",
      "name": "Description"
    },
  ]
  public displayedColumns = [
    "code",
    "type",
    "description",
  ];
  public documentType = ['Attachment', 'Form'];
  public validateType = ['NA', 'Date', 'Unit'];
  public fileTypeApplicability = ['Yes', 'No',];
  public unitTypes = ['Day', 'Month', 'Year'];
  public responseData = new MatTableDataSource();
  public initialResponseData = new MatTableDataSource();

  //Add Schedule Sub-Recipient
  public scheduleSearchObj:any = {
    subRecipient : null,
    parent : null,
  }

  public contractList :any[]= []


  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      if(this.pageName == 'child'){
        //GET API TO LOAD THE VALUES
      }
      if(this.pageName == 'error'){
        this.matColumnConfig = [
          {
            "id": "code",
            "name": "Code"
          },
          {
            "id": "type",
            "name": "Type"
          },
          {
            "id": "description",
            "name": "Description"
          },
        ]
        this.displayedColumns = [
          "code",
          "type",
          "description",
        ];
      }
      if(this.pageName == 'addSchedule'){
        this.matColumnConfig = [
          {
            "id": "sub_rec_cd",
            "name": "Sub Recipient"
          },
          {
            "id": "sub_rec_name",
            "name": "Parent"
          },
          {
            "id": "select",
            "name": "Select"
          },
        ]
        this.displayedColumns = [
          "sub_rec_cd",
          "sub_rec_name",
          "select",
        ];
        this.responseData.data = [
          {"sub_rec_cd" : "Test-1", "sub_rec_name": "parent-1"},
          {"sub_rec_cd" : "Test-2", "sub_rec_name": "parent-2"},
          {"sub_rec_cd" : "Test-3", "sub_rec_name": "parent-3"},
          {"sub_rec_cd" : "Test-4", "sub_rec_name": "parent-4"},
          {"sub_rec_cd" : "Test-5", "sub_rec_name": "parent-5"},
          {"sub_rec_cd" : "Test-6", "sub_rec_name": "parent-6"},
        ];
        this.initialResponseData.data = JSON.parse(JSON.stringify(this.responseData?.data))
      }
      if(this.pageName == 'contacts'){
        this.matColumnConfig = [
          {
            "id": "1",
            "name": "Contract Type"
          },
          {
            "id": "2",
            "name": "Contract Name"
          },
          {
            "id": "3",
            "name": "Email"
          },
          {
            "id": "4",
            "name": "Role"
          },
          {
            "id": "5",
            "name": "Primary"
          },
          {
            "id": "6",
            "name": "Active"
          },
          {
            "id": "7",
            "name": "Traning"
          },
          {
            "id": "8",
            "name": "Select"
          },
        ]
        this.displayedColumns = [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
        ];
        this.initialResponseData.data = JSON.parse(JSON.stringify(this.responseData?.data))
      }
      console.log(this.emitdata);
      setTimeout(() => this.responseData.paginator = this.paginator);
    }
  }

  closePopup(pageName, data) {
    this.dialogRef.close({ pageName: pageName, data: data, emitdata: this.emitdata });
  }

  filterAddScheduleSearch(){
    let data = JSON.parse(JSON.stringify(this.initialResponseData?.data))
    this.scheduleSearchObj.subRecipient = this.scheduleSearchObj?.subRecipient ? this.scheduleSearchObj?.subRecipient : null;
    this.scheduleSearchObj.parent = this.scheduleSearchObj?.parent ? this.scheduleSearchObj?.parent : null;
    if(this.scheduleSearchObj?.subRecipient || this.scheduleSearchObj?.parent){
      let filteredItems = data.filter(item => {
        if (item.subRecipient?.toString()?.toLowerCase().indexOf(this.scheduleSearchObj?.subRecipient?.toString()?.toLowerCase()) != -1 ||
          item.parent.toString()?.toLowerCase().indexOf(this.scheduleSearchObj?.parent?.toString()?.toLowerCase()) != -1) {
          return true;
        }
        return false;
      });
      this.responseData.data = filteredItems;
    }else{
      this.responseData.data = data;
    }
    this.cd.detectChanges();
    this.responseData._updateChangeSubscription();
  }

}
