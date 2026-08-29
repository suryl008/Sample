import { ManagementService } from "src/app/shared/services/management.service";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SharedService } from "src/app/shared/services/shared.service";
import { firstValueFrom } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: "app-sub-recipient-popup",
    templateUrl: "./SubRecipientPopup.component.html",
    styleUrls: ["./SubRecipientPopup.component.scss"],
    standalone: false
})
export class SubRecipientPopupComponent implements OnInit {
  @Output() emitService = new EventEmitter();
  @ViewChild("paginator") paginator: MatPaginator;
  @ViewChild("table") table: MatTable<any>;
  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private sharedService: SharedService,
    private managementService: ManagementService,
    private toastrService: ToastrService,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<SubRecipientPopupComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  public showSpinner: boolean = false;
  public isAddOrEdit: boolean = false;
  public userDetails: any;
  public headerName = "";
  public pageName = "";
  public emitdata: any;
  public notificationFormatList: any = [];
  public subRecipientStatusList: any = [];
  public subRecTitleList: any = [];
  public subRecDesignationList: any = [];
  public subRecAddlInfo: any = [];
  public matColumnBldgConfig: any = [];
  public displayedBldgColumns: any = [];
  public responseBldgData = new MatTableDataSource();
  public matColumnCalConfig: any = [];
  public displayedCalColumns: any = [];
  public responseCalData = new MatTableDataSource();
  public selectedStatus: string = "";
  public dtTypeList: any = [];
  public dtTypeSearchList: any = [];
  public newsubRecAddlInfoResponse = {
    fed_id: "",
    duns_no: "",
    add_line_1: "",
    add_line_2: "",
    city: "",
    state_cd: "",
    zip_1: "",
    zip_2: "",
    contact_f_name: "",
    contact_l_name: "",
    contact_ttl: "",
    contact_dsg: "",
    contact_phone: "",
    contact_phone_ext: "",
    contact_email: "",
    contact_ttl_desc: "",
    contact_dsg_desc: "",
  };
  public subRecCalInfo: any = [];
  public selectedYear: number = 0;
  public selectedDtType: string;
  public minYear: number;
  public maxYear: number;
  public ddlSearchYear: { item_text: string; item_value: number }[] = [];

