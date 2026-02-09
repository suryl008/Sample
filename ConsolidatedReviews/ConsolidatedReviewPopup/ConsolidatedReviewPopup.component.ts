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
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { SharedService } from "src/app/shared/services/shared.service";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

@Component({
  selector: "app-consolidatedreviewpopup-popup",
  templateUrl: "./ConsolidatedReviewPopup.component.html",
  styleUrls: ["./ConsolidatedReviewPopup.component.scss"],
})
export class ConsolidatedReviewPopupComponent implements OnInit, AfterViewInit {
  @ViewChild("emailLogPaginator", { static: false })
  emailLogPaginator: MatPaginator;
  @ViewChild("reviewOverallCommentPaginator", { static: false })
  reviewOverallCommentPaginator: MatPaginator;
  @Output() emitService = new EventEmitter();

  dt: Date = new Date();
  public Editor = ClassicEditor;
  public editorConfig: any;
  public selectedRole: string = "";
  public newComment: string = "";
  public emailLogList: MatTableDataSource<any> = new MatTableDataSource<any>(
    [],
  );
  public reviewerOverallComment: MatTableDataSource<any> =
    new MatTableDataSource<any>([]);

  constructor(
    public dialogRef: MatDialogRef<ConsolidatedReviewPopupComponent>,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
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

  ngOnInit() {
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.initializeEditorConfig();

    if (this.data != null) {
      this.headerName = this.data?.headerName || "";
      this.pageName = this.data?.pageName || "";
      this.emitdata = this.data?.subRvwId;
      this.visitSelectedData = this.data?.visitSelectedData || {};

      if (this.pageName == "viewEmails") {
        this.loadEmailLogData();
      }

      if (this.pageName == "overallComments") {
        this.getDocCategoryList();
        this.getConsReviewerOverallComment();
      }
    }
  }

  ngAfterViewInit() {
    if (this.emailLogList && this.emailLogPaginator) {
      setTimeout(() => {
        this.emailLogList.paginator = this.emailLogPaginator;
      });
    }
    if (this.reviewerOverallComment && this.reviewOverallCommentPaginator) {
      setTimeout(() => {
        this.reviewerOverallComment.paginator =
          this.reviewOverallCommentPaginator;
      });
    }
  }

  toggleCcDetails(): void {
    this.showCcDetails = !this.showCcDetails;
  }

  private initializeEditorConfig(): void {
    this.editorConfig = {
      toolbar: {
        items: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "|",
          "fontSize",
          "fontFamily",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "alignment",
          "|",
          "numberedList",
          "bulletedList",
          "todoList",
          "|",
          "outdent",
          "indent",
          "|",
          "link",
          "imageUpload",
          "mediaEmbed",
          "insertTable",
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          "|",
          "blockQuote",
          "codeBlock",
          "htmlEmbed",
          "|",
          "horizontalLine",
          "pageBreak",
          "|",
          "specialCharacters",
          "findAndReplace",
          "|",
          "undo",
          "redo",
          "|",
          "sourceEditing",
          "restrictedEditingException",
        ],
        shouldNotGroupWhenFull: false,
      },
      language: "en",
      placeholder: "Start typing your email content here...",
      height: "300px",

      // Image upload configuration
      image: {
        toolbar: [
          "imageTextAlternative",
          "toggleImageCaption",
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
        ],
      },

      // Table configuration
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          "tableProperties",
          "tableCellProperties",
        ],
      },

      // Link configuration
      link: {
        addTargetToExternalLinks: true,
        decorators: {
          openInNewTab: {
            mode: "manual",
            label: "Open in new tab",
            defaultValue: true,
            attributes: {
              target: "_blank",
              rel: "noopener noreferrer",
            },
          },
        },
      },
    };
  }

  private initializeEditorStats(): void {
    if (this.emailLogInfo.email_txt) {
      const text = this.emailLogInfo.email_txt.replace(/<[^>]*>/g, "");
      this.editorStats = {
        characters: text.length,
        words: text.split(/\s+/).filter((word) => word.length > 0).length,
        lastModified: new Date(),
      };
    }
  }

  // Editor event handlers
  onEditorReady(editor: any): void {
    console.log("CKEditor is ready to use!", editor);

    // Store editor reference for later use
    this.editorInstance = editor;

    // Customize toolbar appearance
    const toolbarElement = editor.ui.view.toolbar.element;
    if (toolbarElement) {
      toolbarElement.style.backgroundColor = "#ffffff";
      toolbarElement.style.border = "1px solid #e0e0e0";
      toolbarElement.style.borderRadius = "4px 4px 0 0";
      toolbarElement.style.padding = "10px";
    }

    // Add custom CSS for active editor
    const editableElement = editor.ui.view.editable.element;
    if (editableElement) {
      editableElement.style.minHeight = "200px";
      editableElement.style.maxHeight = "350px";
      editableElement.style.overflowY = "auto";
    }

    // Listen for changes in the editor
    editor.model.document.on("change:data", () => {
      this.onEditorContentChange(editor);
    });
  }

  onEditorChange(event: any): void {
    this.hasUnsavedChanges = true;
  }

  onEditorFocus(event: any): void {
    this.isEditorFocused = true;
  }

  onEditorBlur(event: any): void {
    this.isEditorFocused = false;
  }

  onEditorContentChange(editor: any): void {
    const data = editor.getData();
    const text = data.replace(/<[^>]*>/g, "");

    this.editorStats = {
      characters: text.length,
      words: text.split(/\s+/).filter((word) => word.length > 0).length,
      lastModified: new Date(),
    };

    this.hasUnsavedChanges = true;
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
    this.emailLogInfo.email_txt = this.originalMessageContent;
    this.hasUnsavedChanges = false;
    this.initializeEditorStats();
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
    this.toastrService.info("New message cancelled");
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

            setTimeout(() => {
              if (this.emailLogPaginator) {
                this.emailLogList.paginator = this.emailLogPaginator;
              }
            });
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

            setTimeout(() => {
              if (this.reviewOverallCommentPaginator) {
                this.reviewerOverallComment.paginator =
                  this.reviewOverallCommentPaginator;
              }
            });
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
    const filterValue = (event.target as HTMLInputElement).value;
    this.emailLogList.filter = filterValue.trim().toLowerCase();

    if (this.emailLogList.paginator) {
      this.emailLogList.paginator.firstPage();
    }
  }

  // Format CC list for display
  getFormattedCCList(): string {
    if (!this.emailLogInfo.CCList) return "None";

    return this.emailLogInfo.CCList.split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .join(", ");
  }

  // Download attachment
  downloadAttachment(attachment: any): void {
    this.toastrService.info(`Downloading ${attachment.file_name}`);
    // Implement actual download logic here
  }

  // Reset form
  resetCommentForm(): void {
    this.selectedRole = "";
    this.newComment = "";
  }
}
