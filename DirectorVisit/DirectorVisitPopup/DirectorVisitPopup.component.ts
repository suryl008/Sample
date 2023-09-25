import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-directorvisitpopup-popup',
  templateUrl: './DirectorVisitPopup.component.html',
  styleUrls: ['./DirectorVisitPopup.component.scss']
})
export class DirectorVisitPopupcomponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<DirectorVisitPopupcomponent>,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public contactInfo: any = {};
  public headerName = "";
  public pageName = "";
  public emitdata: any;

  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      console.log( this.data, this.pageName)

      if(this.pageName == 'directorContact'){
        //FOR API CALL PAYLOAD - this.emitdata.sub_rec_cd
        //FOR API CALL RESPONSE - this.contactInfo
        this.contactInfo.contact_name = "Test Name";
        this.contactInfo.contact_phone = "906-786-9300";
        this.contactInfo.contact_email = "test@gmail.com";
      }
    }

  }

  closePopup(data) {
    this.dialogRef.close({ pageName: this.pageName, data :data, emitdata: [this.emitdata] });
  }


}
