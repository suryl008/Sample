import { HttpClient } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  Inject,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { finalize, firstValueFrom, of, switchMap } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { ClassicEditor, type EditorConfig } from "ckeditor5";
import { GLOBAL_EDITOR_CONFIG } from "src/app/shared/config/ckeditor.config";
import { MiscdataConfirmDialogComponent } from "../AdditionalSupport/components/miscdata-confirm-dialog/miscdata-confirm-dialog.component";
import { UntypedFormControl } from "@angular/forms";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { getFieldLabel as getTabFieldLabel } from "../consolidated-review-tab-config";

@Component({
    selector: "app-consolidatedreviewpopup-popup",
    templateUrl: "./ConsolidatedReviewPopup.component.html",
    styleUrls: ["./ConsolidatedReviewPopup.component.scss"],
    standalone: false
})
export class ConsolidatedReviewPopupComponent implements OnInit, AfterViewInit {
  @ViewChild("emailLogPaginator", { static: false })
  emailLogPaginator: MatPaginator;
  @ViewChild("emailLogSort", { static: false })
  emailLogSort: MatSort;
  @ViewChild("emailTemplatesPaginator", { static: false })
  emailTemplatesPaginator: MatPaginator;
  @ViewChild("emailTemplatesSort", { static: false })
  emailTemplatesSort: MatSort;
  @ViewChild("reviewOverallCommentPaginator", { static: false })
  reviewOverallCommentPaginator: MatPaginator;
  @ViewChild("commentsSort", { static: false })
  commentsSort: MatSort;
  @ViewChild("eemPaginator", { static: false })
  eemPaginator: MatPaginator;
  @ViewChild("eemSort", { static: false })
  eemSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  dt: Date = new Date();
  public Editor = ClassicEditor;
  public editorConfig: EditorConfig = {
    ...GLOBAL_EDITOR_CONFIG,
    placeholder: "Start typing your email content here...",
  };
  public selectedRole: string = "";
  public newComment: string = "";
  public submissionDocsInfo: any = [];
  public documentName: string = "";
  public viewEditDoc: string = "";
  public txtComments: string = "";
  public emailLogList: MatTableDataSource<any> = new MatTableDataSource<any>(
    [],
  );
  public reviewerOverallComment: MatTableDataSource<any> =
    new MatTableDataSource<any>([]);
  public eemAmendmentList: MatTableDataSource<any> = new MatTableDataSource<any>(
    [],
  );

  get showSharedReviewInfo(): boolean {
    return !this.showEmailDetail && !this.isShowEmailDraftDetails;
  }

  get draftAttachments(): any[] {
    const files = this.emailDraftDetails?.fileName;
    if (!Array.isArray(files)) {
      return [];
    }

    return files.map((file: any, index: number) => {
      if (typeof file === "string") {
        return { file_name: file, attach_srl: index + 1 };
      }

      return {
        ...file,
        file_name:
          file.file_name ||
          file.fileName ||
          file.doc_url ||
          `Attachment ${index + 1}`,
        attach_srl: file.attach_srl || index + 1,
      };
    });
  } 

  constructor(
    public dialogRef: MatDialogRef<ConsolidatedReviewPopupComponent>,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    dialogRef.disableClose = true;
  }

  public contactInfo: any = {};
  public headerName = "";
  public pageName = "";
  public emitdata: any;

  public visitSelectedData: any = {};

  public userDetails: any;
  public docCategoryList: any = [];
  public emailLogInfo: any = {
    email_fr: "",
    email_dt: "",
    email_to: "",
    CCList: "",
    email_sub: "",
    email_txt: "",
  };
  public showSpinner: boolean = false;
  public showEmailDetail: boolean = false;
  public attachments: any[] = [];
  public editorStats: any = null;
  public newMessageContent: string = "";
  public isEditorFocused: boolean = false;
  public hasUnsavedChanges: boolean = false;
  public originalMessageContent: string = "";
  public showCcDetails: boolean = false;
  private editorInstance: any;
  public isEditirDisabled: boolean = false;
  public isAddOrEdit: boolean = false;

