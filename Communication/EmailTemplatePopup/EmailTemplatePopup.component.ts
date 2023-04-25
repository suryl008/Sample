import { HttpClient } from "@angular/common/http";
import { EventEmitter, Inject, ViewChild } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject } from "rxjs";
import { CKEditorComponent } from 'ng2-ckeditor';

export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";
@Component({
  selector: 'app-email-popup',
  templateUrl: './EmailTemplatePopup.component.html',
  styleUrls: ['./EmailTemplatePopup.component.scss']
})
export class EmailTemplatePopUpComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<EmailTemplatePopUpComponent>,
    private httpClient: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public headerName = "";
  public pageName = "";
  public emitdata: any
  public fileToUpload: File | null = null;
  public uploadDataSource: any;
  public displayedColumnsUploadDocuments: any;
  public base64Output: string;
  public userName: any;
  public officeList: any;
  public progReviewTypeList: any;
  public reviewTypeList: any;
  public labelPosition: labelPosition = "before";
  public name = 'Angular 4';
  public ckeConfig: CKEDITOR.config;

  async ngOnInit() {
    const current = new Date();
    const timestamp = current.getTime();
    this.ckEditorConfig();
    if (this.data != null) {
      this.headerName = this.data?.headerName
      this.pageName = this.data?.pageName
      this.emitdata = this.data?.emailData
    }
    if (this.pageName == 'emailTemplate') {
      this.getOfficeData();
      this.getProgReviewType();
    }
  }

  ckEditorConfig() {
    this.ckeConfig = {
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
  }

  getOfficeData() {
    this.httpClient.get("assets/api-data/GetAllOffInfo.json").subscribe(data => {
      this.officeList = data;
    })
  }

  getProgReviewType() {
    this.httpClient.get("assets/api-data/GetAllPgmSearchLookup.json").subscribe(data => {
      this.progReviewTypeList = data;
    })
  }

  changeProgramName(program: any, event: any) {
    if (event.isUserInput) {
      this.reviewTypeList = [];
      this.reviewTypeList = program.pgmRvwInfos;
    }
  }

  onFileSelected(event) {
    this.fileToUpload = event.target.files[0];
    this.convertFile(this.fileToUpload).subscribe(base64 => {
      this.base64Output = base64;
      console.log(this.base64Output)
    });
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  downloadDocument(event) {
    const linkSource =
      'data:application/octet-stream;base64,' + this.base64Output;
    const downloadLink = document.createElement('a');
    const fileName = 'TEST.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  autocomplted(event: any) {
    this.userName = event.target.value;
    console.log(this.userName)
  }

  closePopup(pageName, data) {
    this.dialogRef.close({ pageName: pageName, data: data, emitdata: this.emitdata });
  }

  inputCkEditor(){
    console.log(this.name)

  }

}
