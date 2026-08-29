import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-report-module-popup',
    templateUrl: './ReportingModulePopup.component.html',
    styleUrls: ['./ReportingModulePopup.component.scss'],
    standalone: false
})
export class ReportingModulePopupComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<ReportingModulePopupComponent>,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  public headerName = "";
  public pageName = "";
  public emitdata: any

  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName
      this.pageName = this.data?.pageName
      this.emitdata = this.data?.emailData
    }
  }


}
