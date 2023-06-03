import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';

export type labelPosition = "before" | "after";

@Component({
  selector: 'app-report-module-list',
  templateUrl: './ReportingModuleList.component.html',
  styleUrls: ['./ReportingModuleList.component.scss']
})

export class ReportingModuleListComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private httpClient: HttpClient,) {

  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitReportModuleDetails = new EventEmitter
  public headerMenu: any;
  public showSpinner: boolean;
  public showReportSearch: boolean = true;
  public assignmentType: any
  public responseData: any;
  public progReviewTypeList: any;
  public reviewTypeList: any;
  public displayedColumns: any = [];
  public selectedIndex: number;
  public searchPayloadData: any = {
    grantProgramID: '',
    reviewType: '',
    userID: '',
    allReviews: 'N',
    reportModuleID: 0
  };

  public columnsHeaders = [
    { fieldName: 'reportName', headerName: 'Name', visible: true },
    { fieldName: 'grantPgmDesc', headerName: 'Program Name', visible: true },
    { fieldName: 'rvwType', headerName: 'Review Type', visible: true },
    { fieldName: 'createdByName', headerName: 'Created On', visible: true },
    { fieldName: 'assignedUsers', headerName: 'Assigned Users', visible: true },
  ]

  ngOnInit() {
    this.getProgReviewType();
    this.assignmentType = [
      { status: 'Assign', value: 'N' },
      { status: 'All', value: 'Y' },
    ]
    this.selectedIndex = 0;
    this.columnsHeaderForDataTable();
  }

  getProgReviewType() {
    this.httpClient.get("assets/api-data/GetAllPgmSearchLookup.json").subscribe(data => {
      this.progReviewTypeList = data;
    })
  }

  changeProgramName(program: any, event: any) {
    if (event.isUserInput) {
      this.reviewTypeList = [];
      this.reviewTypeList = program.pgmRvwInfos;
      this.searchPayloadData.grantProgramID = program?.grantPgmId;
      this.searchPayloadData.reviewType = '';
    }
  }

  changeReviewName(review, event) {
    if (event.isUserInput) {
      this.searchPayloadData.reviewType = review?.rvwType;
    }
  }

  clearAutoSelect(field) {
    if (field == 'program') {
      this.searchPayloadData.grantPgmDesc = '';
      this.searchPayloadData.grantProgramID = '';
      this.searchPayloadData.reviewType = '';
    }
    if (field == 'review') {
      this.searchPayloadData.reviewType = '';
    }
  }
  
  searchReporting() {
    this.showSpinner = true;
    let PayLoad = {
      grantProgramID: this.searchPayloadData.grantProgramID,
      reviewType: this.searchPayloadData.reviewType,
      allReviews: this.searchPayloadData.allReviews,
      userID: '12345',
      reportModuleID: 0
    }
    this.httpClient.get("assets/api-data/ReportModule/reportSearch.json").subscribe
      (res => {
        this.responseData = res;
        this.responseData = new MatTableDataSource(this.responseData);
        setTimeout(() => this.responseData.paginator = this.paginator);
        this.showSpinner = false;
      })
  }

  columnsHeaderForDataTable() {
    this.columnsHeaders.forEach(element => {
      this.displayedColumns.push(element.fieldName);
    })
    this.displayedColumns.push('Action');
  }

  openAddorEditReportingModule(mode, element?) {
    this.emitReportModuleDetails.emit({ selectedPage: 'reportModuleDetails', showDetails: true, reportModuleID : element?.reportModuleID })
  }

  downloadReportingData(element) {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 1500);
  }

  addNewReportingModule() {

  }

}
