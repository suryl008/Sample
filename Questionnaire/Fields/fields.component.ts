import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss']
})
export class FieldsComponent {

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  @Input() selectedQuestionnaire: any;
  @Input() selectedSection: any;

  public showSpinner: boolean = false;
  public searchFilter: string = '';
  public responseData = new MatTableDataSource();
  public matColumnConfig = [
    {
      "id": "sequence",
      "name": "Sequence"
    },
    {
      "id": "fieldType",
      "name": "Field Type"
    },
    {
      "id": "label",
      "name": "Label"
    }
  ]
  public displayedColumns = [
    "sequence",
    "fieldType",
    "label",
    "edit",
    "parentchildField",
    "dependencies",
    "rules",
    "summaryInfo",
    "modals",
    "calculations",
    "delete"
  ];

  constructor() {

  }

  ngOnInit() {
    try {
      this.getSectionList();
    } catch (error) {

    }
  }

  getSectionList() {
    try {
      this.responseData.data = [
        {
          "sequence": 1,
          "fieldType": "Test -1",
          "label": 'Test1',
          "createdBy": 'Test1',
          "createdDate": 'Test1',
          "modifiedBy": 'Test1',
          "modifiedDate": 'Test1',
          "isModelContent": 'Test1',
        },

      ];
      setTimeout(() => this.responseData.paginator = this.paginator);

    } catch (error) {

    }
  }

  applyFilter() {
    this.responseData.filter = this.searchFilter?.trim().toLowerCase();
    setTimeout(() => this.responseData.paginator = this.paginator);
  }

  dragdropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.responseData.data.findIndex((d) => d === event.item.data);
    moveItemInArray(this.responseData.data, prevIndex, event.currentIndex);
    this.responseData._updateChangeSubscription();
  }
}

