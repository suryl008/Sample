import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { EnhancedFlexFormPopupComponent } from '../EnhancedFlexFormPopup/EnhancedFlexFormPopup.component';
export type labelPosition = "before" | "after";

@Component({
  selector: 'app-enhanced-form-list',
  templateUrl: './EnhancedFlexFormList.component.html',
  styleUrls: ['./EnhancedFlexFormList.component.scss']
})

export class EnhancedFlexFormListComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient, private toastr: ToastrService) {

  }

  @ViewChild('MatPaginator') paginator1: MatPaginator;

  @Input() enhancedSelectedID: number;
  @Input() enhancedSelectedData: any = [];
  @Output() emitTabData = new EventEmitter;


  public headerMenu: any;
  public showSpinner: boolean;
  public formName: string = '';
  public version: string = '';
  public responseData_EnhancedFormField: any = [];
  public responseData: any = []
  public displayedColumns: any = ['name', 'description', 'defaultValue', 'readonly', 'charLimit', 'setValidation', 'setMapping']



  ngOnInit() {
    if (this.enhancedSelectedData != null) {
      this.responseData = JSON.parse(this.enhancedSelectedData);
      this.formName = this.responseData[0][0]['name'];
      this.version = this.responseData[0][0]['version'];
      this.responseData_EnhancedFormField = this.responseData[2];
    }
  }

  openSetValidationPopup(event: any, index) {
    const dialogRef = this.dialog.open(EnhancedFlexFormPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "40%",
      height: "35%",
      data: { pageName: 'setValidation', headerName: 'Add Validation to Field', emitdata: event },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.data === 'ok') {
        this.responseData_EnhancedFormField[index].fieldRequired = result.emitdata.fieldRequired;
        this.responseData_EnhancedFormField[index].numericOnly = result.emitdata.numericOnly;
        this.responseData_EnhancedFormField[index].alphaOnly = result.emitdata.alphaOnly;
      }
    });
  }

  saveEnhancedField() {
    console.log(this.responseData_EnhancedFormField);
  }

  cancelEnhancedForm(){
    this.emitTabData.emit({selectedPage : 'enhancedSearch', showDetails : false})
  }

}