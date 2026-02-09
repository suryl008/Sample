import { Component, OnInit, Inject } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

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
  displayedColumns: string[] = ["field_name", "field_data"];
  dataSource = new MatTableDataSource<any>();
  isEdit: boolean = false;

  // Configuration
  selectedPgmId: number = 0;
  reviewType: string = "";
  userDetails: any = null;

  // State Management
  isSaving: boolean = false;
  saveStatus: { success: boolean; message: string } | null = null;
  hasChanges: boolean = false;
  originalData: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<MiscdataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: MiscDataDialogConfig,
  ) {
    this.selectedPgmId = config?.selectedPgmId || 0;
    this.reviewType = config?.reviewType || "";
    this.userDetails = config?.userDetails || null;
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
      this.originalData = JSON.parse(JSON.stringify(this.dataSource.data));
    } else {
      // Load default empty data
      this.dataSource.data = [];
      this.originalData = [];
    }
  }

  toggleEditMode(): void {
    this.isEdit = !this.isEdit;

    if (!this.isEdit) {
      // Cancel edit mode - restore original data
      this.dataSource.data = JSON.parse(JSON.stringify(this.originalData));
      this.hasChanges = false;
      this.clearSaveStatus();
    } else {
      // Enter edit mode - make a copy for editing
      this.originalData = JSON.parse(JSON.stringify(this.dataSource.data));
    }
  }

  onFieldChange(): void {
    this.hasChanges = true;
  }

  saveMetaData(): void {
    if (!this.hasChanges) return;

    this.isSaving = true;
    this.clearSaveStatus();

    // Prepare only merge field data for saving
    const saveData = this.dataSource.data.map((item) => ({
      ...item,
      field_data: item.field_data || "",
      lastUpdId: this.userDetails?.userId || 0,
      lastUpdDt: new Date(),
    }));

    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;
      const isSuccess = true; // Mock success

      if (isSuccess) {
        this.showSaveStatus(true, "Metadata saved successfully");
        this.hasChanges = false;
        this.isEdit = false;
        this.originalData = JSON.parse(JSON.stringify(this.dataSource.data));
      } else {
        this.showSaveStatus(false, "Failed to save metadata");
      }
    }, 800);
  }

  private showSaveStatus(success: boolean, message: string): void {
    this.saveStatus = { success, message };

    if (success) {
      setTimeout(() => {
        this.clearSaveStatus();
      }, 3000);
    }
  }

  clearSaveStatus(): void {
    this.saveStatus = null;
  }

  closeDialog(): void {
    if (this.hasChanges) {
      const confirmClose = confirm(
        "You have unsaved changes. Close without saving?",
      );
      if (confirmClose) {
        this.dialogRef.close(this.dataSource.data);
      }
    } else {
      this.dialogRef.close(this.dataSource.data);
    }
  }
}
