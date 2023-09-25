import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/services/shared.service';
import { DirectorVisitPopupcomponent } from '../DirectorVisitPopup/DirectorVisitPopup.component';

export type labelPosition = "before" | "after";

@Component({
  selector: 'app-directorvisit-search',
  templateUrl: './DirectorVisitSearch.component.html',
  styleUrls: ['./DirectorVisitSearch.component.scss']
})

export class DirectorVisitSearchComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient, private sharedService: SharedService) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginator1') paginator1: MatPaginator;

  @Output() emitTabData = new EventEmitter;

  public headerMenu: any;
  public showSpinner: boolean;
  public activeStatus: any
  public responseData: any;
  public selectedIndex: number;

  public directorList: any = [];
  public subRecipientList: any = [];
  public initialdirectorList: any = [];
  public initialSubRecipientList: any = [];
  public filterEntities: any = [];
  public directorSearchResult: any = [];
  public directorResult: any = [];

  public addNewVisitorCode: string = '';

  public displayedColumns: any = ['sub_rec_cd', 'sub_rec_name', 'ISDName', 'AgencyReviewCount', 'action'];
  public displayedSearchColumns: any = ['row_type_desc', 'sub_rec_cd', 'sub_rec_name', 'ISDName', 'row_ref_no', 'rvw_yr', 'action'];

  // Model
  public selectVisitFormSearch: any = {

  }

  public tempClearSearch: any = {
    directorName: "",
    subRecipientName: "",
    filterEntities: 1,
  }

  ngOnInit() {
    this.filterEntities = [
      { status: 'Assigned', value: 1 },
      { status: 'UnAssigned', value: 0 },
    ]
    this.selectedIndex = 0;
    this.getDirectorDropdown();
    this.getSubRecipientList();
    this.getDirectorList();
  }

  getDirectorDropdown() {
    this.httpClient.get("assets/api-data/GetAllRvwTypes.json").subscribe
      (res => {
        this.initialdirectorList = res;
        this.directorList = res;
      })
  }

  getSubRecipientList() {
    this.httpClient.get("assets/api-data/GetAllRvwTypes.json").subscribe
      (res => {
        this.initialSubRecipientList = res;
        this.subRecipientList = res;

      })
  }

  getDirectorList() {
    this.httpClient.get("assets/api-data/DirectorVisit/Table1.json").subscribe
      ((res: any) => {
        this.directorResult = new MatTableDataSource(res[0]);
        setTimeout(() => this.directorResult.paginator = this.paginator);
      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.directorResult.filter = filterValue.trim().toLowerCase();
  }

  addNewVisitor() {

  }

  changeAutoComplete(type, autoComplete, event) {
    if (event.isUserInput) {

    }
  }

  clearAutoComplete(type) {

  }

  filterAutoComplete(field) {
    if (field == 'director') {
      this.directorList = [];
      this.initialdirectorList.forEach(element => {
        var directorCode: string; var directorName: string;
        directorCode = element.directorCode; directorName = element.directorName
        if (directorName.toLocaleLowerCase().includes(this.tempClearSearch.directorName.toLowerCase())
          || directorName.toLocaleLowerCase().includes(this.tempClearSearch.directorName.toLowerCase())
          || (directorName.toLocaleLowerCase() + ' (' + directorName.toLocaleLowerCase() + ')').includes(this.tempClearSearch.directorName.toLowerCase())
        ) {
          this.directorList.push(element);
        }
      });
    }
    if (field == 'subRecipient') {
      this.subRecipientList = [];
      this.initialSubRecipientList.forEach(element => {
        var subRecipientCode: string; var subRecipientDesc: string;
        subRecipientCode = element.subRecipientCode; subRecipientDesc = element.subRecipientName
        if (subRecipientCode.toLocaleLowerCase().includes(this.tempClearSearch.subRecipientName.toLowerCase())
          || subRecipientDesc.toLocaleLowerCase().includes(this.tempClearSearch.subRecipientName.toLowerCase())
          || (subRecipientDesc.toLocaleLowerCase() + ' (' + subRecipientCode.toString().toLocaleLowerCase() + ')').includes(this.tempClearSearch.grantPgmDesc.toLowerCase())
        ) {
          this.subRecipientList.push(element);
        }
      });
    }
  }

  searchReporting() {
    this.httpClient.get("assets/api-data/DirectorVisit/Table2.json").subscribe
      ((res: any) => {
        this.directorSearchResult = new MatTableDataSource(res[0]);
        setTimeout(() => this.directorSearchResult.paginator = this.paginator1);
      })
  }

  openDirectorVisitDetails(element) {
    this.selectedIndex = 1;
    this.emitTabData.emit({ selectedPage: 'visitDetails', showDetails: true, directorVisitSelectedID: element?.sub_rvw_id })
  }

  openContactsDetails(element) {
    const dialogRef = this.dialog.open(DirectorVisitPopupcomponent, {
      maxWidth: "150vw",
      maxHeight: "200vh",

      width: "40%",
      height: "40%",
      data: { pageName: 'directorContact', headerName: 'Contact Details', emitdata: element },
      autoFocus: false
    });

  }
}
