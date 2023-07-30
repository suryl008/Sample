import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';
import { EnhancedFlexFormPopupComponent } from '../EnhancedFlexFormPopup/EnhancedFlexFormPopup.component';

@Component({
  selector: 'app-enhanced-details',
  templateUrl: './EnhancedFlexFormDetails.component.html',
  styleUrls: ['./EnhancedFlexFormDetails.component.scss']
})

export class EnhancedFlexFormDetailsComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private httpClient: HttpClient,) {

  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;

  @Input() enhancedSelectedID : number;
  @Output() emitTabData = new EventEmitter;
  @Output() emitEnhancedData = new EventEmitter;

  public showSpinner: boolean;
  public initialResponseData: any;
  public responseData_EnhancedDetails: any = [];  
  public officeList: any = [];
  public programList: any = [];
  public reviewList: any = [];

  async ngOnInit() {
    console.log('Details')
    this.showSpinner = true;
    await this.getofficeList();
    await this.getProgramList();
    await this.bindFormDetails();
  }

  bindFormDetails(){
    let payLoad ={
      "flexFormPDFTemplateID" : this.enhancedSelectedID
    }
    this.httpClient.get("assets/api-data/Enhanced/enhancedDetail.json").subscribe
    (async res => {
      this.initialResponseData = JSON.parse(JSON.stringify(res));
      this.emitEnhancedData.emit(JSON.stringify(res))
      this.responseData_EnhancedDetails = JSON.parse(JSON.stringify(res[0][0]));
      this.showSpinner = false;
    })
  }

  getofficeList() {
    this.httpClient.get("assets/api-data/GetAllOffInfo.json").subscribe
      (async res => {
        this.officeList = res;
      })
  }

  getProgramList() {
    this.httpClient.get("assets/api-data/GetAllPgmSearchLookup.json").subscribe
      (async res => {
        this.programList = res;
      })
  }

  getReviewList(grantProgramID) {
    this.httpClient.get("assets/api-data/GetAllRvwTypes.json").subscribe
      (async res => {
        this.reviewList = res;
      })
  }

  changeAutoComplete(type, autoComplete, event) {
    if (event.isUserInput) {
      if(type == 'office'){
        this.responseData_EnhancedDetails.off_Cd = autoComplete?.offCd;
        this.responseData_EnhancedDetails.off_name = autoComplete?.offName;
      }
      if(type == 'program'){
        this.responseData_EnhancedDetails.grant_Pgm_ID = autoComplete?.grantPgmId;
        this.responseData_EnhancedDetails.grant_Pgm = autoComplete?.grantPgm;
        this.responseData_EnhancedDetails.grant_Pgm_Desc = autoComplete?.grantPgmDesc;
        this.responseData_EnhancedDetails.rvw_type ='';
        this.responseData_EnhancedDetails.rvw_Desc = '';
        this.getReviewList(this.responseData_EnhancedDetails.grant_Pgm_ID);
      }
      if(type == 'review'){
        this.responseData_EnhancedDetails.rvw_type = autoComplete?.rvwType1;
        this.responseData_EnhancedDetails.rvw_Desc = autoComplete?.rvwDesc;
      }
    }
  }

  clearAutoComplete(type){
    if(type == 'office'){
      this.responseData_EnhancedDetails.off_Cd = '';
      this.responseData_EnhancedDetails.off_name = '';
    }
    if(type == 'program'){
      this.responseData_EnhancedDetails.grant_Pgm_ID = '';
      this.responseData_EnhancedDetails.grant_Pgm = '';
      this.responseData_EnhancedDetails.grant_Pgm_Desc = '';
      this.responseData_EnhancedDetails.rvw_type ='';
      this.responseData_EnhancedDetails.rvw_Desc = '';
    }
    if(type == 'review'){
      this.responseData_EnhancedDetails.rvw_type ='';
      this.responseData_EnhancedDetails.rvw_Desc = '';
    }
  }

  saveEnhancedData(){
  }

  cancelEnhancedForm(){
    this.emitTabData.emit({selectedPage : 'enhancedSearch', showDetails : false})
  }
}
