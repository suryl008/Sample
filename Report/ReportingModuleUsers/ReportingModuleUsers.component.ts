import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
export type labelPosition = "before" | "after";
@Component({
  selector: 'app-report-module-users',
  templateUrl: './ReportingModuleUsers.component.html',
  styleUrls: ['./ReportingModuleUsers.component.scss']
})

export class ReportingModuleUsersComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient, private toastr: ToastrService) {

  }

  @ViewChild('MatPaginator1') paginator1: MatPaginator;
  @ViewChild('MatPaginator2') paginator2: MatPaginator;

  @Input() reportModuleId: number;
  @Output() emitReportModuleDetails = new EventEmitter;

  public headerMenu: any;
  public showSpinner: boolean;
  public currentUserResponseData: any = [];
  public searchUserResponseData: any = [];
  public displayedColumns: any = [];
  public searchUserDetails: any;
  public newSearchUserDetails: any = {
    userId: null,
    userName: null,
    fName: null,
    lName: null,
    userRole: null,
    userDsg: null,
    offCd: null,
    recStat: 'O',
  };

  public columnsHeaders = [
    { fieldName: 'userName', headerName: 'User Name', visible: true },
    { fieldName: 'fName', headerName: 'First Name', visible: true },
    { fieldName: 'lName', headerName: 'Last Name', visible: true },
    { fieldName: 'offCd', headerName: 'Office', visible: true },
    { fieldName: 'recStat', headerName: 'Status', visible: true },
    { fieldName: 'userRole', headerName: 'User Role', visible: true },
    { fieldName: 'userDsg', headerName: 'User Designation', visible: true },
  ]

  ngOnInit() {
    this.showSpinner = true;
    this.searchUserDetails = JSON.parse(JSON.stringify(this.newSearchUserDetails));
    this.columnsHeaderForDataTable();
    this.currentUsersReportList();
  }

  columnsHeaderForDataTable() {
    this.columnsHeaders.forEach(element => {
      this.displayedColumns.push(element.fieldName);
    })
    this.displayedColumns.push('Action');
  }

  currentUsersReportList() {
    let payload = {
      "reportModuleId": this.reportModuleId
    }

    this.httpClient.get("assets/api-data/ReportModule/reportUsers.json").subscribe
      (res => {
        this.currentUserResponseData = res;
        this.currentUserResponseData = new MatTableDataSource(this.currentUserResponseData);
        setTimeout(() => this.currentUserResponseData.paginator = this.paginator1);
        this.showSpinner = false;
      })

  }

  removeReportUser(data, mode) {
    this.showSpinner = true;
    let payLoad;
    if (mode == 'all') {
      let listOfCurrentUserMappedID = [];
      this.currentUserResponseData?.filteredData.filter(element => {
        listOfCurrentUserMappedID.push(element.reportModule_UsersID)
      });
      payLoad = {
        "reportModule_UsersID": listOfCurrentUserMappedID
      }
    } else {
      payLoad = {
        "reportModule_UsersID": [data.reportModule_UsersID]
      }
      const objWithIdIndex = this.currentUserResponseData?.filteredData?.findIndex((obj) => obj.userID === data.userID);
      if (objWithIdIndex > -1) {
        this.currentUserResponseData.filteredData.splice(objWithIdIndex, 1);
      }
    }
    //API CALL 
    this.toastr.success(mode == 'all' ? 'All users has been removed successfully!' : data.userName + ' has been removed successfully!');
    mode == 'all' ? this.currentUserResponseData = [] : this.currentUserResponseData.filteredData.length > 0 ? '' : this.currentUserResponseData = [];
    setTimeout(() => this.currentUserResponseData.paginator = this.paginator1);
    this.showSpinner = false;
  }

  searchUsersReportList() {
    this.showSpinner = true;
    let payload = {
      fName: this.searchUserDetails.fName,
      lName: this.searchUserDetails.lName,
      userRole: this.searchUserDetails.userRole,
      userDsg: this.searchUserDetails.userDsg,
      offCd: this.searchUserDetails.offCd,
      recStat: this.searchUserDetails.recStat,
    }
    this.httpClient.get("assets/api-data/ReportModule/reportUsers.json").subscribe
      (res => {
        this.searchUserResponseData = res;
        this.searchUserResponseData = new MatTableDataSource(this.searchUserResponseData);
        setTimeout(() => this.searchUserResponseData.paginator = this.paginator2);
        this.showSpinner = false;
      })
  }

  clearReportUsers() {
    this.searchUserResponseData = [];
    this.searchUserDetails = JSON.parse(JSON.stringify(this.newSearchUserDetails));
  }

  addReportUser(data, mode) {
    this.showSpinner = true;
    let payLoad;
    if (mode == 'all') {
      let listOfAddedUsersID = [];
      this.searchUserResponseData?.filteredData.filter(element => {
        listOfAddedUsersID.push({ 'userId': element.userID, 'reportModuleId': this.reportModuleId })
      });
      payLoad = {
        'addedUserList': listOfAddedUsersID
      }
    }
    else {
      payLoad = {
        'addedUserList': [{
          'userId': data.userID,
          'reportModuleId': this.reportModuleId
        }]
      }
      const objWithIdIndex = this.searchUserResponseData?.filteredData?.findIndex((obj) => obj.userID === data.userID);
      if (objWithIdIndex > -1) {
        this.searchUserResponseData.filteredData.splice(objWithIdIndex, 1);
      }
    }

    //API CALL 
    this.toastr.success(mode == 'all' ? 'All users has been added successfully!' : data.userName + ' has been added successfully!');
    mode == 'all' ? this.searchUserResponseData = [] : this.searchUserResponseData.filteredData.length > 0 ? '' : this.searchUserResponseData = [];
    setTimeout(() => this.searchUserResponseData.paginator = this.paginator2);
    this.currentUsersReportList();
    this.showSpinner = false;
  }

}