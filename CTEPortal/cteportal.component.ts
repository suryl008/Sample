import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-cteportal',
  templateUrl: './cteportal.component.html',
  styleUrls: ['./cteportal.component.scss']
})
export class CTEPortalComponent {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginator1') paginator1: MatPaginator;

  public refresh: boolean = false;
  public showSpinner: boolean = false;
  public isAddOrEditNewPortalFields: boolean = false;
  public isAddOrEditNewPortalSection: boolean = false;
  public portalSectionDetails: any;
  public portalFieldsDetails: any;
  public portalSectionResponseData: any = [];
  public portalFieldsResponseData = new MatTableDataSource();


  //PORTAL SECTION
  public addNewPortalSection: any =
    {
      "CTEPortalSectionID": 0,
      "SectionName": '',
      "Content": '',
      "RecordSequence": null,
      "Status": false,
      "CreatedBy": null
  }
  public portalSectionDisplayedColumns = [
    "action",
    "CTEPortalSectionID",
    "SectionName",
    "Content",
    "RecordSequence",
    "Status",
  ];
  public portalSectionMatColumnConfig = [
    {
      "id": "CTEPortalSectionID",
      "name": "CTE PortalSection ID"
    },
    {
      "id": "SectionName",
      "name": "Section Name"
    },
    {
      "id": "Content",
      "name": "Content"
    },
    {
      "id": "RecordSequence",
      "name": "Record Sequence"
    },
    {
      "id": "Status",
      "name": "Status"
    },
  ]

  //PORTAL FIELDS
  public addNewPortalFields: any =
    {
      "CTEPortalFieldID": 0,
      "CTEPortalSectionID" : '',
      "FieldName": '',
      "FieldLink" : '',
      "FieldInfo": '',
      "RecordSequence": null,
      "Status": false,
      "PopupText": null,
      "StartDate": null,
      "EndDate": null,
    }
  public portalFieldsDisplayedColumns = [
    "action",
    "CTEPortalFieldID",
    "CTEPortalSectionID",
    "FieldName",
    "FieldLink",
    "FieldInfo",
    "RecordSequence",
    "Status",
    "PopupText",
    "StartDate",
    "EndDate",
  ];
  public portalFieldsMatColumnConfig = [
    {
      "id": "CTEPortalFieldID",
      "name": "CTE Portal Field ID"
    },
    {
      "id": "CTEPortalSectionID",
      "name": "CTE Portal Section ID"
    },
    {
      "id": "FieldName",
      "name": "Field Name"
    },
    {
      "id": "FieldLink",
      "name": "Field Link"
    },
    {
      "id": "FieldInfo",
      "name": "Field Info"
    },
    {
      "id": "RecordSequence",
      "name": "Record Sequence"
    },
    {
      "id": "Status",
      "name": "Status"
    },
    {
      "id": "PopupText",
      "name": "PopupText"
    },
    {
      "id": "StartDate",
      "name": "Start Date"
    },
    {
      "id": "EndDate",
      "name": "End Date"
    },
  ]

  public ckeConfig = {
    uiColor: '#ffffff',
    toolbarGroups: [{ name: 'clipboard', groups: ['clipboard', 'undo'] },
    { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
    { name: 'links' }, { name: 'insert' },
    { name: 'document', groups: ['mode', 'document', 'doctools'] },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
    { name: 'styles' },
    { name: 'colors' }],
    skin: 'kama',
    resize_enabled: false,
    removePlugins: 'elementspath,save,magicline',
    extraPlugins: 'divarea,smiley,justify,indentblock,colordialog',
    colorButton_foreStyle: {
      element: 'font',
      attributes: { 'color': '#(color)' }
    },
    height: 188,
    removeDialogTabs: 'image:advanced;link:advanced',
    removeButtons: 'Subscript,Superscript,Anchor,Source,Table',
    format_tags: 'p;h1;h2;h3;pre;div'
  }

  constructor(private cd: ChangeDetectorRef, public dialog: MatDialog, private httpClient: HttpClient, private sharedService: SharedService) { }

  async ngOnInit() {
    let data: any = [
      {
        "CTEPortalSectionID": 5,
        "SectionName": "",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
      {
        "CTEPortalSectionID": 5,
        "SectionName": "",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
      {
        "CTEPortalSectionID": 5,
        "SectionName": "",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
      {
        "CTEPortalSectionID": 5,
        "SectionName": "",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
      {
        "CTEPortalSectionID": 5,
        "SectionName": "Test",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
      {
        "CTEPortalSectionID": 5,
        "SectionName": "",
        "Content": "",
        "RecordSequence": 0,
        "Status": false,
        "CreateDate": "2024-03-20T14:50:51",
        "CreatedBy": "1161"
      },
    ];
    this.portalSectionResponseData = new MatTableDataSource(data);
    setTimeout(() => this.portalSectionResponseData.paginator = this.paginator);
    let data1: any = [
      {
        "CTEPortalFieldID": 4,
        "CTEPortalSectionID": 3,
        "FieldName": "CLNA Access",
        "FieldLink": "https://mdoe.state.mi.us/GEMS/public/CLNAUserAccess.aspx",
        "FieldInfo": null,
        "RecordSequence": 2,
        "Status": true,
        "PopupText": "The submission window has ended.",
        "StartDate": null,
        "EndDate": null
      }
    ];
    this.portalFieldsResponseData = new MatTableDataSource(data1);
    setTimeout(() => this.portalFieldsResponseData.paginator = this.paginator1);
  }

  addOrEditPortalSections(event: any, isEdit: boolean) {
    if (isEdit) {
      this.portalSectionDetails = event;
    } else {
      let newData = JSON.parse(JSON.stringify(this.addNewPortalSection))
      this.portalSectionDetails = newData;
    }
    this.isAddOrEditNewPortalSection = true;
  }

  addOrEditPortalFields(event: any, isEdit: boolean) {
    if (isEdit) {
      this.portalFieldsDetails = event;
    } else {
      let newData = JSON.parse(JSON.stringify(this.addNewPortalFields))
      this.portalFieldsDetails = newData;
    }
    this.isAddOrEditNewPortalFields = true;
  }

  saveOrUpdatePortalSection() {
    this.isAddOrEditNewPortalSection = false;
    console.log(this.portalSectionDetails)
    //Portal Sections Save API
  }

  saveOrUpdatePortalFields() {
    this.isAddOrEditNewPortalFields = false;
    console.log(this.portalFieldsDetails)
    //Portal Field Save API
  }

  deletePortalSections(event) {
    //Portal Sections Delete API
  }

  deletePortalFields(event) {
    //Portal Field Delete API
  }


}
