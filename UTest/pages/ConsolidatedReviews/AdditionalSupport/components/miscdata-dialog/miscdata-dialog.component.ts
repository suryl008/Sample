import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { MatSort, Sort } from "@angular/material/sort";
import { HttpClient } from "@angular/common/http";

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
    standalone: false
})
export class MiscdataDialogComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["field_name", "field_data"];
  noDataColumn: string[] = ["noData"];
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
  filterValue: string = "";

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private httpClient: HttpClient,
    public dialogRef: MatDialogRef<MiscdataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: MiscDataDialogConfig,
  ) {
    this.selectedPgmId = config?.selectedPgmId || 0;
    this.reviewType = config?.reviewType || "";
    this.userDetails = config?.userDetails || null;
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupFilter();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  private initializeData(): void {
    this.GetMiscData();

    // if (this.config?.data && this.config.data.length > 0) {
    //   this.dataSource.data = this.config.data.map((item) => ({
    //     ...item,
    //     field_name: item.field_name || "",
    //     field_data: item.field_data || "",
    //   }));
    //   this.originalData = JSON.parse(JSON.stringify(this.dataSource.data));
    // } else {
    //   this.dataSource.data = [];
    //   this.originalData = [];
    // }
  }

  GetMiscData(): void {
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/misc-data.json")
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.dataSource.data = res[0].map((item) => ({
              ...item,
              field_name: item.field_name || "",
              field_data: item.field_data || "",
            }));
            this.originalData = JSON.parse(
              JSON.stringify(this.dataSource.data),
            );
          }
        },
        (error) => {},
      );
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.field_name?.toLowerCase().includes(searchStr) ||
        data.field_data?.toLowerCase().includes(searchStr)
      );
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim();
    this.dataSource.filter = this.filterValue.toLowerCase();
  }

  clearFilter() {
    this.filterValue = "";
    this.dataSource.filter = "";
  }

  toggleEditMode(): void {
    this.isEdit = !this.isEdit;

    if (!this.isEdit) {
      this.dataSource.data = JSON.parse(JSON.stringify(this.originalData));
      this.hasChanges = false;
      this.clearSaveStatus();
      this.clearFilter();
    } else {
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

    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;
      const isSuccess = true;

      if (isSuccess) {
        this.showSaveStatus(true, "Metadata saved successfully");
        this.hasChanges = false;
        this.isEdit = false;
        this.originalData = JSON.parse(JSON.stringify(this.dataSource.data));
        this.clearFilter();
      } else {
        this.showSaveStatus(false, "Failed to save metadata");
      }
    }, 800);
  }

  private showSaveStatus(success: boolean, message: string): void {
    this.saveStatus = { success, message };
    if (success) {
      setTimeout(() => this.clearSaveStatus(), 3000);
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
