import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Output,
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ClassicEditor, type EditorConfig } from "ckeditor5";
import { GLOBAL_EDITOR_CONFIG } from "src/app/shared/config/ckeditor.config";

@Component({
    selector: "app-qus-popup",
    templateUrl: "./qus-popup.component.html",
    styleUrls: ["./qus-popup.component.scss"],
    standalone: false
})
export class QusPopupComponent {
  @Output() emitService = new EventEmitter();
  public Editor = ClassicEditor;
  public editorConfig: EditorConfig = GLOBAL_EDITOR_CONFIG;
  public editorContent = "";

  constructor(
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<QusPopupComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  public headerName = "";
  public pageName = "";
  public emitdata: any;
  public responseData = new MatTableDataSource();

  public fieldTypeList: any = [];
  public responseViewerList: any = [];
  public sourceList: any = [];

  ngOnInit() {
    if (this.data != null) {
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;
      this.editorContent = this.emitdata?.label || this.emitdata?.helpTxt || '';
      console.log(this.emitdata);
      console.log(this.data, this.pageName);
    }
  }
}
