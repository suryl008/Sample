import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from 'ngx-toastr';
import { EnhancedFlexFormPopupComponent } from '../EnhancedFlexFormPopup/EnhancedFlexFormPopup.component';
export type labelPosition = "before" | "after";

@Component({
    selector: 'app-enhanced-form-list',
    templateUrl: './EnhancedFlexFormList.component.html',
    standalone: false
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
  public responseData_EnhancedSetMapping: any = [];
  public responseData: any = []
  public displayedColumns: any = ['name', 'description', 'defaultValue', 'readonly', 'charLimit', 'setValidation', 'setMapping']



  ngOnInit() {
    if (this.enhancedSelectedData != null) {
      this.responseData = JSON.parse(this.enhancedSelectedData);
      this.formName = this.responseData[0][0]['name'];
      this.version = this.responseData[0][0]['version'];
      this.responseData_EnhancedFormField = new MatTableDataSource(this.responseData[2]);
      setTimeout(() => {
        this.responseData_EnhancedFormField.paginator1K = this.paginator1;
      }, 10);
      this.responseData_EnhancedSetMapping = this.responseData[4];
      console.log(this.responseData_EnhancedSetMapping)
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

  openSetMappingPopup(evevt) {
    var newSetMapping = {
      "FlexFormPDFTemplateFieldMappingID": 0,
      "FlexFormPDFTemplateFieldID": evevt.FlexFormPDFTemplateFieldID,
      "FlexFormPDFTemplateID": evevt.FlexFormPDFTemplateID,
      "Name": "",
      "Description": "",
      "MappingType": "",
      "ReviewData": "",
      "ExternalViewID": '',
      "ExternalViewFieldID": 0,
      "OtherFlexFormPDFTemplateID": '',
      "otherFlexFormPDFTemplateFieldID": '',
      "CreatedBy": 0,
      "CreatedBy_Name": "",
      "CreateDate": "",
      "ModifiedBy": "",
      "ModifiedBy_Name": "",
      "ModifyDate": "",
      "ExternalViewFieldName": "",
      "pgm_misc_flds_id": ""
    }
    var selectedSetMapping = this.responseData_EnhancedSetMapping.filter((element: any) => element.FlexFormPDFTemplateFieldID == evevt.FlexFormPDFTemplateFieldID && element.FlexFormPDFTemplateID == evevt.FlexFormPDFTemplateID)[0]
    selectedSetMapping = selectedSetMapping ? selectedSetMapping : newSetMapping;
    console.log(selectedSetMapping)
    const dialogRef = this.dialog.open(EnhancedFlexFormPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "60%",                 
      height: "60%",
      data: { pageName: 'setMapping', headerName: 'Add Mapping to Field', emitdata: selectedSetMapping },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.data === 'ok') {
        result.emitdata.forEach(element => {
          const itemIndex = this.responseData_EnhancedSetMapping.findIndex(o => o.FlexFormPDFTemplateFieldID === element.FlexFormPDFTemplateFieldID);
          if (itemIndex > -1) {
            this.responseData_EnhancedSetMapping[itemIndex] = element;
          } else {
            this.responseData_EnhancedSetMapping.push(element);
          }
        });
      }
    });
  }

  saveEnhancedField() {
    console.log(this.responseData_EnhancedFormField, this.responseData_EnhancedSetMapping);
  }

  cancelEnhancedForm() {
    this.emitTabData.emit({ selectedPage: 'enhancedSearch', showDetails: false })
  }

}