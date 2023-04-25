import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EmailTemplatePopUpComponent } from '../EmailTemplatePopup/EmailTemplatePopup.component';

export type labelPosition = "before" | "after";
const ELEMENT_DATA = [
  { office: 'Office-1', program: "Prog -1", reviewType: 'Review-1', templateName: 'Email Template Name-1', emailSubject: 'Subject-1', status: 'A' },
  { office: 'Office-2', program: "Prog -2", reviewType: 'Review-2', templateName: 'Email Template Name-2', emailSubject: 'Subject-2', status: 'A' },
  { office: 'Office-3', program: "Prog -3", reviewType: 'Review-3', templateName: 'Email Template Name-3', emailSubject: 'Subject-3', status: 'I' },
  { office: 'Office-4', program: "Prog -4", reviewType: 'Review-4', templateName: 'Email Template Name-4', emailSubject: 'Subject-4', status: 'A' },
  { office: 'Office-5', program: "Prog -5", reviewType: 'Review-5', templateName: 'Email Template Name-5', emailSubject: 'Subject-5', status: 'A' },
  { office: 'Office-6', program: "Prog -6", reviewType: 'Review-6', templateName: 'Email Template Name-6', emailSubject: 'Subject-6', status: 'I' },
  { office: 'Office-7', program: "Prog -7", reviewType: 'Review-7', templateName: 'Email Template Name-7', emailSubject: 'Subject-7', status: 'A' },
  { office: 'Office-8', program: "Prog -8", reviewType: 'Review-8', templateName: 'Email Template Name-8', emailSubject: 'Subject-8', status: 'I' },
]

@Component({
  selector: 'app-emailtemplate',
  templateUrl: './EmailTemplate.component.html',
  styleUrls: ['./EmailTemplate.component.scss', '../Communication.scss']
})

export class EmailTemplateComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public headerMenu: any;
  public initialData: any;
  public displayedColumns: any = [];
  public status: any = [];
  public showSpinner: boolean = false;
  public responseData = new MatTableDataSource();

  public columnsHeaders = [
    { fieldName: 'office', headerName: 'Office', visible: true },
    { fieldName: 'program', headerName: 'Program Name', visible: true },
    { fieldName: 'reviewType', headerName: 'Review Type', visible: true },
    { fieldName: 'templateName', headerName: 'Template Name', visible: true },
    { fieldName: 'emailSubject', headerName: 'Email Subject', visible: true },
    { fieldName: 'status', headerName: 'Status', visible: true },
  ]

  constructor(public dialog: MatDialog, private router: Router) { }

  async ngOnInit() {
    this.headerMenu = 'communication';
    this.status = [
      {status : 'All', value : '0', active : false},
      {status : 'Active', value : 'A', active : true}, 
      {status : 'In-Active', value : 'I', active : false}
    ]
    this.columnsHeaderForDataTable();
    this.filterEmailTemplateSearchData('A');
  }

  columnsHeaderForDataTable() {
    this.columnsHeaders.forEach(element => {
      this.displayedColumns.push(element.fieldName);
    })
    this.displayedColumns.push('Action');
  }

  filterEmailTemplateSearchData(status : any) {
    this.showSpinner = true;
    this.initialData = ELEMENT_DATA;
    let filterbyStatusRecords = ELEMENT_DATA.filter(x=> x.status == status)
    this.responseData = new MatTableDataSource(status == '0' ? this.initialData : filterbyStatusRecords);
    setTimeout(() => this.responseData.paginator = this.paginator);
    this.showSpinner = false;
  }

  openAddorEditEmailTemplatePopup(event:any, Mode : any){
    const dialogRef = this.dialog.open(EmailTemplatePopUpComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",

      width: "80%",
      height : "80%",
      data: {pageName : 'emailTemplate', mode : Mode, headerName : Mode == 'add' ? 'Add Email Template' : 'Edit Email Template'},
      autoFocus: false
    });
  }

  confirmationPopup(event:any){
    const dialogRef = this.dialog.open(EmailTemplatePopUpComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",

      width: "40%",
      height : "25%",
      data: {pageName : 'confirmationPopup', headerName : 'Confirmation Message', emailData : event},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
     if(result.data === 'ok'){
        this.changestatus(result.emitdata)
     }
    });
  }

  changestatus(data){
    console.log('changestatus', data);
    //API FOR CHANGE STATUS
  }

  ngAfterViewInit() {
    this.responseData.paginator = this.paginator;
  }

  searchEmailTemplate(event){
    let searchValue = event.target.value.trim();
      this.responseData.filter = searchValue;
      if (this.responseData.paginator) {
        this.responseData.paginator.firstPage();
      }
  }
}

