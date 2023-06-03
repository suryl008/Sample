import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';

@Component({
  selector: 'app-report-module-details',
  templateUrl: './ReportingModuleDetails.component.html',
  styleUrls: ['./ReportingModuleDetails.component.scss']
})

export class ReportingModuleDetailsComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private httpClient: HttpClient,) {

  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;

  @Input() reportModuleId : number;
  @Output() emitresponseData = new EventEmitter

  public showSpinner: boolean;
  public initialResponseData: any;
  public responseData: any = {};
  public dataSourceList: any = [];
  public progReviewTypeList: any;
  public reviewTypeList: any;
  public displayedColumns: any = [];
  public dataList: any = [];

  public columnsHeaders = [
    { fieldName: 'sourceType', headerName: 'Source', visible: true },
    { fieldName: 'reviewDataFieldName', headerName: 'Field Name', visible: true },
    { fieldName: 'filter', headerName: 'Filter', visible: true },
    { fieldName: 'filteroperator', headerName: 'Operator', visible: true },
    { fieldName: 'filterValue', headerName: 'Value', visible: true },
  ]

  ngOnInit() {
    this.showSpinner = true;
    this.getProgReviewType();
    this.bindUserDetails();
    this.columnsHeaderForDataTable();
  }

  columnsHeaderForDataTable(){
    this.columnsHeaders.forEach(element => {
      this.displayedColumns.push(element.fieldName);
    })
  }

  getProgReviewType() {
    this.httpClient.get("assets/api-data/GetAllPgmSearchLookup.json").subscribe(data => {
      this.progReviewTypeList = data;
      console.log(this.progReviewTypeList)
    })
  }

  bindUserDetails(){
    let payLoad ={
      "reportModuleID" : this.reportModuleId
    }
    this.httpClient.get("assets/api-data/ReportModule/reportDetail.json").subscribe
    (res => {
      console.log(res)
      this.initialResponseData = JSON.parse(JSON.stringify(res));
      this.responseData = JSON.parse(JSON.stringify(res));
      if(this.responseData.grantPgmId){
        this.reviewTypeList = this.progReviewTypeList.filter(element => element.grantPgmId == this.responseData.grantPgmId)[0]['pgmRvwInfos'];
      }
      this.loadReportDataList(this.responseData.reportModuleFieldInfos)
      this.showSpinner = false;
    })
  }

  changeProgramName(program: any, event: any) {
    if (event.isUserInput) {
      this.reviewTypeList = [];
      this.reviewTypeList = program.pgmRvwInfos;
      this.responseData.grantPgmId = program?.grantPgmId;
      this.responseData.grantPgmDesc = program?.grantPgmDesc;
      this.responseData.grantPgm = program?.grantPgm;
      this.responseData.rvwType = program?.rvwType;
    }
  }

  changeReviewName(review, event) {
    if (event.isUserInput) {
      this.responseData.rvwType = review?.rvwType;
    }
  }

  clearAutoSelect(field) {
    if (field == 'program') {
      this.responseData.grantPgmDesc = '';
      this.responseData.grantPgmId = '';''
      this.responseData.grantPgm = '';
      this.responseData.rvwType = '';
      this.responseData.rvwDesc = '';
    }
    if (field == 'review') {
      this.responseData.rvwType = '';
      this.responseData.rvwDesc = '';
    }
  }

  loadReportDataList(reportModuleDataLists){
    this.dataSourceList = new MatTableDataSource(this.responseData.reportModuleFieldInfos);
    console.log(this.dataSourceList)
    setTimeout(() => this.dataSourceList.paginator = this.paginator);
    this.showSpinner = false;
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.responseData.filteredData.findIndex((d) => d === event.item.data);
    moveItemInArray(this.responseData.filteredData, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  addEditDataList(){
    
  }

  previewReportModuleUser(){

  }

  saveReportModuleUser(){
    console.log(this.responseData)
  }

  deleteReportModuleUser(){

  }

  cancelReportModuleUser(){
    this.emitresponseData.emit({selectedPage : 'reportModuleList', showDetails : false})
  }
  

}
