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
  selector: 'app-directorvisit-container',
  templateUrl: './DirectorVisitContainer.component.html',
  styleUrls: ['./DirectorVisitContainer.component.scss']
})
export class DirectorVisitContainerComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient,) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";

  public headerMenu: any = [];
  public selectedPage: any;
  public selectedIndex: number;
  public directorVisitSelectedID : number;
  public directorVisitSelectedData : any = [];

  public mode : any;

  ngOnInit() {
    this.headerMenu = [
      { tabHeaderName: 'Select Visit', visible: true, selectedPage: 'selectVisit' },
      { tabHeaderName: 'Visit Details', visible: false, selectedPage: 'visitDetails' },
    ]
    this.selectedIndex = 0;
    this.selectedPage = 'selectVisit'
  }

  getHeaderTabSelection(event) {
    this.selectedPage = event;
  }

  emitTabData(event) {
    console.log(event)
    this.selectedPage = event.selectedPage;
    this.directorVisitSelectedID = event?.directorVisitSelectedID;
    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false :  true;
    })

    this.selectedIndex = this.headerMenu.findIndex(object => {
      return object.selectedPage === event.selectedPage;
    });
  }

  emitEnhancedData(event){
    this.directorVisitSelectedData = event;
    console.log(this.directorVisitSelectedData)
  }

}
