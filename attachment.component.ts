import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

export interface FileType {
  refCode: string;
  refDesc: string;
  sel: boolean;
  size_appl: boolean;
  maximum_size: number;
  page_appl: boolean;
  minLen: number;
  maxLen: number;
}

export interface FileTypeConfig {
  fileType: string;
  fileSizeAppl: string;
  maxSize: number;
  pgNosAppl: string;
  minPg: number;
  maxPg: number;
}

@Component({
  selector: "app-attachment",
  templateUrl: "./attachment.component.html",
  styleUrls: ["./attachment.component.scss"],
})
export class AttachmentComponent implements OnInit, OnChanges, OnDestroy {
  @Output() attachmentEvent = new EventEmitter<any>();
  @Input() data: any;
  @Input() isDocModelEdit: boolean = true;

  // Form
  attachmentForm: FormGroup;

  // Table
  dataSource: MatTableDataSource<FileType>;
  displayedColumns: string[] = [
    "refType",
    "refDesc",
    "sel",
    "sizeApply",
    "maxSize",
    "pageApply",
    "minPages",
    "maxPages",
  ];

  // State
  isFlipped: boolean = false;
  showSpinner: boolean = false;
  hasChanges: boolean = false;
  isSaving: boolean = false;

  // Data
  fileTypes: FileType[] = [];
  originalData: any = null;
  fileTypeList: FileTypeConfig[] = [];

  // Validation
  validationErrors: string[] = [];

  // Subscriptions
  private formChangesSub: Subscription = new Subscription();

