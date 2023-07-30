import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-Enhanced-popup',
  templateUrl: './EnhancedFlexFormPopup.component.html',
  styleUrls: ['./EnhancedFlexFormPopup.component.scss']
})
export class EnhancedFlexFormPopupComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<EnhancedFlexFormPopupComponent>,
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
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
    }
  }

  closePopup(data) {
    this.dialogRef.close({ pageName: this.pageName, data :data, emitdata: this.emitdata });
  }


}
