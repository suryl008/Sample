import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-report-module-popup',
  templateUrl: './ReportingModulePopup.component.html',
  styleUrls: ['./ReportingModulePopup.component.css', '../UserSecurity.css']
})
export class ReportingModulePopupComponent implements OnInit {

  constructor( private formBuilder : FormBuilder,  public dialog: MatDialog ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
   
  }


}