  // Constants
  private readonly DEFAULT_MAX_SIZE = 5;
  private readonly MAX_FILE_SIZE_LIMIT = 100;
  private readonly MAX_PAGES_LIMIT = 1000;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
  ) {
    this.dataSource = new MatTableDataSource<FileType>([]);
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupFormListeners();
    this.loadFileTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isDocModelEdit"]) {
      this.updateFormState();
    }

    if (changes["data"] && this.data) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.formChangesSub.unsubscribe();
  }

  private initializeForm(): void {
    this.attachmentForm = this.fb.group(
      {
        helpTxt: ["", [Validators.required, Validators.minLength(10)]],
        minNos: [
          1,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        maxNos: [
          5,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        fileTypeAppl: [false],
      },
      { validators: this.validateFileNumbers.bind(this) },
    );
  }

  private validateFileNumbers(group: FormGroup): ValidationErrors | null {
    const minNos = group.get("minNos")?.value;
    const maxNos = group.get("maxNos")?.value;

    if (minNos > maxNos) {
      group.get("maxNos")?.setErrors({ minGreaterThanMax: true });
      return { minGreaterThanMax: true };
    }

    return null;
  }

  private initializeData(): void {
    if (this.data && this.data !== "new") {
      this.loadData();
    } else {
      this.originalData = {
        details: {
          helpTxt: "",
          minNos: 1,
          maxNos: 5,
          fileTypeAppl: false,
        },
        types: [],
      };
    }
  }

  private loadData(): void {
    try {
      this.showSpinner = true;

      if (this.data.documentValue) {
        const docValue = this.data.documentValue;

        this.attachmentForm.patchValue({
          helpTxt: docValue.helpTxt || "",
          minNos: docValue.minNos || 1,
          maxNos: docValue.maxNos || 5,
          fileTypeAppl: docValue.fileTypeAppl === "Y",
        });

        this.originalData = {
          details: {
            helpTxt: docValue.helpTxt || "",
            minNos: docValue.minNos || 1,
            maxNos: docValue.maxNos || 5,
            fileTypeAppl: docValue.fileTypeAppl === "Y",
          },
          types: this.data.typeInfo?.docListInfo?.[0]?.rvwAttachTypes || [],
        };

        if (this.originalData.types.length > 0) {
          this.fileTypeList = [...this.originalData.types];
        }
      }
    } catch (error) {
      console.error("Error loading attachment data:", error);
    } finally {
      this.showSpinner = false;
    }
  }

  private setupFormListeners(): void {
    this.formChangesSub = this.attachmentForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.hasChanges = true;
        this.validateForm();
        this.emitData();
      });

    this.attachmentForm.get("fileTypeAppl")?.valueChanges.subscribe((value) => {
      if (!value) {
        this.resetFileTypeSelections();
      }
      this.validateForm();
    });
  }

  private resetFileTypeSelections(): void {
    this.dataSource.data.forEach((fileType) => {
      fileType.sel = false;
      fileType.size_appl = false;
      fileType.maximum_size = 0;
      fileType.page_appl = false;
      fileType.minLen = 0;
      fileType.maxLen = 0;
    });
    this.fileTypeList = [];
    this.dataSource._updateChangeSubscription();
  }

  private updateFormState(): void {
    if (this.isDocModelEdit) {
      this.attachmentForm.enable();
    } else {
      this.attachmentForm.disable();
    }
  }

  private loadFileTypes(): void {
    this.showSpinner = true;

    // Default file types based on image.png
    const defaultTypes = [
      { refCode: "BMP", refDesc: "Bitmap Image" },
      { refCode: "CSV", refDesc: "Comma Separated Values" },
      { refCode: "XLSX", refDesc: "Excel 2007 Documents" },
      { refCode: "XLS", refDesc: "Excel Documents" },
      { refCode: "GIF", refDesc: "Graphics Interchange Format" },
      { refCode: "JPEG", refDesc: "Joint Photographic Experts Group" },
      { refCode: "DOCX", refDesc: "Microsoft Word 2007 Documents" },
      { refCode: "DOC", refDesc: "Microsoft Word Documents" },
      { refCode: "PDF", refDesc: "PDF Documents" },
      { refCode: "PPT", refDesc: "PowerPoint Presentations" },
      { refCode: "RTF", refDesc: "Rich Text Format Documents" },
      { refCode: "TIF", refDesc: "Tagged Image Format" },
      { refCode: "TXT", refDesc: "Text File" },
    ];

    this.fileTypes = defaultTypes.map((item: any) => ({
      refCode: item.refCode || "",
      refDesc: item.refDesc || "",
      sel: false,
      size_appl: false,
      maximum_size: this.DEFAULT_MAX_SIZE,
      page_appl: false,
      minLen: 0,
      maxLen: 0,
    }));

    if (this.originalData?.types?.length > 0) {
      this.applyExistingSelections();
    }

    this.dataSource.data = this.fileTypes;
    this.showSpinner = false;
  }

  private applyExistingSelections(): void {
    this.originalData.types.forEach((existingType: FileTypeConfig) => {
      const fileType = this.fileTypes.find(
        (ft) => ft.refCode === existingType.fileType,
      );
      if (fileType) {
        fileType.sel = true;
        fileType.size_appl = existingType.fileSizeAppl === "Y";
        fileType.maximum_size = existingType.maxSize || this.DEFAULT_MAX_SIZE;
        fileType.page_appl = existingType.pgNosAppl === "Y";
        fileType.minLen = existingType.minPg || 0;
        fileType.maxLen = existingType.maxPg || 0;

        const existingIndex = this.fileTypeList.findIndex(
          (ft) => ft.fileType === existingType.fileType,
        );
        if (existingIndex === -1) {
          this.fileTypeList.push({
            fileType: existingType.fileType,
            fileSizeAppl: existingType.fileSizeAppl,
            maxSize: existingType.maxSize,
            pgNosAppl: existingType.pgNosAppl,
            minPg: existingType.minPg,
            maxPg: existingType.maxPg,
          });
        }
      }
    });
  }

  // Public Methods
  onClickFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  cancelFlip(): void {
    this.isFlipped = false;
  }

  addFileType(element: FileType, fieldName: string): void {
    if (!this.isDocModelEdit) {
      return;
    }

    if (fieldName === "select") {
      this.handleSelectToggle(element);
    } else if (fieldName === "size") {
      this.handleSizeToggle(element);
    } else if (fieldName === "page") {
      this.handlePageToggle(element);
    }

    this.updateFileTypeList(element);
    this.dataSource.data = [...this.dataSource.data];
    this.hasChanges = true;
    this.validateForm();
    this.emitData();
    this.cd.detectChanges();
  }

  private handleSelectToggle(element: FileType): void {
    element.sel = !element.sel;

    if (!element.sel) {
      element.size_appl = false;
      element.maximum_size = 0;
      element.page_appl = false;
      element.minLen = 0;
      element.maxLen = 0;

      this.fileTypeList = this.fileTypeList.filter(
        (ft) => ft.fileType !== element.refCode,
      );
    } else {
      element.maximum_size = this.DEFAULT_MAX_SIZE;
    }
  }

  private handleSizeToggle(element: FileType): void {
    element.size_appl = !element.size_appl;

    if (!element.size_appl) {
      element.maximum_size = 0;
    } else {
      element.maximum_size = this.DEFAULT_MAX_SIZE;
    }
  }

  private handlePageToggle(element: FileType): void {
    element.page_appl = !element.page_appl;

    if (!element.page_appl) {
      element.minLen = 0;
      element.maxLen = 0;
    } else {
      element.minLen = 1;
      element.maxLen = 10;
    }
  }

  private updateFileTypeList(element: FileType): void {
    const existing = this.fileTypeList.find(
      (ft) => ft.fileType === element.refCode,
    );

    if (existing) {
      existing.fileSizeAppl = element.size_appl ? "Y" : "N";
      existing.maxSize = element.maximum_size;
      existing.pgNosAppl = element.page_appl ? "Y" : "N";
      existing.minPg = element.minLen;
      existing.maxPg = element.maxLen;
    } else if (element.sel) {
      this.fileTypeList.push({
        fileType: element.refCode,
        fileSizeAppl: element.size_appl ? "Y" : "N",
        maxSize: element.maximum_size,
        pgNosAppl: element.page_appl ? "Y" : "N",
        minPg: element.minLen,
        maxPg: element.maxLen,
      });
    }
  }

  updateFileSize(event: any, element: FileType): void {
    if (!this.isDocModelEdit) return;

    const value = Number(event.target.value);
    element.maximum_size = this.validateNumber(value, this.MAX_FILE_SIZE_LIMIT);

    this.updateFileTypeList(element);
    this.hasChanges = true;
    this.emitData();
    this.cd.detectChanges();
  }

  updateMinPages(event: any, element: FileType): void {
    if (!this.isDocModelEdit) return;

    const value = Number(event.target.value);
    element.minLen = this.validateNumber(value, this.MAX_PAGES_LIMIT);

    if (element.maxLen && element.minLen > element.maxLen) {
      element.maxLen = element.minLen;
    }

    this.updateFileTypeList(element);
    this.hasChanges = true;
    this.emitData();
    this.cd.detectChanges();
  }

  updateMaxPages(event: any, element: FileType): void {
    if (!this.isDocModelEdit) return;

    const value = Number(event.target.value);
    element.maxLen = this.validateNumber(value, this.MAX_PAGES_LIMIT);

    if (element.minLen && element.maxLen < element.minLen) {
      element.maxLen = element.minLen;
    }

    this.updateFileTypeList(element);
    this.hasChanges = true;
    this.emitData();
    this.cd.detectChanges();
  }

  private validateNumber(value: number, max: number): number {
    if (isNaN(value) || value < 0) return 0;
    if (value > max) return max;
    return value;
  }

  // Reset Methods
  resetToDefault(): void {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      // Reset form
      this.attachmentForm.reset({
        helpTxt: "",
        minNos: 1,
        maxNos: 5,
        fileTypeAppl: false,
      });

      // Reset file types
      this.dataSource.data.forEach((fileType) => {
        fileType.sel = false;
        fileType.size_appl = false;
        fileType.maximum_size = 0;
        fileType.page_appl = false;
        fileType.minLen = 0;
        fileType.maxLen = 0;
      });

      // Clear file type list
      this.fileTypeList = [];

      // Reset state
      this.hasChanges = false;
      this.validationErrors = [];
      this.isFlipped = false;

      // Update table
      this.dataSource._updateChangeSubscription();

      // Emit data
      this.emitData();

      this.cd.detectChanges();
    }
  }

  resetToOriginal(): void {
    if (
      this.originalData &&
      confirm("Discard all changes and restore original settings?")
    ) {
      // Restore form
      this.attachmentForm.patchValue({
        helpTxt: this.originalData.details.helpTxt,
        minNos: this.originalData.details.minNos,
        maxNos: this.originalData.details.maxNos,
        fileTypeAppl: this.originalData.details.fileTypeAppl,
      });

      // Restore file types
      this.restoreFileTypeSelections();

      // Reset state
      this.hasChanges = false;
      this.validationErrors = [];
      this.isFlipped = false;

      // Validate and emit
      this.validateForm();
      this.emitData();

      this.cd.detectChanges();
    }
  }

  private restoreFileTypeSelections(): void {
    this.dataSource.data.forEach((fileType) => {
      const originalType = this.originalData.types.find(
        (ot: FileTypeConfig) => ot.fileType === fileType.refCode,
      );

      if (originalType) {
        fileType.sel = true;
        fileType.size_appl = originalType.fileSizeAppl === "Y";
        fileType.maximum_size = originalType.maxSize || 0;
        fileType.page_appl = originalType.pgNosAppl === "Y";
        fileType.minLen = originalType.minPg || 0;
        fileType.maxLen = originalType.maxPg || 0;
      } else {
        fileType.sel = false;
        fileType.size_appl = false;
        fileType.maximum_size = 0;
        fileType.page_appl = false;
        fileType.minLen = 0;
        fileType.maxLen = 0;
      }
    });

    this.fileTypeList = [...this.originalData.types];
    this.dataSource._updateChangeSubscription();
  }

  // Validation Methods
  private validateForm(): void {
    this.validationErrors = [];
    const formData = this.attachmentForm.value;

    if (!formData.helpTxt || formData.helpTxt.trim().length < 10) {
      this.validationErrors.push(
        "Instructions must be at least 10 characters long",
      );
    }

    if (formData.minNos > formData.maxNos) {
      this.validationErrors.push(
        "Minimum files cannot be greater than maximum files",
      );
    }

    if (formData.fileTypeAppl) {
      const selectedTypes = this.dataSource.data.filter((ft) => ft.sel);
      if (selectedTypes.length === 0) {
        this.validationErrors.push("Please select at least one file type");
      }

      selectedTypes.forEach((ft) => {
        if (ft.page_appl) {
          if (ft.minLen > ft.maxLen) {
            this.validationErrors.push(
              `Minimum pages cannot exceed maximum pages for ${ft.refCode}`,
            );
          }
          if (ft.minLen < 1) {
            this.validationErrors.push(
              `Minimum pages must be at least 1 for ${ft.refCode}`,
            );
          }
        }
      });
    }
  }

  // Emit Data
  private emitData(): void {
    const emitData = {
      details: this.attachmentForm.value,
      types: this.fileTypeList,
      isValid: this.isFormValid(),
      validationErrors: this.validationErrors,
      hasChanges: this.hasChanges,
      isFlipped: this.isFlipped,
      selectedCount: this.getSelectedFileTypesCount(),
    };

    this.attachmentEvent.emit(emitData);
  }

  // Helper Methods
  getSelectedFileTypesCount(): number {
    return this.dataSource.data.filter((ft) => ft.sel).length;
  }

  getFileTypesWithSizeApplicability(): number {
    return this.dataSource.data.filter((ft) => ft.sel && ft.size_appl).length;
  }

  getFileTypesWithPageApplicability(): number {
    return this.dataSource.data.filter((ft) => ft.sel && ft.page_appl).length;
  }

  isFormValid(): boolean {
    return this.attachmentForm.valid && this.validationErrors.length === 0;
  }

  getConfigurationSummary(): string {
    const formData = this.attachmentForm.value;
    const selectedCount = this.getSelectedFileTypesCount();
    const sizeCount = this.getFileTypesWithSizeApplicability();
    const pageCount = this.getFileTypesWithPageApplicability();

    let summary = `Files: ${formData.minNos}-${formData.maxNos}`;

    if (formData.fileTypeAppl && selectedCount > 0) {
      summary += `, Types: ${selectedCount}`;
      if (sizeCount > 0) {
        summary += ` (${sizeCount} with size limits)`;
      }
      if (pageCount > 0) {
        summary += ` (${pageCount} with page limits)`;
      }
    }

    return summary;
  }

  getFileTypeIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    switch (type) {
      case "pdf":
        return "picture_as_pdf";
      case "doc":
      case "docx":
      case "rtf":
        return "description";
      case "xls":
      case "xlsx":
      case "csv":
        return "table_chart";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "tif":
        return "image";
      case "txt":
        return "text_fields";
      case "ppt":
        return "slideshow";
      default:
        return "insert_drive_file";
    }
  }

  getFileTypeColor(fileType: string): string {
    const type = fileType.toLowerCase();
    switch (type) {
      case "pdf":
        return "#f44336";
      case "doc":
      case "docx":
      case "rtf":
        return "#2196f3";
      case "xls":
      case "xlsx":
      case "csv":
        return "#4caf50";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "tif":
        return "#ff9800";
      case "txt":
        return "#9e9e9e";
      case "ppt":
        return "#ff5722";
      default:
        return "#666";
    }
  }
}
