import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import * as XLSX from 'xlsx';

export type labelPosition = "before" | "after";

@Component({
  selector: 'app-report-module-list',
  templateUrl: './ReportingModuleList.component.html',
  styleUrls: ['./ReportingModuleList.component.scss']
})

export class ReportingModuleListComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private httpClient: HttpClient, private sharedService: SharedService) {

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
  public excelHeaderTemplateData: any = [];
  public excelRowTemplateData: any = [];
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
    this.emitReportModuleDetails.emit({ selectedPage: 'reportModuleDetails', mode: mode, showDetails: true, reportModuleID: element?.reportModuleID })
  }

  async downloadReportingData(element) {
    this.showSpinner = true;
    try {
      this.httpClient.get("assets/api-data/ReportModule/excelResponse.json").subscribe
        (async res => {
          this.excelRowTemplateData = res;
          if (element.templateName != '' && element.templateName != null && element.templateName != undefined) {
            this.httpClient.get('assets/ExcelTemplate/' + element.templateName + '.xlsx', { responseType: 'blob' }).subscribe(async (data: any) => {
              let fileReader = new FileReader();
              fileReader.readAsBinaryString(data);
              fileReader.onload = async (e) => {
                await this.generateExcelFormat(fileReader.result, element, true)
              }
            })
          }
          else {
            await this.generateExcelFormat(this.excelRowTemplateData, element, false);
          }
        });
    } catch (error) {
      this.showSpinner = false;
    }

  }

  generateExcelFormat(excelData, downloadDetails, isTemplateHeader) {
    let finalArray = [];
    let sheetHeaderCount = [];
    downloadDetails['sheetHeaderCount'] = [];
    try {
      if (isTemplateHeader) {
        const wb: XLSX.WorkBook = XLSX.read(excelData, { type: 'binary' });
        const wsname: string[] = wb.SheetNames;
        if (wsname.length <= this.excelRowTemplateData.length) {
          var i: number = this.excelRowTemplateData.length - wsname.length;
          for (let index = 0; index < i; index++) {
            wsname[this.excelRowTemplateData.length - i] = 'Added_Result' + (index + 1);
          }
        }
        if (wsname.length > 0) {
          wsname.forEach((sheetName, index) => {
            const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
            const excelArray = XLSX.utils.sheet_to_json(ws, { defval: '__COLUMN', blankrows: false });
            sheetHeaderCount.push(excelArray.length > 0 ? excelArray.length : 0)
            let isEmptyHeader: any = excelArray.length - 1 >= 0 ? false : true;
            if (this.excelRowTemplateData[index]) {
              const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excelRowTemplateData[index]);
              const wb: XLSX.WorkBook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'test');
              const sheetArray = XLSX.utils.sheet_to_json(ws, { header: 1 });
              var sheetArrayList = JSON.parse(JSON.stringify(sheetArray))
              var excelHeaderArrayList = JSON.parse(JSON.stringify(excelArray))
              if (sheetArrayList.length > 0) {
                let keys: any = excelArray.length - 1 >= 0 ? Object.keys(excelArray[excelArray.length - 1]) : sheetArray[0];
                sheetArrayList.forEach((x, arrayIndex) => {
                  let newArray = {};
                  if (arrayIndex > 0) {
                    if (keys.length > 0) {
                      keys.forEach((key, index) => {
                        newArray[key] = x[index];
                      })
                      excelHeaderArrayList.push(newArray);
                    }
                  }
                });
              }
            }
            finalArray.push(excelHeaderArrayList);
          })
        }
        downloadDetails['sheetHeaderCount'] = sheetHeaderCount;
        this.sharedService.exportToExcel(finalArray, downloadDetails, wsname, isTemplateHeader);
        this.showSpinner = false;
      }
      else {
        let wsname = [];
        if (this.excelRowTemplateData.length > 0) {
          this.excelRowTemplateData.forEach((element, index) => {
            let excelArray = [];
            wsname.push('Result' + (index + 1))
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(element);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'sheet1');
            const sheetArray = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (sheetArray.length > 0) {
              sheetArray.forEach((x, index) => {
                excelArray.push(x);
              });
            }
            finalArray.push(excelArray);
          });
        }
        this.sharedService.exportToExcel(finalArray, downloadDetails, wsname, isTemplateHeader);
        this.showSpinner = false;
      }
    } catch (error) {
      this.showSpinner = false;
    }
  
  }

  addNewReportingModule() {

  }

}
