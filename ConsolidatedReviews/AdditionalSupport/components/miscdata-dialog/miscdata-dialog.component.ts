import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { HttpClient } from "@angular/common/http";
import {
  ConfirmDialogData,
  MiscdataConfirmDialogComponent,
} from "../miscdata-confirm-dialog/miscdata-confirm-dialog.component";

export interface MiscDataDialogConfig {
  selectedPgmId?: number;
  reviewType?: string;
  userDetails?: any;
  data?: any[];
}

@Component({
  selector: "app-miscdata-dialog",
  templateUrl: "./miscdata-dialog.component.html",
  styleUrls: ["./miscdata-dialog.component.scss"],
})
export class MiscdataDialogComponent implements OnInit {
  displayedColumns: string[] = [];
  columnsSchema: any = UserColumns;
  dataSource = new MatTableDataSource<any>();
  isEdit: boolean = false;

  // Configuration
  selectedPgmId: number = 0;
  reviewType: string = "";
  userDetails: any = null;

  // State Management
  isSaving: boolean = false;
  saveStatus: { success: boolean; message: string } | null = null;
  saveTimeout: any;
  validationErrors: string[] = [];
  hasChanges: boolean = false;
  isSaveEnabled: boolean = false;
  originalData: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<MiscdataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: MiscDataDialogConfig,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
  ) {
    this.selectedPgmId = config?.selectedPgmId || 0;
    this.reviewType = config?.reviewType || "";
    this.userDetails = config?.userDetails || null;

    this.updateDisplayedColumns();
  }

  ngOnInit(): void {
    this.initializeData();
  }

  private initializeData(): void {
    if (this.config?.data && this.config.data.length > 0) {
      // Use provided data
      this.dataSource.data = this.config.data.map((item) => ({
        ...item,
        field_name: item.field_name || "",
        field_data: item.field_data || "",
      }));
      this.originalData = [...this.dataSource.data];
    } else {
      // Load data from API
      this.getConsMiscData(119619);
    }
    this.validateSaveState();
  }

  getConsMiscData(subRvwId: number) {
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getConsRefDataInfo.json")
      .subscribe((res: any) => {
        if (res && Array.isArray(res)) {
          this.dataSource.data = res.map((item: any) => ({
            id: item.id || 0,
            field_name: item.field_name || "",
            field_data: item.field_data || "",
            pgmMiscFldsId: item.pgmMiscFldsId || 0,
            fieldName: item.fieldName || "",
            mergeFld: item.mergeFld || "",
            grantPgmId: item.grantPgmId || this.selectedPgmId,
            rvwType: item.rvwType || this.reviewType,
            createId: item.createId || 0,
            lastUpdDt: item.lastUpdDt ? new Date(item.lastUpdDt) : new Date(),
            createDt: item.createDt ? new Date(item.createDt) : new Date(),
            lastUpdId: item.lastUpdId || 0,
            sortOrder: item.sortOrder || 0,
          }));
          this.originalData = [...this.dataSource.data];
        } else {
          this.dataSource.data = [];
          this.originalData = [];
        }
        this.validateSaveState();
        console.log({ mymetadata: this.dataSource.data });
      });
  }

  toggleEditMode(): void {
    this.isEdit = !this.isEdit;
    this.updateDisplayedColumns();

    if (!this.isEdit) {
      // Cancel edit mode - restore original data
      this.dataSource.data = [...this.originalData];
      this.hasChanges = false;
      this.validationErrors = [];
      this.clearSaveStatus();
    } else {
      // Enter edit mode - make a copy for editing
      this.originalData = [...this.dataSource.data];
      this.validateSaveState();
    }
  }

  private updateDisplayedColumns(): void {
    if (this.isEdit) {
      this.displayedColumns = UserColumns.filter(
        (col) => col.type !== "isEdit",
      ).map((col) => col.key);
    } else {
      this.displayedColumns = UserColumns.map((col) => col.key);
    }
  }

  addRow(): void {
    const newRow: any = {
      id: Date.now(), // Temporary ID
      field_name: "",
      field_data: "",
      pgmMiscFldsId: 0,
      fieldName: "",
      mergeFld: "",
      grantPgmId: this.selectedPgmId,
      rvwType: this.reviewType,
      createId: this.userDetails?.userId || 0,
      lastUpdDt: new Date(),
      createDt: new Date(),
      lastUpdId: this.userDetails?.userId || 0,
      sortOrder: this.dataSource.data.length + 1,
    };

    this.dataSource.data = [newRow, ...this.dataSource.data];
    this.hasChanges = true;
    this.validateSaveState();
  }

  onFieldChange(): void {
    this.hasChanges = true;
    this.validateSaveState();
  }

  confirmAndRemoveRow(element: any): void {
    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Delete Meta Data",
        message: `Are you sure you want to delete "${element.field_name || "this item"}"?`,
        itemName: element.field_name,
        type: "delete",
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeRow(element.id);
      }
    });
  }

  removeRow(id: number): void {
    if (id > 0) {
      // Existing item - call API to delete
      this.programAdministrationService.deleteUser(id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(
            (u: any) => u.id !== id,
          );
          this.hasChanges = true;
          this.validateSaveState();
          this.showSaveStatus(true, "Item deleted successfully");
        },
        error: (error) => {
          console.error("Error deleting item:", error);
          this.showSaveStatus(false, "Failed to delete item");
        },
      });
    } else {
      // New item - just remove from local array
      this.dataSource.data = this.dataSource.data.filter(
        (u: any) => u.id !== id,
      );
      this.hasChanges = true;
      this.validateSaveState();
    }
  }

  // Enhanced Save Method
  saveMetaData(): void {
    if (!this.isSaveEnabled) {
      this.showSaveStatus(false, "Please fix validation errors before saving");
      return;
    }

    this.validateData();
    if (this.validationErrors.length > 0) {
      this.showSaveStatus(false, "Please fix validation errors before saving");
      return;
    }

    this.isSaving = true;
    this.clearSaveStatus();

    // Prepare data for saving
    const saveData = this.prepareSaveData();

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.isSaving = false;

      // Mock success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        this.showSaveStatus(true, "Meta data saved successfully");
        this.hasChanges = false;
        this.isEdit = false;
        this.updateDisplayedColumns();
        this.originalData = [...this.dataSource.data];

        // Update IDs for new items (simulating server response)
        this.dataSource.data = this.dataSource.data.map((item, index) => ({
          ...item,
          id: item.id < 1000 ? Date.now() + index : item.id, // Mock server-assigned ID
          pgmMiscFldsId: item.pgmMiscFldsId || Date.now() + index,
        }));
      } else {
        this.showSaveStatus(
          false,
          "Failed to save meta data. Please try again.",
        );
      }
    }, 1500);

    // Actual service call would be:
    // this.programAdministrationService
    //   .ReviewMetaDataSave(saveData.metadata)
    //   .subscribe({
    //     next: (res) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(true, "Meta data saved successfully");
    //       this.hasChanges = false;
    //       this.isEdit = false;
    //       this.updateDisplayedColumns();
    //       this.originalData = [...this.dataSource.data];
    //       console.log({ SavePgmInfoData: res });
    //     },
    //     error: (error) => {
    //       this.isSaving = false;
    //       this.showSaveStatus(false, `Error: ${error.message}`);
    //     }
    //   });
  }

  private prepareSaveData(): any {
    const metadata = this.dataSource.data.map((item) => ({
      pgmMiscFldsId: item.pgmMiscFldsId,
      fieldName: item.field_name,
      mergeFld: item.field_data,
      grantPgmId: this.selectedPgmId,
      rvwType: this.reviewType,
      createId: this.userDetails?.userId || 0,
      lastUpdId: this.userDetails?.userId || 0,
      sortOrder: item.sortOrder || 0,
    }));

    return {
      metadata,
      timestamp: new Date().toISOString(),
      userId: this.userDetails?.userId || 0,
      programId: this.selectedPgmId,
      reviewType: this.reviewType,
      totalItems: metadata.length,
    };
  }

  private validateData(): void {
    this.validationErrors = [];

    if (this.dataSource.data.length === 0) {
      this.validationErrors.push("No data to save. Add at least one row.");
      return;
    }

    this.dataSource.data.forEach((item, index) => {
      const rowNumber = index + 1;

      if (!item.field_name || item.field_name.trim() === "") {
        this.validationErrors.push(`Row ${rowNumber}: Field Name is required`);
      } else if (item.field_name.length > 100) {
        this.validationErrors.push(
          `Row ${rowNumber}: Field Name must be 100 characters or less`,
        );
      }

      if (!item.field_data || item.field_data.trim() === "") {
        this.validationErrors.push(`Row ${rowNumber}: Merge Field is required`);
      } else if (item.field_data.length > 500) {
        this.validationErrors.push(
          `Row ${rowNumber}: Merge Field must be 500 characters or less`,
        );
      }
    });

    // Check for duplicate field names
    const fieldNames = this.dataSource.data.map((item) =>
      item.field_name?.toLowerCase().trim(),
    );
    const uniqueNames = new Set(fieldNames);
    if (uniqueNames.size !== fieldNames.length) {
      this.validationErrors.push("Duplicate field names are not allowed");
    }
  }

  private validateSaveState(): void {
    // Check if all required fields are filled
    const allFieldsFilled = this.dataSource.data.every(
      (item) => item.field_name?.trim() && item.field_data?.trim(),
    );

    // Check if there are changes
    const hasActualChanges =
      JSON.stringify(this.dataSource.data) !==
      JSON.stringify(this.originalData);

    this.hasChanges = hasActualChanges;
    this.isSaveEnabled = this.isEdit && allFieldsFilled && hasActualChanges;
  }

  getSaveTooltip(): string {
    if (!this.isEdit) return "";
    if (!this.isSaveEnabled) {
      return "Fill all required fields and make changes to enable save";
    }
    return "Save changes";
  }

  // Save Status Methods
  private showSaveStatus(success: boolean, message: string): void {
    this.saveStatus = { success, message };

    if (success) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.saveStatus = null;
      }, 3000);
    }
  }

  clearSaveStatus(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveStatus = null;
  }

  // Helper method to check if form is valid
  isFormValid(): boolean {
    this.validateData();
    return this.validationErrors.length === 0;
  }

  // Close dialog
  closeDialog(): void {
    if (this.hasChanges) {
      const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
        width: "400px",
        data: {
          title: "Unsaved Changes",
          message: "You have unsaved changes. Are you sure you want to close?",
          confirmText: "Close",
          cancelText: "Cancel",
          type: "warning",
        } as ConfirmDialogData,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef.close(this.dataSource.data);
        }
      });
    } else {
      this.dialogRef.close(this.dataSource.data);
    }
  }
}

export const UserColumns = [
  {
    key: "field_name",
    type: "text",
    label: "Field Name",
    required: true,
  },
  {
    key: "field_data",
    type: "text",
    label: "Merge Field",
    required: true,
  },
  {
    key: "isEdit",
    type: "isEdit",
    label: "",
  },
];
