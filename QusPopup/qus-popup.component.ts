import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PopupComponent } from '../../Popup/popup.component';

@Component({
  selector: 'app-qus-popup',
  templateUrl: './qus-popup.component.html',
  styleUrls: ['./qus-popup.component.scss']
})
export class QusPopupComponent {
  @Output() emitService = new EventEmitter();

  constructor(
    private cd : ChangeDetectorRef, 
    private dialogRef: MatDialogRef<PopupComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public headerName = "";
  public pageName = "";
  public emitdata: any;
  public responseData = new MatTableDataSource();

  public fieldTypeList:any =[];
  public responseViewerList:any =[];
  public sourceList:any =[];

  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      console.log(this.emitdata)
      console.log( this.data, this.pageName)
    }
  }

}
