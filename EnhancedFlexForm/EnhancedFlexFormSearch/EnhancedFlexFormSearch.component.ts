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
  selector: 'app-enhanced-form-search',
  templateUrl: './EnhancedFlexFormSearch.component.html',
  styleUrls: ['./EnhancedFlexFormSearch.component.scss']
})

export class EnhancedFlexFormSearchComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private httpClient: HttpClient, private sharedService: SharedService) {

  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitTabData = new EventEmitter
  public headerMenu: any;
  public showSpinner: boolean;
  public showReportSearch: boolean = true;
  public activeStatus: any
  public responseData: any;
  public selectedIndex: number;
  public labelName = "karthik"

  public officeList: any = [];
  public programList: any = [];
  public reviewList: any = [];
  public formList: any = [];
  public enhancedFormSearchResult: any = [];
  public displayedColumns: any = ['name', 'version', 'published', 'offName', 'grantPgmDesc', 'reviewType', 'action'];

  // Model
  public enhancedFormSearch: any = {
    flexFormPDFTemplateID: '',
    offCd: '',
    grantProgramID: 0,
    reviewType: '',
    published: true,
    formCode: '',
    formName: '',
    program: '',
    reviewTypeDesc: '',
    orderBy: '',
    activeStatus: 1,
  }

  public tempClearSearch: any = {
    offName: "",
    grantPgmDesc: "",
    reviewType: "",
    formName: "",
  }

  ngOnInit() {
    this.activeStatus = [
      { status: 'Yes', value: 1 },
      { status: 'No', value: 0 },
      { status: 'Both', value: -1 },
    ]
    this.selectedIndex = 0;
    this.getofficeList();
    this.getProgramList();
    this.getFormList();
  }

  getofficeList() {
    this.httpClient.get("assets/api-data/GetAllOffInfo.json").subscribe
      (res => {
        this.officeList = res;
      })
  }

  getProgramList() {
    this.httpClient.get("assets/api-data/GetAllPgmSearchLookup.json").subscribe
      (res => {
        this.programList = res;
      })
  }

  getReviewList(grantProgramID) {
    this.httpClient.get("assets/api-data/GetAllRvwTypes.json").subscribe
      (res => {
        this.reviewList = res;
      })
  }

  getFormList() {
    this.formList = [
      {
        formCode: '',
        name: "FormList-1",
        flexFormPDFTemplateID: 41,
        pdfFileName: 'FormList-1.xlsx',
        offCd: '',
        program: '',
        reviweType: ''
      },
      {
        formCode: '',
        name: "FormList-2",
        flexFormPDFTemplateID: 43,
        pdfFileName: 'FormList-1.xlsx',
        offCd: '',
        program: '',
        reviweType: ''
      },
      {
        formCode: '',
        name: "FormList-3",
        flexFormPDFTemplateID: 43,
        pdfFileName: 'FormList-3.xlsx',
        offCd: '',
        program: '',
        reviweType: ''
      }
    ]
  }

  changeAutoComplete(type, autoComplete, event) {
    if (event.isUserInput) {
      if (type == 'office') {
        this.enhancedFormSearch.offCd = autoComplete?.offCd;
      }
      if (type == 'program') {
        this.enhancedFormSearch.grantProgramID = autoComplete?.grantPgmId;
        this.enhancedFormSearch.reviewType = '';
        this.enhancedFormSearch.reviewTypeDesc = '';
        this.tempClearSearch.reviewType = '';
        this.getReviewList(this.enhancedFormSearch.grantProgramID);
      }
      if (type == 'review') {
        this.enhancedFormSearch.reviewType = autoComplete?.rvwType1;
        this.enhancedFormSearch.reviewTypeDesc = autoComplete?.rvwDesc;
      }
      if (type == 'form') {
        this.enhancedFormSearch.flexFormPDFTemplateID = autoComplete?.flexFormPDFTemplateID;
        this.enhancedFormSearch.formCode = autoComplete?.formCode;
      }
    }
  }

  clearAutoComplete(type) {
    if (type == 'office') {
      this.enhancedFormSearch.offCd = '';
      this.tempClearSearch.offName = '';
    }
    if (type == 'program') {
      this.enhancedFormSearch.grantProgramID = 0;
      this.enhancedFormSearch.reviewType = '';
      this.enhancedFormSearch.reviewTypeDesc = '';
      this.tempClearSearch.grantPgmDesc = '';
      this.tempClearSearch.reviewType = '';
    }
    if (type == 'review') {
      this.enhancedFormSearch.reviewType = '';
      this.enhancedFormSearch.reviewTypeDesc = '';
      this.tempClearSearch.reviewType = '';
    }
    if (type == 'form') {
      this.enhancedFormSearch.flexFormPDFTemplateID = 0;
      this.enhancedFormSearch.formCode = '';
      this.tempClearSearch.formName = '';
    }
  }

  searchReporting() {
    console.log(this.enhancedFormSearch);
    this.httpClient.get("assets/api-data/Enhanced/searchGrid.json").subscribe
      ((res: any) => {
        this.enhancedFormSearchResult = new MatTableDataSource(res);
        setTimeout(() => this.enhancedFormSearchResult.paginator = this.paginator);
      })
  }

  openAddorEditEnhancedDetails(element) {
    console.log(element)
    this.emitTabData.emit({ selectedPage: 'enhancedDetails', showDetails: true, enhancedSelectedID: element?.flexFormPDFTemplateID })
  }
}