  public isShowEmailDraftDetails: boolean = false;

  public emailLogDisplayedColumns = [
    "email_dt",
    "email_to",
    "email_cc",
    "email_sub",
    "select",
  ];

  public commentDisplayedColumns = [
    "create_dt",
    "Author",
    "comment_cat",
    "comment_txt",
  ];

  public emailTemplatesData = new MatTableDataSource();
public emailTemplateValues: any = [];
public emailTagValues: any = [];
public emailDraftDetails: any = {};
public isShowemailDraftDetails: boolean = false;
selectedFile: File | null = null;
public base64Output: string;
public emailTemplateFileDetails: any = {};
public emailTemplateFileData: any = [];
public fileUploadCtrl = new UntypedFormControl();
selectedFileName: string = "";
public multiFileUpload: any = [];
public pathName: string = '';
private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
private readonly ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/plain"
];
isSaving: boolean = false;
isUploading: boolean = false;

public amendmentDisplayedColumns = [
  "Date", "Topic", "UserName"
];

public matEmailTemplatesColumnConfig = [
  { "id": "is_editable", "name": "Send" },
  { "id": "email_to_addresses", "name": "To Addresses" },
  { "id": "email_cc_addresses", "name": "CC Addresses" },
  { "id": "email_bcc_addresses", "name": "BCC Addresses" },
  { "id": "template_name", "name": "Template Name" },
  { "id": "template_subject", "name": "Email Subject" }
];

public displayedEmailTemplatesColumns = [
  "is_editable",
  "email_to_addresses",
  "email_cc_addresses",
  "email_bcc_addresses",
  "template_name",
  "template_subject",
  "Action"
];

  async ngOnInit() {
    this.userDetails = this.programAdministrationService.getUserDetails();

    if (this.data != null) {
      this.headerName = this.data?.headerName || "";
      this.pageName = this.data?.pageName || "";
      this.emitdata = this.data?.subRvwId;
      this.visitSelectedData = this.data?.visitSelectedData || {};

      this.isAddOrEdit = this.data?.mode === "edit" || this.data?.mode === "add";

      if (this.pageName == "viewEmails") {
        this.isEditirDisabled = true;
        await this.loadEmailLogData();
      }

      if (this.pageName == "overallComments") {
        this.getDocCategoryList();
        await this.getConsReviewerOverallComment();
      }

      if (this.pageName == "eemAmendment") {
        await this.getEEMContractInfo();
      }

      if (this.pageName == "viewdoc") {
        this.submissionDocsInfo = this.data?.submissionDocsInfo || [];
        this.documentName = this.data?.documentName || "";
        this.viewEditDoc = this.data?.mode || "";
      }

      if (this.pageName == "editemail") {
        this.getAllEmailTemplates();
      }
    }
  }
  getAllEmailTemplates() {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getConsAllEmailTemplates.json")
      .pipe(
        switchMap((templateRes: any) => {
          this.emailTemplateValues = this.unwrapResultSet(templateRes);
          if (!this.emailTemplateValues.length) {
            return of(null);
          }
          return this.httpClient.get(
            "assets/api-data/ConsolidatedReview/getConsEmailTagValues.json",
          );
        }),
            finalize(() => {
          this.showSpinner = false;
          this.attachEmailTemplatesTable();
        }),
      )
      .subscribe((tagRes: any) => {
        const templates = Array.isArray(this.emailTemplateValues)
          ? this.emailTemplateValues
          : [];
        if (!tagRes) {
          this.emailTemplatesData.data = templates;
          return;
        }
        this.emailTagValues = this.unwrapResultSet(tagRes);
        templates.forEach((ele: any) => {
          if (!ele) {
            return;
          }
          const defaultTo = this.emailTagValues?.[0]?.contact_email?.replace(
            /[|E]/g,
            "",
          );
          const defaultCc = this.emailTagValues?.[0]?.cc_email?.replace(
            /[|E]/g,
            "",
          );

          ele.email_to_addresses = this.isEmptyAddressValue(
            ele.email_to_addresses,
          )
            ? this.normalizeEmailList(defaultTo)
            : this.normalizeEmailList(ele.email_to_addresses);

          ele.email_cc_addresses = this.isEmptyAddressValue(
            ele.email_cc_addresses,
          )
            ? this.normalizeEmailList(defaultCc)
            : this.normalizeEmailList(ele.email_cc_addresses);

          ele.email_bcc_addresses = this.isEmptyAddressValue(
            ele.email_bcc_addresses,
          )
            ? ""
            : this.normalizeEmailList(ele.email_bcc_addresses);

          ele.is_editable = this.isEditableFlag(ele.is_editable);
        });
        this.emailTemplatesData.data = templates;
      });
  }

  private unwrapResultSet(res: any): any[] {
    if (!res) {
      return [];
    }
    if (Array.isArray(res[0])) {
      return res[0];
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  private isEmptyAddressValue(value: any): boolean {
    if (value == null || value === "") {
      return true;
    }
    if (typeof value === "object") {
      return Object.keys(value).length === 0;
    }
    return false;
  }

  private isEditableFlag(value: any): boolean {
    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "Y" ||
      value === "true"
    );
  }

  private normalizeEmailList(value: any): string {
    if (this.isEmptyAddressValue(value)) {
      return "";
    }
    const text = typeof value === "string" ? value : String(value);
    return text
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length)
      .join(",");
  }

