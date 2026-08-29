import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { QusPopupComponent } from '../QusPopup/qus-popup.component';

@Component({
    selector: 'app-fields',
    templateUrl: './fields.component.html',
    styleUrls: ['./fields.component.scss'],
    standalone: false
})
export class FieldsComponent implements OnChanges {

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  @Input() selectedQuestionnaire: any;
  @Input() selectedSection: any;
  readonly paginatorSelectConfig = { panelClass: ['questionnaire-overlay', 'questionnaire-select-panel'] };

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

  constructor(private dialog: MatDialog) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedQuestionnaire'] || changes['selectedSection']) {
      this.getSectionList();
    }
  }

  openFieldPopup(isEdit = false, row: any = {}) {
    this.dialog.open(QusPopupComponent, {
      width: '78%',
      height: '75%',
      data: {
        pageName: 'field',
        headerName: isEdit ? 'Edit Field' : 'Add New Fields',
        emitdata: { isEdit, ...row, questionnaire: this.selectedQuestionnaire, section: this.selectedSection }
      },
      ariaLabel: isEdit ? 'Edit Field' : 'Add New Fields',
      panelClass: 'questionnaire-overlay',
      autoFocus: 'dialog'
    });
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