  async ngOnInit() {
    this.isAddOrEdit = await this.sharedService.checkIsAddOrEdit(
      "SubRecipient"
    );
    this.subRecAddlInfo = [];
    if (this.data != null) {
      this.userDetails = this.programAdministrationService.getUserDetails();
      this.headerName = this.data?.headerName;
      this.pageName = this.data?.pageName;
      this.emitdata = this.data?.emitdata;

      this.notificationFormatList = [
        { item_id: "X", item_text: "" },
        { item_id: "E", item_text: "Email" },
      ];

      this.subRecipientStatusList = [
        { item_id: "X", item_text: "" },
        { item_id: "O", item_text: "Open" },
        { item_id: "C", item_text: "Closed" },
      ];

      const titles = await this.loadRefDataInfo("TTL");
      this.subRecTitleList = titles;

      const designations = await this.loadRefDataInfo("DSG");
      this.subRecDesignationList = designations;

      if (this.emitdata?.agencyId > 0) {
        const subRecInfo = await this.getSubRecAddlInfo(
          this.emitdata?.agencyId
        );
        if (subRecInfo.length > 0) {
          this.subRecAddlInfo = subRecInfo[0];
        }

        this.subRecAddlInfo.subRecCd = this.emitdata?.subRecCd;
        this.subRecAddlInfo.subRecName = this.emitdata?.subRecName;
        this.subRecAddlInfo.notifyFmt = this.emitdata?.notifyFmt;
        this.subRecAddlInfo.recStat = this.emitdata?.recStat;
        this.selectedStatus = this.emitdata?.recStat;
        this.subRecAddlInfo.closeDt = this.emitdata?.closeDt;
        this.subRecAddlInfo.licNo = this.emitdata?.licNo;
      } else {
        let addDtl = JSON.parse(JSON.stringify(this.newsubRecAddlInfoResponse));
        this.subRecAddlInfo = [JSON.parse(JSON.stringify(addDtl))];
        this.subRecAddlInfo.stateCd = "MI";
      }
    }
    if (this.pageName == "viewBuildings") {
      this.matColumnBldgConfig = [
        { id: "subRecCd", name: "Code" },
        { id: "subRecName", name: "Building Name" },
        { id: "recStat", name: "Status" },
        { id: "closeDt", name: "Close Date" },
      ];
      this.displayedBldgColumns = [
        "subRecCd",
        "subRecName",
        "recStat",
        "closeDt",
      ];

      this.showSpinner = true;
      this.managementService
        .getSubRecBldgInfo(this.emitdata?.subRecCd)
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.responseBldgData.data = res.map((x) => {
                return {
                  ...x,
                  recStat:
                    x.recStat == "O"
                      ? " Open"
                      : x.recStat == "C"
                      ? " Closed"
                      : "",
                };
              });
              this.showSpinner = false;
              setTimeout(() => {
                this.responseBldgData.paginator = this.paginator;
              }, 500);
            }
          },
          (error) => {
            this.showSpinner = false;
          }
        );
    }

    if (this.pageName == "subreccalendar") {
      this.matColumnCalConfig = [
        { id: "calDt", name: "Date" },
        { id: "dtDesc", name: "Description" },
        { id: "dtType", name: "Type" },
      ];
      this.displayedCalColumns = ["calDt", "dtDesc", "dtType"];

      this.dtTypeList = [
        { item_id: "H", item_text: "Holiday" },
        { item_id: "R", item_text: "Restricted" },
        { item_id: "O", item_text: "Open for Scheduling" },
      ];

      this.dtTypeSearchList = [
        ...this.dtTypeList,
        { item_id: "X", item_text: "All" },
      ];

      this.populateYearDropdown();

      //const calInfo = await this.getSubRecCalInfo(this.emitdata?.agencyId);
      //this.subRecCalInfo = calInfo;
      //this.responseCalData.data = this.mapDtTypeDesc(calInfo);

      setTimeout(() => (this.responseCalData.paginator = this.paginator));
      this.responseCalData._updateChangeSubscription();
      this.selectedYear = 0;
      this.selectedDtType = "X";
      //this.applyFilters();
    }
  }

  populateYearDropdown() {}

  closePopup(pageName, data) {
    this.dialogRef.close({
      pageName: pageName,
      data: data,
      emitdata: this.emitdata,
    });
  }

  saveSubRecipientDetails() {
    let payload: any = {};
    this.managementService.saveSubRecipientDetails(payload).subscribe(
      (res: any) => {
        if (res != null) {
          this.showSpinner = false;
          this.toastrService.success(
            "The record has been updated successfully.",
            ""
          );
          this.dialogRef.close({
            pageName: this.pageName,
            data: "ok",
          });
        }
      },
      (error) => {
        this.showSpinner = false;
      }
    );
  }

  selectedRecStat(recstat, event) {
    if (event.isUserInput) {
      this.selectedStatus = recstat?.item_id;
      if (this.selectedStatus === "O") {
        this.subRecAddlInfo.closeDt = null;
      }
    }
  }

  async loadRefDataInfo(refType: string): Promise<any> {
    this.showSpinner = true;
    try {
      const res = await firstValueFrom(
        this.managementService.getRefDataInfo(refType, "000000")
      );
      return res;
    } catch (error) {
      throw error;
    } finally {
      this.showSpinner = false;
    }
  }

  async getSubRecAddlInfo(agencyId: number): Promise<any> {
    this.showSpinner = true;
    try {
      const res = await firstValueFrom(
        this.managementService.getSubRecAddlInfo(agencyId)
      );
      return res;
    } catch (error) {
      throw error;
    } finally {
      this.showSpinner = false;
    }
  }
}