getEmailTagValues() {
    this.showSpinner = true;
    //this.consolidatedReviewService.getConsEmailTagValues(this.visitSelectedData?.sub_rvw_id, 'SCHED')
    this.httpClient.get("assets/api-data/ConsolidatedReview/getConsEmailTagValues.json")
    .subscribe(
        (res: any) => {
            if (res != null) {
                this.emailTagValues = res[0];
            }
            this.showSpinner = false;
        },
        (error) => {
            this.showSpinner = false;
        }
    );
}

getDisplayValue(): string {
    const data = this.visitSelectedData || {};
    const suffix = this.data?.currentTabId === "peacontrvw" ? data.PSA : data.sub_rec_id;
    return suffix ? `${data.sub_rec_name} (${suffix})` : data.sub_rec_name || "";
}

getFieldLabel(fieldName: string): string {
    return getTabFieldLabel(this.data?.currentTabId, fieldName);
}

editEmailTemplate(element: any) {
    this.isShowEmailDraftDetails = true;
    this.isEditirDisabled = false;
    this.emailDraftDetails = {
      ...element,
      template_body: element?.template_body || "",
    };
    this.originalMessageContent = this.emailDraftDetails.template_body;
    this.hasUnsavedChanges = false;
    this.updateEditorStats(this.emailDraftDetails.template_body);
}

