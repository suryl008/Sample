import { UserInfo } from './../../../models/user-info.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserInfo
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }
  onCancelClick(): void {
    this.dialogRef.close('Cancel');
  }

  onConfirmClick(): void {
    this.dialogRef.close('Confirm');
  }
}
