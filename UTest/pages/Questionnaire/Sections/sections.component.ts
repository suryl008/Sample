import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { QusPopupComponent } from '../QusPopup/qus-popup.component';

@Component({
    selector: 'app-sections',
    templateUrl: './sections.component.html',
    styleUrls: ['./sections.component.scss'],
    standalone: false
})
export class SectionsComponent implements OnChanges {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  @Input() selectedQuestionnaire: any;
  @Output() emitSelectedSection = new EventEmitter;
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
      "id": "label",
      "name": "Label"
    },
    {
      "id": "createdBy",
      "name": "Created By"
    },
    {
      "id": "createdDate",
      "name": "Created Date"
    },
    {
      "id": "modifiedBy",
      "name": "Modified By"
    },
    {
      "id": "modifiedDate",
      "name": "Modified Date"
    },
    {
      "id": "isModelContent",
      "name": "Is Model Content"
    }
  ]
  public displayedColumns = [
    "sequence",
    "label",
    "createdBy",
    "createdDate",
    "modifiedBy",
    "modifiedDate",
    "isModelContent",
    "field",
    "dependencies",
  ];

  constructor(private dialog: MatDialog) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedQuestionnaire']) {
      this.getSectionList();
    }
  }

  openSectionPopup(isEdit = false, row: any = {}) {
    this.dialog.open(QusPopupComponent, {
      width: '78%',
      height: '75%',
      data: {
        pageName: 'section',
        headerName: isEdit ? 'Edit Section' : 'Add New Section',
        emitdata: { isEdit, ...row, questionnaire: this.selectedQuestionnaire }
      },
      ariaLabel: isEdit ? 'Edit Section' : 'Add New Section',
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
          "label": 'Test1',
          "createdBy": 'Test1',
          "createdDate": 'Test1',
          "modifiedBy": 'Test1',
          "modifiedDate": 'Test1',
          "isModelContent": 'Test1',
        },
        {
          "sequence": 2,
          "label": 'Test2',
          "createdBy": 'Test2',
          "createdDate": 'Test2',
          "modifiedBy": 'Test2',
          "modifiedDate": 'Test2',
          "isModelContent": 'Test2',
        },
        {
          "sequence": 3,
          "label": 'Test3',
          "createdBy": 'Test3',
          "createdDate": 'Test3',
          "modifiedBy": 'Test3',
          "modifiedDate": 'Test3',
          "isModelContent": 'Test3',
        },
        {
          "sequence": 4,
          "label": 'Test4',
          "createdBy": 'Test4',
          "createdDate": 'Test4',
          "modifiedBy": 'Test4',
          "modifiedDate": 'Test4',
          "isModelContent": 'Test4',
        },
        {
          "sequence": 1,
          "label": 'Test1',
          "createdBy": 'Test1',
          "createdDate": 'Test1',
          "modifiedBy": 'Test1',
          "modifiedDate": 'Test1',
          "isModelContent": 'Test1',
        },
        {
          "sequence": 2,
          "label": 'Test2',
          "createdBy": 'Test2',
          "createdDate": 'Test2',
          "modifiedBy": 'Test2',
          "modifiedDate": 'Test2',
          "isModelContent": 'Test2',
        },
        {
          "sequence": 3,
          "label": 'Test3',
          "createdBy": 'Test3',
          "createdDate": 'Test3',
          "modifiedBy": 'Test3',
          "modifiedDate": 'Test3',
          "isModelContent": 'Test3',
        },
        {
          "sequence": 4,
          "label": 'Test4',
          "createdBy": 'Test4',
          "createdDate": 'Test4',
          "modifiedBy": 'Test4',
          "modifiedDate": 'Test4',
          "isModelContent": 'Test4',
        },
        {
          "sequence": 1,
          "label": 'Test1',
          "createdBy": 'Test1',
          "createdDate": 'Test1',
          "modifiedBy": 'Test1',
          "modifiedDate": 'Test1',
          "isModelContent": 'Test1',
        },
        {
          "sequence": 2,
          "label": 'Test2',
          "createdBy": 'Test2',
          "createdDate": 'Test2',
          "modifiedBy": 'Test2',
          "modifiedDate": 'Test2',
          "isModelContent": 'Test2',
        },
        {
          "sequence": 3,
          "label": 'Test3',
          "createdBy": 'Test3',
          "createdDate": 'Test3',
          "modifiedBy": 'Test3',
          "modifiedDate": 'Test3',
          "isModelContent": 'Test3',
        },
        {
          "sequence": 4,
          "label": 'Test4',
          "createdBy": 'Test4',
          "createdDate": 'Test4',
          "modifiedBy": 'Test4',
          "modifiedDate": 'Test4',
          "isModelContent": 'Test4',
        }
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

  editFields(data:any){
    try {
      this.emitSelectedSection.emit({data : data, selectedPage : 'field'});
    } catch (error) {
      
    }
  }
}
