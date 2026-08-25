import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { QusPopupComponent } from '../QusPopup/qus-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { QsService, QuestionnaireModel } from 'src/app/shared/services/qs.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('table') table: MatTable<any>;
  @Output() emitSelectedQuestionnaire = new EventEmitter();

  public showSpinner: boolean = false;
  public initialResponseData: any = [];
  public gridRowData: any = [];
  public qusList: any[] = [];
  public selectedQus: any[] = [];
  public searchFilter = '';
  public status: string = 'All';
  statusList: string[] = ['Published', 'Archived', 'All'];
  public questionnaireData: any = [];
  public questionnaireSectionData: any = [];
  public questionnaireFieldData: any = [];
  public questionnaireFieldChoiceData: any = [];

  public pagedData: any[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  pageSizeOptions = [50, 100];
  allPageSize = -1;
  currentPageSize: number | 'all' = 50;
  pageSizeOptionLabels = [
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 'all', label: 'All' }
  ];


  public matColumnConfig = [
    { id: 'name', name: 'Name' },
    { id: 'questionnaireCode', name: 'Code' },
    { id: 'recordStatus', name: 'Status' },
    { id: 'download', name: 'Download' },
    { id: 'preview', name: 'Preview' },
    { id: 'actions', name: 'Actions' },
  ];
  public displayedColumns = ['name', 'questionnaireCode', 'recordStatus', 'download', 'preview', 'actions'];
  private questionnaireCatalog: QuestionnaireModel[] = [];

  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService,
    private qsService: QsService
  ) { }

  get canMaintainQuestionnaireScripts(): boolean {
    return this.sharedService.canMaintainQuestionnaireScripts();
  }

  async ngOnInit() {
    try {
      await this.getQuestionnaireListLookup(true);
    } catch (error) {
    }
  }

  async getQuestionnaireListLookup(isAdded = false) {
    this.showSpinner = true;
    await this.qsService.searchQuestionnaries(0).subscribe(
      (res: any) => {
        this.showSpinner = false;
        if (res != null) {
          this.initialResponseData = [] = res;
          isAdded ? this.getQuestionnaireData() : '';
          this.qusList = res.map((element: any) => ({
            id: element.questionnaireId,
            itemName: element.name + ' [' + element.questionnaireCode + ']',
            itemCode: element.questionnaireCode
          }))
        }
      },
      (error) => {
        this.showSpinner = false;
      }
    );
  }

  updatedSelectedValue(selectionQus: any) {
    this.selectedQus = selectionQus?.selectedItemsValues;
    !this.selectedQus?.length ? this.getQuestionnaireData(false) : '';
  }

  resetFilters() {
    this.status = 'All';
    this.searchFilter = '';
  }

  clearAll() {
    this.dataSource.data = [];
    this.selectedQus = [];
    this.emitSelectedQuestionnaire.emit({ selectedPage: 'search', showDetails: false });
    this.resetFilters();
  }

  async getQuestionnaireData(isSearchClick = true) {
    await this.resetFilters();
    let initialData = JSON.parse(JSON.stringify(this.initialResponseData));
    try {
      if (this.selectedQus?.length) {
        this.dataSource.data = initialData.filter(element => element.questionnaireId == this.selectedQus[0]?.id);
      } else {
        this.dataSource.data = isSearchClick ? initialData : [];
      }
      this.updatePagedData();
      this.gridRowData = JSON.parse(JSON.stringify(this.dataSource.data));
    } catch (error) {

    }

  }

  async changeStatus(event: any) {
    this.status = event;
    let data = JSON.parse(JSON.stringify(this.gridRowData));
    let status = event == 'Published' ? 'PUB' : event == 'Archived' ? 'ARC' : '';
    if (status != '') {
      this.dataSource.data = data.filter(element => element.recordStatus == status);
    } else {
      this.dataSource.data = data;
    }
    this.updatePagedData();

  }

  redirectQusDetails(data: any) {
    try {
      this.emitSelectedQuestionnaire.emit({ data: data, selectedPage: 'questionnaires' });
    } catch (error) {

    }
  }

  addQuestionnaireData() {
    this.emitSelectedQuestionnaire.emit({ data: [], selectedPage: 'questionnaires', isAdd: true });
  }

  copyQuestionnaireData() {
    let headerName = '';
    headerName = 'Copy Questionnaire';

    const dialogRef = this.dialog.open(QusPopupComponent, {
      maxWidth: "150vw",
      maxHeight: "200vh",

      width: "50%",
      height: "40%",
      data: {
        pageName: 'questionnaire',
        headerName: headerName,
        emitdata: this.selectedQus,
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result.data === 'ok') {
        this.clearAll();
        await this.getQuestionnaireListLookup();
      }
    });
  }

  previewQues() {
    let url = environment.gems_url + '/Public/Questionnaire.aspx?code=' + this.selectedQus[0]?.itemCode + '&action=respond&user=guest';
    window.open(url, '_blank');
  }

  previewQuestionnaire(questionnaireCode: any) {
    let url = environment.gems_url + '/Public/Questionnaire.aspx?code=' + questionnaireCode + '&action=respond&user=guest';
    window.open(url, '_blank');
  }

  async exportToExcel(questionnaireCode: string) {
    this.showSpinner = true;
    await this.qsService.getQuestionnaireMgmtDownloadData(questionnaireCode).toPromise().then(
      (res: any) => {
        if (res != null) {
          this.questionnaireData = this.sharedService.updateEmptyObjToNull(res[0]);
          this.questionnaireSectionData = this.sharedService.updateEmptyObjToNull(res[1]);
          this.questionnaireFieldData = this.sharedService.updateEmptyObjToNull(res[2]);
          this.questionnaireFieldChoiceData = this.sharedService.updateEmptyObjToNull(res[3]);





          const dynamicSheets = [
            { sheetName: 'Questionnaire', data: this.questionnaireData, exportColumns: null, customHeaders: null },
            { sheetName: 'QuestionnaireSection', data: this.questionnaireSectionData, exportColumns: null, customHeaders: null },
            { sheetName: 'QuestionnaireField', data: this.questionnaireFieldData, exportColumns: null, customHeaders: null },
            { sheetName: 'QuestionnaireFieldChoice', data: this.questionnaireFieldChoiceData, exportColumns: null, customHeaders: null },
          ];

          this.sharedService.exportToExcel1('exported-questionnaire-data.xlsx', dynamicSheets);

          this.showSpinner = false;
        }
      },
      () => {
        this.showSpinner = false;
      }
    );
  }

  applyFilter(event?: Event) {
    const filterValue = event
      ? (event.target as HTMLInputElement).value.trim().toLowerCase()
      : (this.searchFilter || '').trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagedData();
  }

  updatePagedData() {
    const data = this.dataSource?.filteredData ?? [];
    const allSelected = this.currentPageSize === 'all';
    if (allSelected) {
      this.pagedData = data;
      return;
    }
    const pageIndex = this.paginator?.pageIndex ?? 0;
    const pageSize = this.paginator?.pageSize ?? (typeof this.currentPageSize === 'number' ? this.currentPageSize : 50);
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    this.pagedData = data.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.updatePagedData();
  }

  onPageSizeChange(event: MatSelectChange) {
    const selectedSize = event?.value;
    if (selectedSize === 'all') {
      this.currentPageSize = 'all';
      this.paginator.pageSize = this.dataSource?.data?.length;
    } else {
      this.currentPageSize = selectedSize;
      this.paginator.pageSize = selectedSize;
    }
    this.paginator.firstPage();
    this.updatePagedData();
  }
}

