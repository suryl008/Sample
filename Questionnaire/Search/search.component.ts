import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  @Output() emitSelectedQuestionnaire = new EventEmitter(); 

  public showSpinner: boolean = false;
  public initialResponseData = new MatTableDataSource();
  public responseData = new MatTableDataSource();
  public qusList: any = [];
  public selectedQus: any = [];
  public searchFilter: string = ''
  public status: string = 'All'
  statusList: string[] = ['Published', 'Archived', 'All'];
  public matColumnConfig = [
    {
      "id": "name",
      "name": "Name"
    },
    {
      "id": "questionnaireCode",
      "name": "Code"
    },
    {
      "id": "recordStatus",
      "name": "Status"
    },
  ]
  public displayedColumns = [
    "name",
    "questionnaireCode",
    "recordStatus"
  ];

  async ngOnInit() {
    try {
      await this.getQuestionnaireListLookup();
    } catch (error) {
    }
  }

  getQuestionnaireListLookup(){
    this.qusList = [
      { id: 1, itemName: 'Test-1' },
      { id: 2, itemName: 'Test-2' },
      { id: 3, itemName: 'Test-3' },
      { id: 4, itemName: 'Test-4' },
      { id: 5, itemName: 'Test-5' }
    ]
  }

  updatedSelectedValue(selectionQus: any) {
    this.selectedQus = selectionQus?.selectedItemsValues;
    !this.selectedQus?.length ? this.getQuestionnaireData() : '';
  }

  resetFilters(){
    this.status = 'All';
    this.searchFilter = '';
  }

  async getQuestionnaireData() {
    await this.resetFilters();
    await this.applyFilter();
    try {
      if (this.selectedQus?.length) {
        //API
        this.responseData.data = [
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
          { name: 'Test -1', questionnaireCode: '1ergfd3', recordStatus: 'PUB' },
          { name: 'Test -2', questionnaireCode: '12334t23t', recordStatus: 'PUB' },
          { name: 'Test -3', questionnaireCode: '1234567', recordStatus: null },
          { name: 'Test -4', questionnaireCode: '1234', recordStatus: 'PUB' },
          { name: 'Test -5', questionnaireCode: '123456', recordStatus: 'PUB' },
        ];
      } else {
        this.responseData.data = [];
        this.emitSelectedQuestionnaire.emit({selectedPage: 'search', showDetails : false });
      }
      this.initialResponseData = JSON.parse(JSON.stringify(this.responseData));
      setTimeout(() => this.responseData.paginator = this.paginator);
    } catch (error) {

    }
    
  }

  applyFilter() {
    this.responseData.filter = this.searchFilter?.trim().toLowerCase();
    setTimeout(() => this.responseData.paginator = this.paginator);
  }

  async changeStatus(event:any){
    this.status = event;
    let initialList = JSON.parse(JSON.stringify(this.initialResponseData));
    //FilterLogic
    await this.applyFilter();
  }

  redirectQusDetails(data:any){
    try {
      this.emitSelectedQuestionnaire.emit({data : data, selectedPage : 'questionnaires'});
    } catch (error) {
      
    }
  }

}
