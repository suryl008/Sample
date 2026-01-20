import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { AppSettings } from "src/app/app-settings";
import { ActivatedRoute, Router } from "@angular/router";
import { PgmMiscFld } from "src/app/pages/program-administration/models/pgm-misc-fld.model";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-miscdata-dialog",
  templateUrl: "./miscdata-dialog.component.html",
  styleUrls: ["./miscdata-dialog.component.scss"],
})
export class MiscdataDialogComponent implements OnInit {
  displayedColumns: string[] = UserColumns.map((col) => col.key);
  columnsSchema: any = UserColumns;
  dataSource = new MatTableDataSource<PgmMiscFld>();
  valid: any = {};
  reviewType: any;
  public program: any = null;
  selectedPgmId: any;
  isEdit: boolean = false;
  userDetails: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService
  ) {}

  ngOnInit(): void {
    this.getConsMiscData(119619);
  }

  getConsMiscData(subRvwId: number) {
    //this.consolidatedReviewService.getConsRefDataInfo(this.selectedPgmId,this.reviewType)
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getConsRefDataInfo.json")
      .subscribe((res: any) => {
        this.dataSource.data = res;
        console.log({ mymetadata: res });
      });
  }

  setColumn(input: string) {
    if (input === "edit") {
      console.log(this.displayedColumns);
      this.displayedColumns.splice(this.displayedColumns.indexOf("isEdit"));
    } else {
      this.displayedColumns.push("isEdit");
    }
  }

  addRow() {
    const newRow: PgmMiscFld = {
      pgmMiscFldsId: 0,
      fieldName: "",
      mergeFld: "",
      grantPgmId: !this.selectedPgmId ? 0 : this.selectedPgmId,
      rvwType: this.reviewType,
      createId: 0,
      lastUpdDt: new Date(),
      createDt: new Date(),
      lastUpdId: 0,
      sortOrder: 0,
    };
    this.dataSource.data = [newRow, ...this.dataSource.data];
  }

  editRow() {
    // let payload: PgmMiscFld = [...this.dataSource.data];
    this.saveMetaData();
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

  saveMetaData() {
    let data: PgmMiscFld[] = this.dataSource.data;
    this.programAdministrationService
      .ReviewMetaDataSave(data)
      .subscribe((res) => {
        console.log({ SavePgmInfoData: res });
      });
  }

  removeRow(pgmMiscFldsId: number) {
    this.programAdministrationService
      .deleteUser(pgmMiscFldsId)
      .subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(
          (u: PgmMiscFld) => u.pgmMiscFldsId !== pgmMiscFldsId
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
    key: "field_name",
    type: "textarea",
    label: "Field Name",
    required: true,
    matTextareaAutosize: true,
  },
  {
    key: "field_data",
    type: "text",
    label: "Merge Field",
  },
  {
    key: "isEdit",
    type: "isEdit",
    label: "",
  },
];
