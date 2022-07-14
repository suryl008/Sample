import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { MetadataConfirmDialogComponent } from "../metadata-confirm-dialog/metadata-confirm-dialog.component";
import { RvwTypeMetaData } from "../../../models/rvw-type-metadata.model";
import { AppSettings } from "src/app/app-settings";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-metadata-dialog",
  templateUrl: "./metadata-dialog.component.html",
  styleUrls: ["./metadata-dialog.component.scss"],
})
export class MetadataDialogComponent implements OnInit {
  displayedColumns: string[] = UserColumns.map((col) => col.key);
  columnsSchema: any = UserColumns;
  dataSource = new MatTableDataSource<RvwTypeMetaData>();
  valid: any = {};
  reviewType: any;
  public program: any = null;
  selectedPgmId: any;
  isEdit:boolean=false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private programAdministrationService: ProgramAdministrationService
  ) {}

  ngOnInit(): void {
    this.reviewType =
      this.route.snapshot.queryParamMap.get("review") ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;
          this.selectedPgmId = value.grantPgmId;
          this.programAdministrationService
            .GetReviewTypeMetaDataByProgramId(
              this.selectedPgmId,
              this.reviewType
            )
            .subscribe((res: any) => {
              this.dataSource.data = res;
              console.log({ mymetadata: res });
            });
        }
      }
    );
  }

  setColumn(input:string){
    if(input==='edit'){
     console.log(this.displayedColumns)
     this.displayedColumns.splice(this.displayedColumns.indexOf('isEdit'));
    }
    else{
      this.displayedColumns.push('isEdit');
    }

  }
  
  addRow() {
    const newRow: RvwTypeMetaData = {
      pgmMiscFldsId:0,
      fieldName: "",
      mergeFld: "",
      isEdit: true,
      grantPgmId: this.selectedPgmId,
      rvwType: this.reviewType,
    };
    this.dataSource.data = [newRow, ...this.dataSource.data];
  }

  editRow(row: any) {
    console.log(row)
    // if (row.pgmMiscFldsId === 0) {
    //   this.programAdministrationService
    //     .addUser(row)
    //     .subscribe((newUser: RvwTypeMetaData) => {
    //       row.pgmMiscFldsId = newUser.pgmMiscFldsId;
    //       row.isEdit = false;
    //     });
    // } else {
    //   this.programAdministrationService
    //     .updateUser(row)
    //     .subscribe(() => (row.isEdit = false));
    // }
  }

  removeRow(pgmMiscFldsId: number) {
    this.programAdministrationService
      .deleteUser(pgmMiscFldsId)
      .subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(
          (u: RvwTypeMetaData) => u.pgmMiscFldsId !== pgmMiscFldsId
        );
      });
  }

  disableSubmit(pgmMiscFldsId: number) {
    if (this.valid[pgmMiscFldsId]) {
      return Object.values(this.valid[pgmMiscFldsId]).some(
        (item) => item === false
      );
    }
    return false;
  }
}

// export interface RvwTypeMetaData {
//   pgmMiscFldsId: number;
//   fieldName: string;
//   mergeFld: string;
//   isEdit: boolean;
// }

export const UserColumns = [
  {
    key: "fieldName",
    type: "textarea",
    label: "Field Name",
    required: true,
    matTextareaAutosize: true,
  },
  {
    key: "mergeFld",
    type: "text",
    label: "Merge Field",
  },
  {
    key: "isEdit",
    type: "isEdit",
    label: "",
  },
  
];
