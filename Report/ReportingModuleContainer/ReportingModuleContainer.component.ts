import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

export type labelPosition = "before" | "after";
const ELEMENT_DATA = [
  { name: 'Suresh P', program: "Prog -1", reviewType: 'Review-1', createdOn: 'suresh.p@gmail.com', assignedUsers: 'Karthik GB' },
  { name: 'Suresh P', program: "Prog -1", reviewType: 'Review-1', createdOn: 'suresh.p@gmail.com', assignedUsers: 'Karthik GB' },
  { name: 'Suresh P', program: "Prog -1", reviewType: 'Review-1', createdOn: 'suresh.p@gmail.com', assignedUsers: 'Karthik GB' },
  { name: 'Suresh P', program: "Prog -1", reviewType: 'Review-1', createdOn: 'suresh.p@gmail.com', assignedUsers: 'Karthik GB' },
  { name: 'Suresh P', program: "Prog -1", reviewType: 'Review-1', createdOn: 'suresh.p@gmail.com', assignedUsers: 'Karthik GB' },
];

@Component({
  selector: 'app-reportmodule-search',
  templateUrl: './ReportingModuleContainer.component.html',
  styleUrls: ['./ReportingModuleContainer.component.scss']
})
export class ReportingModuleContainerComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient,) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";

  public headerMenu: any = [];
  public selectedPage: any;
  public selectedIndex: number;
  public reportModuleId : number;

  ngOnInit() {
    this.headerMenu = [
      { tabHeaderName: 'Search', visible: true, selectedPage: 'reportModuleList' },
      { tabHeaderName: 'Report', visible: false, selectedPage: 'reportModuleDetails' },
      { tabHeaderName: 'Report Users', visible: false, selectedPage: 'reportModuleUsers' },
    ]
    this.selectedIndex = 0;
    this.selectedPage = 'reportModuleList'
  }

  getHeaderTabSelection(event) {
    this.selectedPage = event;
  }

  emitReportModuleDetails(event) {
    this.selectedPage = event.selectedPage;
    this.reportModuleId = event?.reportModuleID;
    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false :  true;
    })

    this.selectedIndex = this.headerMenu.findIndex(object => {
      return object.selectedPage === event.selectedPage;
    });
  }

}
