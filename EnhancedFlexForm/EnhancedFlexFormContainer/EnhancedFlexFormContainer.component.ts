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
  selector: 'app-enhanced-container',
  templateUrl: './EnhancedFlexFormContainer.component.html',
  styleUrls: ['./EnhancedFlexFormContainer.component.scss']
})
export class EnhancedFlexFormContainerComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient,) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";

  public headerMenu: any = [];
  public selectedPage: any;
  public selectedIndex: number;
  public enhancedSelectedID : number;
  public enhancedSelectedData : any = [];

  public mode : any;

  ngOnInit() {
    this.headerMenu = [
      { tabHeaderName: 'Search Form', visible: true, selectedPage: 'enhancedSearch' },
      { tabHeaderName: 'Form Information', visible: false, selectedPage: 'enhancedDetails' },
      { tabHeaderName: 'Fields', visible: false, selectedPage: 'enhancedFormFieldList' },
    ]
    this.selectedIndex = 0;
    this.selectedPage = 'enhancedSearch'
  }

  getHeaderTabSelection(event) {
    this.selectedPage = event;
  }

  emitTabData(event) {
    this.selectedPage = event.selectedPage;
    this.enhancedSelectedID = event?.enhancedSelectedID;
    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false :  true;
    })

    this.selectedIndex = this.headerMenu.findIndex(object => {
      return object.selectedPage === event.selectedPage;
    });
  }

  emitEnhancedData(event){
    this.enhancedSelectedData = event;
  }

}