getEmailDraftFiles(emailDraftId: any) {
    this.showSpinner = true;
    //this.consolidatedReviewService.getEmailDraftFiles(emailDraftId)
    this.httpClient.get("assets/api-data/ConsolidatedReview/getEmailDraftFiles.json")
    .subscribe(
        (res: any) => {
            if (res != null) {
                this.emailDraftDetails.fileName = res;
            }
            this.showSpinner = false;
        },
        (error) => {
            this.showSpinner = false;
        }
    );
}
  getEEMContractInfo(): void {
    const fromDialog = this.data?.eemAmendmentList;
    if (Array.isArray(fromDialog) && fromDialog.length) {
      this.eemAmendmentList = new MatTableDataSource<any>(fromDialog);
      this.attachEemTable();
      return;
    }

    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getEEMAmendmentList.json")
      .subscribe({
        next: (res: any) => {
          const rows = this.unwrapResultSet(res);
          this.eemAmendmentList = new MatTableDataSource<any>(
            this.sharedService.updateEmptyObjToNull(rows) || rows || [],
          );
          this.attachEemTable();
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading EEM amendment list:", error);
          this.toastrService.error("Failed to load EEM amendment list");
          this.eemAmendmentList = new MatTableDataSource<any>([]);
          this.attachEemTable();
          this.showSpinner = false;
        },
      });
  }

  ngAfterViewInit() {
    this.attachEmailLogTable();
    this.attachEmailTemplatesTable();
    this.attachCommentsTable();
    this.attachEemTable();
  }

  private attachEmailTemplatesTable(): void {
    setTimeout(() => {
      if (this.emailTemplatesPaginator) {
        this.emailTemplatesData.paginator = this.emailTemplatesPaginator;
      }
      if (this.emailTemplatesSort) {
        this.emailTemplatesData.sort = this.emailTemplatesSort;
      }
      this.emailTemplatesData.sortingDataAccessor = (item, property) =>
        this.getSortableValue(item?.[property]);
    });
  }

  private attachEmailLogTable(): void {
    setTimeout(() => {
      if (this.emailLogPaginator) {
        this.emailLogList.paginator = this.emailLogPaginator;
      }
      if (this.emailLogSort) {
        this.emailLogList.sort = this.emailLogSort;
      }
      this.emailLogList.sortingDataAccessor = (item, property) => {
        if (property === "email_cc") {
          return this.getSortableValue(item?.CCList || item?.email_cc);
        }
        return this.getSortableValue(item?.[property]);
      };
    });
  }

  private attachCommentsTable(): void {
    setTimeout(() => {
      if (this.reviewOverallCommentPaginator) {
        this.reviewerOverallComment.paginator =
          this.reviewOverallCommentPaginator;
      }
      if (this.commentsSort) {
        this.reviewerOverallComment.sort = this.commentsSort;
      }
      this.reviewerOverallComment.sortingDataAccessor = (item, property) =>
        this.getSortableValue(item?.[property]);
    });
  }

  private attachEemTable(): void {
    setTimeout(() => {
      if (this.eemPaginator) {
        this.eemAmendmentList.paginator = this.eemPaginator;
      }
      if (this.eemSort) {
        this.eemAmendmentList.sort = this.eemSort;
      }
      this.eemAmendmentList.sortingDataAccessor = (item, property) =>
        this.getSortableValue(item?.[property]);
    });
  }

  private getSortableValue(value: any): string | number {
    if (typeof value === "boolean") {
      return value ? 1 : 0;
    }
    if (value == null || typeof value === "object") {
      return "";
    }
    return value.toString().toLowerCase();
  }

  toggleCcDetails(): void {
    this.showCcDetails = !this.showCcDetails;
  }

  private initializeEditorStats(): void {
    this.updateEditorStats(this.emailLogInfo?.email_txt);
  }

  private updateEditorStats(html: string | null | undefined): void {
    const text = this.stripHtml(html);
    this.editorStats = {
      characters: text.length,
      words: text.split(/\s+/).filter((word) => word.length > 0).length,
      lastModified: new Date(),
    };
  }

  onEditorReady(editor: any): void {
    this.editorInstance = editor;
    this.applyEditorReadOnly(editor);
    editor.model.document.on("change:data", () => {
      if (this.isEditirDisabled) {
        return;
      }
      this.onEditorContentChange(editor);
    });
  }

  private applyEditorReadOnly(editor: any): void {
    if (!editor?.enableReadOnlyMode) {
      return;
    }

    if (this.isEditirDisabled) {
      editor.enableReadOnlyMode("consolidated-review-email");
    } else {
      editor.disableReadOnlyMode("consolidated-review-email");
    }
  }

  onEditorChange(_event: any): void {
    if (this.isEditirDisabled) {
      return;
    }
    this.hasUnsavedChanges = true;
  }

  onEditorFocus(event: any): void {
    this.isEditorFocused = true;
  }

  onEditorBlur(event: any): void {
    this.isEditorFocused = false;
  }

  onEditorContentChange(editor: any): void {
    this.updateEditorStats(editor.getData());
    this.hasUnsavedChanges = true;
  }

  saveEmailDraft(): void {
    const body = this.emailDraftDetails?.template_body || "";
    if (!this.stripHtml(body)) {
      this.toastrService.warning("Cannot save empty message");
      return;
    }

    this.originalMessageContent = body;
    this.hasUnsavedChanges = false;
    this.updateEditorStats(body);
    this.toastrService.success("Email draft saved successfully");
  }

  // Save message content
  saveMessage(): void {
    if (
      !this.emailLogInfo.email_txt ||
      this.emailLogInfo.email_txt.trim() === ""
    ) {
      this.toastrService.warning("Cannot save empty message");
      return;
    }

    this.showSpinner = true;

    // Simulate API call
    setTimeout(() => {
      this.toastrService.success("Message saved successfully");
      this.hasUnsavedChanges = false;
      this.showSpinner = false;

      // Update stats
      this.initializeEditorStats();
      this.originalMessageContent = this.emailLogInfo.email_txt;
    }, 1000);
  }

  // Reset message to original content
  resetMessage(): void {
    if (this.isShowEmailDraftDetails) {
      this.emailDraftDetails = {
        ...this.emailDraftDetails,
        template_body: this.originalMessageContent,
      };
    } else {
      this.emailLogInfo.email_txt = this.originalMessageContent;
    }
    this.hasUnsavedChanges = false;
    this.updateEditorStats(this.originalMessageContent);
    this.toastrService.info("Message reset to original content");
  }

  createNewMessage(): void {
    if (!this.newMessageContent || this.newMessageContent.trim() === "") {
      this.toastrService.warning("Please enter some content for the message");
      return;
    }

    this.emailLogInfo.email_txt = this.newMessageContent;
    this.newMessageContent = "";
    this.initializeEditorStats();
    this.originalMessageContent = this.emailLogInfo.email_txt;
    this.toastrService.success("New message created");
  }

  cancelNewMessage(): void {
    this.newMessageContent = "";
  }

  hasComposeDraft(): boolean {
    return this.stripHtml(this.newMessageContent).length > 0;
  }

  private stripHtml(value: string | null | undefined): string {
    return (value || "").replace(/<[^>]*>/g, "").trim();
  }

  dialogHasUnsavedChanges(): boolean {
    if (this.pageName === "overallComments") {
      return !!(this.selectedRole || (this.newComment || "").trim());
    }

    if (this.showEmailDetail || this.isShowEmailDraftDetails) {
      if (this.emailLogInfo?.email_txt || this.emailDraftDetails?.template_body) {
        return this.hasUnsavedChanges;
      }
      return this.hasComposeDraft();
    }

    return false;
  }

  async backToEmailList(): Promise<void> {
    if (!(await this.confirmLeaveIfDirty("back"))) {
      return;
    }
    this.resetEmailDetailState();
    this.showEmailDetail = false;
  }

  async backToTemplateList(): Promise<void> {
    if (!(await this.confirmLeaveIfDirty("back"))) {
      return;
    }
    this.isShowEmailDraftDetails = false;
    this.hasUnsavedChanges = false;
    this.editorStats = null;
    this.clearFileSelection();
  }

  async closeDialog(): Promise<void> {
    if (!(await this.confirmLeaveIfDirty("close"))) {
      return;
    }
    this.closePopup();
  }

  private async confirmLeaveIfDirty(action: "close" | "back"): Promise<boolean> {
    if (!this.dialogHasUnsavedChanges()) {
      return true;
    }

    const isBack = action === "back";
    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Unsaved changes",
        message: isBack
          ? "You have unsaved changes. Go back to the email list without saving?"
          : "You have unsaved changes. Close without saving?",
        subMessage: "Edits to this message or comment will be lost.",
        confirmText: isBack ? "Back" : "Close",
        cancelText: "Stay",
        type: "warning",
      },
    });

    return !!(await firstValueFrom(dialogRef.afterClosed()));
  }

  private resetEmailDetailState(): void {
    this.emailLogInfo = this.getDefaultEmailInfo();
    this.attachments = [];
    this.newMessageContent = "";
    this.hasUnsavedChanges = false;
    this.originalMessageContent = "";
    this.editorStats = null;
  }

  // Keyboard shortcuts
  @HostListener("window:keydown", ["$event"])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      this.saveMessage();
    }
  }

  loadEmailLogData(): void {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsReviewEmailData.json")
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            const data = this.sharedService.updateEmptyObjToNull(res[0]) || [];
            this.emailLogList = new MatTableDataSource<any>(data);

            this.attachEmailLogTable();
          } else {
            this.emailLogList = new MatTableDataSource<any>([]);
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading email log data:", error);
          this.toastrService.error("Failed to load email log data");
          this.showSpinner = false;
          this.emailLogList = new MatTableDataSource<any>([]);
        },
      });
  }

  // Get document category list
  getDocCategoryList(): void {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getDocCategoryList_comment.json")
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            this.docCategoryList = [
              { refCode: "", refDesc: "Please Select" },
              ...res,
            ];
          } else {
            this.docCategoryList = [{ refCode: "", refDesc: "Please Select" }];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading document categories:", error);
          this.toastrService.error("Failed to load document categories");
          this.showSpinner = false;
        },
      });
  }

  getConsReviewerOverallComment(): void {
    const payload = {
      subRvwId: this.visitSelectedData?.sub_rvw_id || 0,
      rvwId: 135355,
      rvwCat: "",
      commentCat: "",
      userId: 0,
      commentDate: new Date("1900-01-01T00:00:00").toISOString(),
      sDComment: false,
    };

    this.showSpinner = true;
    this.httpClient
      .get(
        "assets/api-data/ConsolidatedReview/getConsReviewerOverallComment.json",
      )
      .subscribe({
        next: (res: any) => {
          if (res?.length > 0) {
            const data = this.sharedService.updateEmptyObjToNull(res[0]) || [];
            this.reviewerOverallComment = new MatTableDataSource<any>(data);

            this.attachCommentsTable();
          } else {
            this.reviewerOverallComment = new MatTableDataSource<any>([]);
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading reviewer comments:", error);
          this.toastrService.error("Failed to load reviewer comments");
          this.showSpinner = false;
          this.reviewerOverallComment = new MatTableDataSource<any>([]);
        },
      });
  }

  getEmailLogInfoByLogId(logId: number): void {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getConsEmailLogInfo.json")
      .subscribe({
        next: (res: any) => {
          if (res && res.length >= 2) {
            // res[0] contains email details array
            // res[1] contains attachments array

            if (res[0] && res[0].length > 0) {
              const emailData = res[0][0]; // Get the email object

              this.emailLogInfo = {
                email_fr: emailData.email_fr || "",
                email_dt: emailData.email_dt || "",
                email_to: emailData.email_to || "",
                CCList: emailData.CCList || "",
                email_sub: emailData.email_sub || "",
                email_txt: emailData.email_txt || "",
              };

              // Store original content for reset functionality
              this.originalMessageContent = this.emailLogInfo.email_txt;
              this.hasUnsavedChanges = false;
              this.initializeEditorStats();
            }

            // Handle attachments
            if (res[1] && res[1].length > 0) {
              this.attachments = res[1];
            } else {
              this.attachments = [];
            }
          } else {
            console.warn("Invalid API response structure");
            this.emailLogInfo = this.getDefaultEmailInfo();
            this.attachments = [];
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading email log info:", error);
          this.toastrService.error("Failed to load email details");
          this.showSpinner = false;
          this.emailLogInfo = this.getDefaultEmailInfo();
          this.attachments = [];
        },
      });
  }

  // Helper method for default email info
  private getDefaultEmailInfo(): any {
    return {
      email_fr: "",
      email_dt: "",
      email_to: "",
      CCList: "",
      email_sub: "",
      email_txt: "",
    };
  }

  // Convert CCList string to array for display
  public getCCListArray(): string[] {
    if (
      !this.emailLogInfo.CCList ||
      typeof this.emailLogInfo.CCList !== "string"
    ) {
      return [];
    }

    // Split by comma and clean up
    return this.emailLogInfo.CCList.split(",")
      .map((email) => email.trim())
      .filter(
        (email) =>
          email.length > 0 && email !== "null" && email !== "undefined",
      );
  }

  saveOverallComment() {
    if (!this.selectedRole || !this.newComment.trim()) {
      this.toastrService.warning(
        "Please select a category and enter a comment",
      );
      return;
    }

    this.showSpinner = true;
    // Simulate API call
    setTimeout(() => {
      this.toastrService.success("Comment saved successfully");
      this.selectedRole = "";
      this.newComment = "";
      this.showSpinner = false;

      // Refresh comments
      this.getConsReviewerOverallComment();
    }, 1000);
  }

  showEmail(element: any) {
    if (element?.log_id) {
      this.resetEmailDetailState();
      this.isEditirDisabled = true;
      this.showEmailDetail = true;
      this.getEmailLogInfoByLogId(element.log_id);
    } else {
      this.toastrService.warning("Invalid email log entry");
    }
  }

  closePopup(data?: any) {
    this.dialogRef.close({
      pageName: this.pageName,
      data: data,
      emitdata: [this.emitdata],
    });
  }

  openConsolidatedReviewPopup(event: any, Mode: any) {
    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      panelClass: "consolidated-reviews-overlay",
      data: {
        pageName: "viewEmails",
        mode: Mode,
        headerName: "Email Log",
        emailData: event,
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data == "submit") {
        // Handle submit action if needed
      }
    });
  }

  // Search filter for tables
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (this.pageName === "editemail") {
      this.emailTemplatesData.filter = filterValue;
      this.emailTemplatesData.paginator?.firstPage();
      return;
    }

    if (this.pageName === "overallComments") {
      this.reviewerOverallComment.filter = filterValue;
      this.reviewerOverallComment.paginator?.firstPage();
      return;
    }

    if (this.pageName === "eemAmendment") {
      this.eemAmendmentList.filter = filterValue;
      this.eemAmendmentList.paginator?.firstPage();
      return;
    }

    this.emailLogList.filter = filterValue;
    this.emailLogList.paginator?.firstPage();
  }

  // Format CC list for display
  getFormattedCCList(): string {
    if (!this.emailLogInfo.CCList) return "None";

    return this.emailLogInfo.CCList.split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .join(", ");
  }

  downloadAttachment(attachment: any): void {
    this.downloadFile(attachment);
  }

  downloadFile(attachment: any, _source?: string): void {
    const name = this.getAttachmentName(attachment);
    this.toastrService.info(`Downloading ${name}`);
  }

  async openConfirmDeleteFilePopup(attachment: any): Promise<void> {
    const name = this.getAttachmentName(attachment);
    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Delete attachment",
        message: `Delete ${name}?`,
        subMessage: "This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "delete",
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    if (this.pageName === "viewdoc") {
      this.submissionDocsInfo = (this.submissionDocsInfo || []).filter(
        (item: any) => item !== attachment,
      );
    } else if (this.isShowEmailDraftDetails) {
      const files = this.emailDraftDetails?.fileName;
      if (Array.isArray(files)) {
        this.emailDraftDetails.fileName = files.filter(
          (item: any) => item !== attachment && item !== attachment?.file_name,
        );
      }
    }

    this.toastrService.success("Attachment removed");
  }

  private getAttachmentName(attachment: any): string {
    if (typeof attachment === "string") {
      return attachment;
    }

    return (
      attachment?.file_name ||
      attachment?.fileName ||
      attachment?.doc_title ||
      attachment?.doc_url ||
      "file"
    );
  }

  // Reset form
  resetCommentForm(): void {
    this.selectedRole = "";
    this.newComment = "";
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.clearFileSelection();
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.toastrService.error("File exceeds the 10MB limit");
      input.value = "";
      this.clearFileSelection();
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "txt"];
    const typeAllowed =
      !file.type || this.ALLOWED_FILE_TYPES.includes(file.type);
    if (!typeAllowed && !allowedExtensions.includes(extension)) {
      this.toastrService.error("File type is not allowed");
      input.value = "";
      this.clearFileSelection();
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  onMultipleFileSelected(event: Event): void {
    this.onFileSelected(event);
  }

  clearFileSelection(): void {
    this.selectedFile = null;
    this.selectedFileName = "";
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.toastrService.warning("Please select a file first");
      return;
    }

    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.toastrService.success("File ready to attach");
    }, 400);
  }
}
