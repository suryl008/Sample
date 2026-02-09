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
  FormControl,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { Subject, Subscription } from "rxjs";
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

@Component({
  selector: "app-attachment",
  templateUrl: "./attachment.component.html",
  styleUrls: ["./attachment.component.scss"],
})
export class AttachmentComponent implements OnInit, OnChanges, OnDestroy {
  @Output() attachmentEvent = new EventEmitter<any>();
  @Output() saveEvent = new EventEmitter<any>();
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
  ];

  // State
  isFlipped: boolean = false;
  showSpinner: boolean = false;
  isShowPDFPg: boolean = false;
  hasChanges: boolean = false;
  isSaving: boolean = false;

  // Data
  fileTypes: FileType[] = [];
  originalData: any = null;
  fileTypeList: any[] = [];

  // Validation
  validationErrors: string[] = [];

  // Save State
  saveStatus: {
    success: boolean;
    message: string;
    autoHide: boolean;
  } | null = null;
  saveTimeout: any;

  // Subscriptions
  private formChangesSub: Subscription = new Subscription();
  private fileTypesSubject = new Subject<void>();

  // Constants
  private readonly DEFAULT_MAX_SIZE = 5;
  private readonly MAX_FILE_SIZE_LIMIT = 100;

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
    this.clearSaveStatus();
  }

  private initializeForm(): void {
    this.attachmentForm = this.fb.group({
      helpTxt: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      minNos: [
        1,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      maxNos: [
        5,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      fileTypeAppl: [false],
      minPg: [1, [Validators.min(1), Validators.max(1000)]],
      maxPg: [10, [Validators.min(1), Validators.max(1000)]],
      pageAppl: [false],
    });

    this.attachmentForm.setValidators(this.validateFileNumbers.bind(this));
  }

  private validateFileNumbers(
    formGroup: FormGroup,
  ): { [key: string]: boolean } | null {
    const minNos = formGroup.get("minNos")?.value;
    const maxNos = formGroup.get("maxNos")?.value;
    const minPg = formGroup.get("minPg")?.value;
    const maxPg = formGroup.get("maxPg")?.value;

    const errors: any = {};

    if (minNos > maxNos) {
      errors.minGreaterThanMax = true;
      formGroup.get("maxNos")?.setErrors({ minGreaterThanMax: true });
    } else {
      formGroup.get("maxNos")?.setErrors(null);
    }

    if (formGroup.get("pageAppl")?.value) {
      if (minPg > maxPg) {
        errors.minPgGreaterThanMaxPg = true;
        formGroup.get("maxPg")?.setErrors({ minPgGreaterThanMaxPg: true });
      } else {
        formGroup.get("maxPg")?.setErrors(null);
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Enhanced Save Method
  saveAttachmentConfiguration(): void {
    if (!this.isFormValid()) {
      this.showSaveStatus(
        false,
        "Please fix validation errors before saving",
        false,
      );
      return;
    }

    this.isSaving = true;
    this.clearSaveStatus();

    const saveData = this.prepareSaveData();

    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;

      // Mock success/failure
      const isSuccess = Math.random() > 0.2;

      if (isSuccess) {
        this.showSaveStatus(
          true,
          "Attachment configuration saved successfully",
          true,
        );
        this.hasChanges = false;
        this.emitSaveEvent(saveData);

        // Reset to default state after successful save
        this.originalData = {
          details: saveData.details,
          types: saveData.types,
        };
      } else {
        this.showSaveStatus(
          false,
          "Failed to save attachment configuration",
          false,
        );
      }
    }, 1500);

    // Actual API call would be:
    // this.programAdministrationService.saveAttachmentConfiguration(saveData)
    //   .subscribe({
    //     next: (response) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(true, "Configuration saved successfully", true);
    //       this.hasChanges = false;
    //       this.originalData = {
    //         details: saveData.details,
    //         types: saveData.types
    //       };
    //       this.emitSaveEvent(saveData);
    //     },
    //     error: (error) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(false, `Save failed: ${error.message}`, false);
    //     }
    //   });
  }

  private prepareSaveData(): any {
    const formData = this.attachmentForm.value;
    const selectedFileTypes = this.fileTypeList.filter((ft) => {
      const fileType = this.dataSource.data.find(
        (d) => d.refCode === ft.fileType,
      );
      return fileType?.sel;
    });

    return {
      details: {
        helpTxt: formData.helpTxt,
        minNos: formData.minNos,
        maxNos: formData.maxNos,
        fileTypeAppl: formData.fileTypeAppl ? "Y" : "N",
        minPg: formData.minPg,
        maxPg: formData.maxPg,
        pageAppl: formData.pageAppl ? "Y" : "N",
      },
      types: selectedFileTypes.map((ft) => ({
        fileType: ft.fileType,
        fileSizeAppl: ft.fileSizeAppl,
        maxSize: ft.maxSize,
        pgNosAppl: ft.pgNosAppl,
        minPg: ft.minPg,
        maxPg: ft.maxPg,
      })),
      isValid: this.attachmentForm.valid && this.validationErrors.length === 0,
      timestamp: new Date().toISOString(),
      saveType: this.isFlipped ? "fileTypes" : "configuration",
    };
  }

  private emitSaveEvent(data: any): void {
    this.saveEvent.emit({
      type: "attachment",
      data: data,
      timestamp: new Date().toISOString(),
      success: true,
    });
  }

  // Save Status Methods
  showSaveStatus(
    success: boolean,
    message: string,
    autoHide: boolean = true,
  ): void {
    this.saveStatus = { success, message, autoHide };

    if (success && autoHide) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.saveStatus = null;
        this.cd.detectChanges();
      }, 3000);
    }
  }

  clearSaveStatus(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveStatus = null;
  }

  // Rest of the existing methods remain the same...
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
          minPg: 1,
          maxPg: 10,
          pageAppl: false,
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
          minPg: docValue.minPg || 1,
          maxPg: docValue.maxPg || 10,
          pageAppl: docValue.pageAppl === "Y",
        });

        this.originalData = {
          details: {
            helpTxt: docValue.helpTxt || "",
            minNos: docValue.minNos || 1,
            maxNos: docValue.maxNos || 5,
            fileTypeAppl: docValue.fileTypeAppl === "Y",
            minPg: docValue.minPg || 1,
            maxPg: docValue.maxPg || 10,
            pageAppl: docValue.pageAppl === "Y",
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

    this.attachmentForm.get("pageAppl")?.valueChanges.subscribe((value) => {
      if (!value) {
        this.attachmentForm.patchValue({
          minPg: 1,
          maxPg: 10,
        });
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

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getAllFileTypesInfo.json")
      .subscribe({
        next: (res: any) => {
          if (res && Array.isArray(res)) {
            this.fileTypes = res.map((item: any) => ({
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
          }
          this.showSpinner = false;
        },
        error: (error) => {
          console.error("Error loading file types:", error);
          this.fileTypes = this.getDefaultFileTypes();
          this.dataSource.data = this.fileTypes;
          this.showSpinner = false;
        },
      });
  }

  private getDefaultFileTypes(): FileType[] {
    return [
      {
        refCode: "PDF",
        refDesc: "Portable Document Format",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "DOC",
        refDesc: "Microsoft Word Document",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "DOCX",
        refDesc: "Microsoft Word Open XML",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "XLS",
        refDesc: "Microsoft Excel Spreadsheet",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "XLSX",
        refDesc: "Microsoft Excel Open XML",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "JPG",
        refDesc: "JPEG Image",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "PNG",
        refDesc: "Portable Network Graphics",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
      {
        refCode: "TXT",
        refDesc: "Plain Text File",
        sel: false,
        size_appl: false,
        maximum_size: 5,
        page_appl: false,
        minLen: 0,
        maxLen: 0,
      },
    ];
  }

  private applyExistingSelections(): void {
    this.originalData.types.forEach((existingType: any) => {
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

        if (fileType.refCode === "PDF" && fileType.size_appl) {
          this.isShowPDFPg = true;
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

    const index = this.dataSource.data.indexOf(element);

    if (fieldName === "select") {
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

        if (element.refCode === "PDF") {
          this.isShowPDFPg = false;
        }
      } else {
        element.maximum_size = this.DEFAULT_MAX_SIZE;

        this.fileTypeList.push({
          fileType: element.refCode,
          fileSizeAppl: element.size_appl ? "Y" : "N",
          maxSize: element.maximum_size,
          pgNosAppl: element.page_appl ? "Y" : "N",
          minPg: element.minLen,
          maxPg: element.maxLen,
        });
      }
    } else if (fieldName === "size") {
      element.size_appl = !element.size_appl;

      if (!element.size_appl) {
        element.maximum_size = 0;
        element.page_appl = false;
        element.minLen = 0;
        element.maxLen = 0;
      } else {
        element.maximum_size = this.DEFAULT_MAX_SIZE;
      }

      const fileType = this.fileTypeList.find(
        (ft) => ft.fileType === element.refCode,
      );
      if (fileType) {
        fileType.fileSizeAppl = element.size_appl ? "Y" : "N";
        fileType.maxSize = element.maximum_size;

        if (element.refCode === "PDF") {
          this.isShowPDFPg = element.size_appl;
          if (!element.size_appl) {
            this.attachmentForm.patchValue({
              pageAppl: false,
              minPg: 1,
              maxPg: 10,
            });
          }
        }
      }
    }

    this.dataSource.data = [...this.dataSource.data];
    this.hasChanges = true;
    this.validateForm();
    this.emitData();
    this.cd.detectChanges();
  }

  updateFileSize(event: any, element: FileType): void {
    if (!this.isDocModelEdit) return;

    const value = Number(event.target.value);

    if (value > this.MAX_FILE_SIZE_LIMIT) {
      element.maximum_size = this.MAX_FILE_SIZE_LIMIT;
      event.target.value = this.MAX_FILE_SIZE_LIMIT;
    } else if (value < 0) {
      element.maximum_size = 0;
      event.target.value = 0;
    } else {
      element.maximum_size = value;
    }

    const fileType = this.fileTypeList.find(
      (ft) => ft.fileType === element.refCode,
    );
    if (fileType) {
      fileType.maxSize = element.maximum_size;
    }

    this.hasChanges = true;
    this.emitData();
    this.cd.detectChanges();
  }

  updatePDFFileInfo(event: any, fieldName: string): void {
    if (!this.isDocModelEdit) return;

    const pdfFileType = this.fileTypeList.find((ft) => ft.fileType === "PDF");
    const pdfElement = this.dataSource.data.find((ft) => ft.refCode === "PDF");

    if (pdfFileType && pdfElement) {
      if (fieldName === "pageAppl") {
        const isChecked = event.checked;
        pdfFileType.pgNosAppl = isChecked ? "Y" : "N";
        pdfElement.page_appl = isChecked;

        if (!isChecked) {
          pdfFileType.minPg = 0;
          pdfFileType.maxPg = 0;
          pdfElement.minLen = 0;
          pdfElement.maxLen = 0;
          this.attachmentForm.patchValue({
            minPg: 1,
            maxPg: 10,
          });
        }
      } else if (fieldName === "minPg") {
        const value = Number(event);
        pdfFileType.minPg = value;
        pdfElement.minLen = value;
      } else if (fieldName === "maxPg") {
        const value = Number(event);
        pdfFileType.maxPg = value;
        pdfElement.maxLen = value;
      }

      this.hasChanges = true;
      this.validateForm();
      this.emitData();
    }
  }

  // Save Methods
  saveAttachmentConfigurationAPI(): {
    isValid: boolean;
    data: any;
    errors: string[];
  } {
    this.validateForm();

    const formData = this.attachmentForm.value;
    const selectedFileTypes = this.fileTypeList.filter((ft) => {
      const fileType = this.dataSource.data.find(
        (d) => d.refCode === ft.fileType,
      );
      return fileType?.sel;
    });

    const saveData = {
      details: {
        helpTxt: formData.helpTxt,
        minNos: formData.minNos,
        maxNos: formData.maxNos,
        fileTypeAppl: formData.fileTypeAppl ? "Y" : "N",
        minPg: formData.minPg,
        maxPg: formData.maxPg,
        pageAppl: formData.pageAppl ? "Y" : "N",
      },
      types: selectedFileTypes.map((ft) => ({
        fileType: ft.fileType,
        fileSizeAppl: ft.fileSizeAppl,
        maxSize: ft.maxSize,
        pgNosAppl: ft.pgNosAppl,
        minPg: ft.minPg,
        maxPg: ft.maxPg,
      })),
      isValid: this.attachmentForm.valid && this.validationErrors.length === 0,
      timestamp: new Date().toISOString(),
    };

    return {
      isValid: saveData.isValid,
      data: saveData,
      errors: this.validationErrors,
    };
  }

  // Reset Methods
  resetToDefault(): void {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      this.attachmentForm.reset({
        helpTxt: "",
        minNos: 1,
        maxNos: 5,
        fileTypeAppl: false,
        minPg: 1,
        maxPg: 10,
        pageAppl: false,
      });

      this.dataSource.data.forEach((fileType) => {
        fileType.sel = false;
        fileType.size_appl = false;
        fileType.maximum_size = 0;
        fileType.page_appl = false;
        fileType.minLen = 0;
        fileType.maxLen = 0;
      });

      this.fileTypeList = [];
      this.isShowPDFPg = false;
      this.hasChanges = false;
      this.validationErrors = [];
      this.dataSource._updateChangeSubscription();
      this.emitData();
    }
  }

  resetToOriginal(): void {
    if (this.originalData) {
      if (
        confirm(
          "Are you sure you want to discard all changes and restore original settings?",
        )
      ) {
        this.attachmentForm.patchValue({
          helpTxt: this.originalData.details.helpTxt,
          minNos: this.originalData.details.minNos,
          maxNos: this.originalData.details.maxNos,
          fileTypeAppl: this.originalData.details.fileTypeAppl,
          minPg: this.originalData.details.minPg,
          maxPg: this.originalData.details.maxPg,
          pageAppl: this.originalData.details.pageAppl,
        });

        this.restoreFileTypeSelections();

        this.hasChanges = false;
        this.validationErrors = [];
        this.validateForm();
        this.emitData();
      }
    }
  }

  private restoreFileTypeSelections(): void {
    this.dataSource.data.forEach((fileType) => {
      const originalType = this.originalData.types.find(
        (ot: any) => ot.fileType === fileType.refCode,
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

    const pdfType = this.originalData.types.find(
      (ot: any) => ot.fileType === "PDF",
    );
    this.isShowPDFPg = pdfType && pdfType.fileSizeAppl === "Y";

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

    if (formData.minNos < 0) {
      this.validationErrors.push("Minimum files cannot be negative");
    }

    if (formData.maxNos < 1) {
      this.validationErrors.push("Maximum files must be at least 1");
    }

    if (formData.fileTypeAppl) {
      const selectedTypes = this.dataSource.data.filter((ft) => ft.sel);
      if (selectedTypes.length === 0) {
        this.validationErrors.push(
          "Please select at least one file type when file type applicability is enabled",
        );
      }
    }

    if (formData.pageAppl) {
      if (formData.minPg > formData.maxPg) {
        this.validationErrors.push(
          "Minimum pages cannot be greater than maximum pages",
        );
      }

      if (formData.minPg < 1) {
        this.validationErrors.push("Minimum pages must be at least 1");
      }

      if (formData.maxPg < 1) {
        this.validationErrors.push("Maximum pages must be at least 1");
      }
    }

    const selectedFileTypes = this.dataSource.data.filter((ft) => ft.sel);
    selectedFileTypes.forEach((fileType) => {
      if (
        fileType.size_appl &&
        fileType.maximum_size > this.MAX_FILE_SIZE_LIMIT
      ) {
        this.validationErrors.push(
          `Maximum size for ${fileType.refCode} cannot exceed ${this.MAX_FILE_SIZE_LIMIT}MB`,
        );
      }
    });
  }

  // Emit Data
  private emitData(): void {
    const saveResult = this.saveAttachmentConfigurationAPI();

    const emitData = {
      details: this.attachmentForm.value,
      types: this.fileTypeList,
      isValid: saveResult.isValid,
      validationErrors: saveResult.errors,
      hasChanges: this.hasChanges,
      isFlipped: this.isFlipped,
      showPDFControls: this.isShowPDFPg,
      selectedCount: this.dataSource.data.filter((ft) => ft.sel).length,
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

  isFormValid(): boolean {
    return this.attachmentForm.valid && this.validationErrors.length === 0;
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  // Get form data for parent component
  getFormData(): any {
    return this.saveAttachmentConfigurationAPI();
  }

  // Force validation
  validate(): { isValid: boolean; errors: string[] } {
    this.validateForm();
    return {
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors,
    };
  }

  // Get summary for display
  getConfigurationSummary(): string {
    const formData = this.attachmentForm.value;
    const selectedCount = this.getSelectedFileTypesCount();
    const sizeApplicableCount = this.getFileTypesWithSizeApplicability();

    let summary = `Files: ${formData.minNos}-${formData.maxNos}`;

    if (formData.fileTypeAppl && selectedCount > 0) {
      summary += `, Types: ${selectedCount}`;
      if (sizeApplicableCount > 0) {
        summary += ` (${sizeApplicableCount} with size limits)`;
      }
    }

    if (formData.pageAppl) {
      summary += `, Pages: ${formData.minPg}-${formData.maxPg}`;
    }

    return summary;
  }

  getFileTypeIcon(fileType: string): string {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "picture_as_pdf";
      case "doc":
      case "docx":
        return "description";
      case "xls":
      case "xlsx":
        return "table_chart";
      case "jpg":
      case "jpeg":
      case "png":
        return "image";
      case "txt":
        return "text_fields";
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
        return "#2196f3";
      case "xls":
      case "xlsx":
        return "#4caf50";
      case "jpg":
      case "jpeg":
      case "png":
        return "#ff9800";
      case "txt":
        return "#9e9e9e";
      default:
        return "#666";
    }
  }
}
