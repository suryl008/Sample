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

  public MappingList: any = [];
  public reviewDataList: any = [];
  public externalViewList: any = [];
  public externalViewFieldList: any = [];
  public otherFlexForm: any = [];
  public otherFlexFormField: any = [];
  public metaDataFormList: any = [];


  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      console.log(this.emitdata)
    }

    if(this.pageName == 'setMapping'){
      this.MappingList = [
        {id : 'null' , name : 'Please Select'},
        {id : 'RVW' ,  name : 'Review Data'},
        {id : 'ext' ,  name : 'External Data'},
        {id : 'other', name : 'Other Form'},
        {id : 'meta' , name : 'Meta Data'},
      ],
      this.reviewDataList = [
        {id : 0,  name : 'Please Select'},
        {id : 1,  name : 'Review Data'},
        {id : 2,  name : 'External Data'},
        {id : 3,  name : 'Other Form'},
        {id : 4,  name : 'Meta Data'},
      ],
      this.externalViewList = [
        {id : 0,  name : 'Please Select'},
        {id : 1,  name : 'Review Data'},
        {id : 2,  name : 'External Data'},
        {id : 3,  name : 'Other Form'},
        {id : 4,  name : 'Meta Data'},
      ],
      this.otherFlexForm = [
        {id : 0,  name : 'Please Select'},
        {id : 1,  name : 'Review Data'},
        {id : 2,  name : 'External Data'},
        {id : 3,  name : 'Other Form'},
        {id : 4,  name : 'Meta Data'},
      ],
      this.otherFlexFormField = [
        {id : 0,  name : 'Please Select'},
        {id : 1,  name : 'Review Data'},
        {id : 2,  name : 'External Data'},
        {id : 3,  name : 'Other Form'},
        {id : 4,  name : 'Meta Data'},
      ],
      this.metaDataFormList = [
        {id : 0,  name : 'Please Select'},
        {id : 1,  name : 'Review Data'},
        {id : 2,  name : 'External Data'},
        {id : 3,  name : 'Other Form'},
        {id : 4,  name : 'Meta Data'},
      ]
    }
  }

  onSelectionChanged(type, event){
    if(type == 'extField'){
      this.emitdata.ExternalViewFieldName = event.name;
    }
  }

  onSelectGetExternalViewFieldList(event, type, dropdownValue){
    if(event.isUserInput){
      console.log(type, dropdownValue.id)
      let otherFormId = dropdownValue.id;
      //API call to pass otherFormId and get externalViewFieldList
      this.externalViewFieldList = [
        {id : 0, name : 'Please Select'},
        {id : 1, name : 'Review Data'},
        {id : 2, name : 'External Data'},
        {id : 3, name : 'Other Form'},
        {id : 4, name : 'Meta Data'},
      ];
      if(dropdownValue.id == 0){
        this.externalViewFieldList = [];
        this.emitdata.ExternalViewFieldID = '';
        this.emitdata.ExternalViewFieldName = ''
      }
    }
   
  }

  closePopup(data) {
    this.dialogRef.close({ pageName: this.pageName, data :data, emitdata: this.emitdata });
  }


}
