import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

@Component({
    selector: "app-document-list-remainder-dialog",
    templateUrl: "./document-list-remainder-dialog.component.html",
    styleUrls: ["./document-list-remainder-dialog.component.scss"],
    standalone: false
})
export class DocumentListRemainderDialogComponent implements OnInit {
  isRemainderForm: boolean = false;
  planRemainder: any = [];
  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public dialogRef: MatDialogRef<DocumentListRemainderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.programAdministrationService
      .GetDocSubReminderSchedule(this.data.docDetails.docListId, 0)
      .subscribe((res: any) => {
        if (res != null) {
          this.planRemainder = res;
        }
      });
  }

  GetRemainderEventForm(val: any) {
    console.log({ val: val });
  }
  addNewRemind(): void {
    this.isRemainderForm = !this.isRemainderForm;
  }
}
