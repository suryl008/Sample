import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-directorvisit-details',
  templateUrl: './DirectorVisitDetails.component.html',
  styleUrls: ['./DirectorVisitDetails.component.scss']
})

export class DirectorVisitDetailsComponent implements OnInit {

  constructor(public dialog: MatDialog, private httpClient: HttpClient,) { }

  @ViewChild('reviewTeamPaginator') reviewTeamPaginator: MatPaginator;
  @ViewChild('stageHistoryPaginator') stageHistoryPaginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;

  @Input() directorVisitSelectedID : number;
  @Output() emitTabData = new EventEmitter;
  @Output() emitEnhancedData = new EventEmitter;

  public showSpinner: boolean;
  public initialResponseData: any;

  public reviewTeamList: any = [];
  public stageHistoryList: any = [];

  public reasonForDeleteList : any =[{id : 0, itemName : 'Please Select'}];
  public satusList : any =[{id : 0, itemName : 'Please Select'}];

  public displayedReviewTeamColumns = ['contact_name', 'prog_desc'];
  public displayedstageHistoryColumns = ['rvw_stage', 'start_dt', 'end_dt', 'compl_by', 'reason', 'view' ];

  async ngOnInit() {
    this.showSpinner = true;
    this.bindFormDetails();
  }

  async bindFormDetails(){
    this.getReviewTeam();
    this.getStageHistory();
    this.showSpinner = false;
  }

  getReasonForDelete() {
    
  }

  getReviewTeam() {
    //PAYLOAD this.directorVisitSelectedID
    let data = [[{
      contact_name: 'TEST_1',
      prog_desc: 'Test Desc'
    },
    {
      contact_name: 'TEST_1',
      prog_desc: 'Test Desc'
    }]];

    this.reviewTeamList = new MatTableDataSource(data[0]);
    setTimeout(() => this.reviewTeamList.paginator = this.reviewTeamPaginator);
  }

  getStageHistory() {
    //PAYLOAD this.directorVisitSelectedID
    let data = [
      [
        {
          rvw_stage: 'TEST_1',
          start_dt: '06/10/2019',
          end_dt: '06/10/2019',
          compl_by: null,
          reason: null,
        },
        {
          rvw_stage: 'TEST_2',
          start_dt: '06/10/2019',
          end_dt: null,
          compl_by: null,
          reason: null,
        },
        {
          rvw_stage: 'TEST_3',
          start_dt: '06/10/2019',
          end_dt: null,
          compl_by: null,
          reason: null,
        },
      ]
    ];

    this.stageHistoryList = new MatTableDataSource(data[0]);
    setTimeout(() => this.stageHistoryList.paginator = this.stageHistoryPaginator);
  }

  saveVisitorDetails(){

  }

  cancelEnhancedForm(){
    this.emitTabData.emit({selectedPage : 'selectVisit', showDetails : false})
  }

}
