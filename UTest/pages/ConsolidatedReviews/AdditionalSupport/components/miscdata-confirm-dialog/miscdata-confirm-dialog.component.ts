import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  subMessage?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "delete" | "warning" | "info";
}

@Component({
    selector: "app-miscdata-confirm-dialog",
    templateUrl: "./miscdata-confirm-dialog.component.html",
    styleUrls: ["./miscdata-confirm-dialog.component.scss"],
    standalone: false
})
export class MiscdataConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MiscdataConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {
    // Set default values if not provided
    this.data.title = data.title || "Confirm Deletion";
    this.data.message =
      data.message || "Are you sure you want to delete this item?";
    this.data.subMessage =
      data.subMessage ||
      (data.type === "delete" || !data.type
        ? "This action cannot be undone."
        : "");
    this.data.confirmText = data.confirmText || "Delete";
    this.data.cancelText = data.cancelText || "Cancel";
    this.data.type = data.type || "delete";
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
