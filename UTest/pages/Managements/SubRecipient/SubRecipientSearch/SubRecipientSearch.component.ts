import { ToastrService } from "ngx-toastr";
import { SharedService } from "./../../../../shared/services/shared.service";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SubRecipientPopupComponent } from "../SubRecipientPopup/SubRecipientPopup.component";
import { ManagementService } from "src/app/shared/services/management.service";
import { PopUpComponent } from "src/app/shared/PopUp/PopUp.component";
import { MatSelectChange } from "@angular/material/select";
import { UntypedFormControl } from "@angular/forms";

import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  switchMap,
  tap,
} from "rxjs";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

@Component({
    selector: "app-sub-recipient-search",
    templateUrl: "./SubRecipientSearch.component.html",
    styleUrls: ["./SubRecipientSearch.component.scss"],
    standalone: false
})
export class SubRecipientSearchComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  @ViewChild("table") table: MatTable<any>;

  public userDetails: any;
  public selectedNotificationFormat: string;
  public selectedSubRecStatus: string;
  public showSpinner: boolean = false;
  public isAddOrEdit: boolean = false;
  public selectIndex: number = 0;
  public subRecipientList: any[] = [];
  public notificationFormatSearchList: any = [];
  public subRecipientStatusSearchList: any = [];
  public notificationFormatList: any = [];
  public subRecipientStatusList: any = [];
  public notifyFormatEmail: boolean = false;
  public notifyFormatLetter: boolean = false;
  public notifyFormatAll: boolean = false;
  public subRecStatOpen: boolean = false;
  public subRecStatClose: boolean = false;
  public subRecStatAll: boolean = false;
  public selectedStatus: string = "";
  public responseData = new MatTableDataSource();
  public searchObj: any = {};
  public originalData: any[] = [];
  public initialData: any = [];

  searchSubRecCtrl = new UntypedFormControl();
  filteredSubRecInfo: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedSearchSubRec: any = "";

  totalItems: 0;
  pageSize: 100;
  pageNumber: 1;
  totalPages: 0;
  pageSizeOptions = [50, 100, 250, 500];
  allPageSize = -1;
  currentPageSize: number | "all" = 100;
  pageSizeOptionLabels = [
    { value: 50, label: "50" },
    { value: 100, label: "100" },
    { value: 250, label: "250" },
    { value: 500, label: "500" },
    { value: "all", label: "All" },
  ];

  public matColumnConfig = [
    {
      id: "subRecCd",
      name: "Code",
      width: "120px",
    },
    {
      id: "subRecName",
      name: "Sub-Recipient Name",
    },
    {
      id: "notifyFmt",
      name: "Notification Format",
      width: "120px",
    },
    {
      id: "calOr",
      name: "Calendar",
      width: "120px",
    },
    {
      id: "recStat",
      name: "Status",
      width: "120px",
    },
    {
      id: "closeDt",
      name: "Close Date",
      width: "120px",
    },
    {
      id: "licNo",
      name: "License #",
      width: "120px",
    },
    {
      id: "subRecType",
      name: "Building",
      width: "120px",
    },
    {
      id: "subRecSrc",
      name: "Details",
      width: "120px",
    },
  ];
  public displayedColumns = [
    "subRecCd",
    "subRecName",
    "notifyFmt",
    "calOr",
    "recStat",
    "closeDt",
    "licNo",
    "subRecType",
    "subRecSrc",
    "delete",
  ];

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private managementService: ManagementService,
    private sharedService: SharedService,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.selectedNotificationFormat = "";
    this.selectedSubRecStatus = "X";
  }

  ngOnInit(): void {
    //this.isAddOrEdit = await this.sharedService.checkIsAddOrEdit('subrec');
    this.showSpinner = true;
    this.userDetails = this.programAdministrationService.getUserDetails();
    //this.getSubRecipientInfo();

    this.notificationFormatSearchList = [
      { item_id: "E", item_text: "Email" },
      { item_id: "L", item_text: "Letter" },
      { item_id: "", item_text: "All" },
    ];

    this.subRecipientStatusSearchList = [
      { item_id: "O", item_text: "Open" },
      { item_id: "C", item_text: "Close" },
      { item_id: "X", item_text: "All" },
    ];

    this.notificationFormatList = [
      { item_id: "X", item_text: "" },
      { item_id: "E", item_text: "Email" },
    ];

    this.subRecipientStatusList = [
      { item_id: "X", item_text: "" },
      { item_id: "O", item_text: "Open" },
      { item_id: "C", item_text: "Closed" },
    ];

    this.searchSubRecCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredSubRecInfo = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.managementService.getSubRecLupInfo(value).pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredSubRecInfo = [];
        } else {
          this.errorMsg = "";
          this.filteredSubRecInfo = data;
        }
      });

    this.searchSetupList();
    this.showSpinner = false;
  }

  tabSelectEvent(event: any) {
    if ((event = 0)) {
      this.resetTab();
    }
  }

  resetTab() {
    this.selectIndex = 0;
  }

  // getSubRecipientInfo() {
  //   let payload = {
  //     parentCd: "",
  //     subRecCd: "",
  //     subRecName: "",
  //     subRecType: "P",
  //     notificationFormat: "",
  //     recStat: "",
  //     option: "X",
  //     orderBy: "",
  //   };
  //   this.showSpinner = true;
  //   this.managementService.getSubRecipientInfo(payload).subscribe(
  //     (res: any) => {
  //       if (res != null) {
  //         let subRecipients = this.sharedService.updateEmptyObjToNull(res[0]);
  //         this.subRecipientList = [] = subRecipients?.map((x) => {
  //           return {
  //             id: x["agency_id"],
  //             itemName: x["sub_rec_Name"] + " (" + x["sub_rec_cd"] + ")",
  //             ...x,
  //           };
  //         });
  //       }
  //       this.showSpinner = false;
  //     },
  //     (error) => {
  //       this.showSpinner = false;
  //     }
  //   );
  // }

  // async updatedSelectedValue(selectedList: any) {
  //   this.responseData.data = [];
  //   this.responseData._updateChangeSubscription();
  //   this.searchObj["agency_id"] = null;
  //   this.searchObj["sub_rec_cd"] = null;
  //   this.searchObj["sub_rec_name"] = null;
  //   this.searchObj.agency_id =
  //     selectedList?.selectedItemsValues[0]?.agency_id || null;
  //   this.searchObj.sub_rec_cd =
  //     selectedList?.selectedItemsValues[0]?.sub_rec_cd || null;
  //   this.searchObj.sub_rec_name =
  //     selectedList?.selectedItemsValues[0]?.sub_rec_name || null;
  // }

  searchSetupList() {
    let payload = {
      parentCd: "",
      subRecCd: this.searchObj.sub_rec_cd,
      subRecName: this.searchObj.sub_rec_name,
      subRecType: "P",
      notificationFormat: this.selectedNotificationFormat,
      recStat: this.selectedSubRecStatus,
      option: "X",
      orderBy: "sub_rec_name",
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
    };
    this.showSpinner = true;
    this.managementService.searchSubRecipientDetails(payload).subscribe(
      (res: any) => {
        if (res != null) {
          this.initialData = res;
          this.responseData.data = res.items;
          this.originalData = JSON.parse(JSON.stringify(res.items));
          this.responseData = new MatTableDataSource(res.items);
          this.totalItems = res.totalItems;
          this.totalPages = res.totalPages;
          if (this.paginator) {
            this.paginator.pageIndex = this.pageNumber - 1;
          }
          this.showSpinner = false;
          if (res?.length == 0) {
            this.toastrService.error("", "No Records Found.");
          }
        }
        if (this.responseData?.data?.length == 0) {
          this.toastrService.error("", "No Records Found.");
        }
        this.showSpinner = false;
      },
      (error) => {
        this.showSpinner = false;
      }
    );
  }

  openPopup(data: any, pageName: any) {
    let headerName = "";
    let height = "60%";
    data.searchObj = this.searchObj;

    if (pageName == "addSubRec") {
      headerName = "Add Sub_Recipient";
      height = "75%";
    }
    if (pageName == "viewBuildings") {
      headerName = "Buildings";
      height = "60%";
    }
    if (pageName == "addlInfo") {
      headerName = "Sub-Recipient Additional Information";
      height = "75%";
    }

    const dialogRef = this.dialog.open(SubRecipientPopupComponent, {
      maxWidth: "150vw",
      width: "70%",
      height: height,
      data: { pageName: pageName, headerName: headerName, emitdata: data },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (
        (result?.pageName == "addSubRec" || result?.pageName == "addlInfo") &&
        result?.data === "ok"
      ) {
        this.searchSetupList();
      }
    });
  }

  onRecStatChange(value: string, element: any) {
    if (value === "O") {
      element.closeDt = null;
    }
  }

  saveSubRecipientDetails() {
    const modifiedRows = this.responseData?.data?.filter(
      (currentRow, index) => {
        const originalRow = this.originalData[index];
        return JSON.stringify(currentRow) !== JSON.stringify(originalRow);
      }
    );

    if (modifiedRows.length > 0 && this.validateData(modifiedRows)) {
      modifiedRows.map((rec: any) => {
        rec.lastUpdId = this.userDetails?.userId;
        rec.parentCd = rec.subRecCd;
        rec.subRecDtl = {
          agencyId: 0,
          fedId: "",
          addLine1: "",
          city: "",
          stateCd: "",
          zip1: "",
          contactFName: "",
          contactLName: "",
          contactPhone: "",
          contactEmail: "",
        };
      });

      this.managementService.saveSubRecipientDetails(modifiedRows).subscribe(
        (res: any) => {
          if (res != null) {
            this.searchSetupList();
            this.showSpinner = false;
            this.toastrService.success(
              "The record has been updated successfully.",
              ""
            );
          }
        },
        (error) => {
          this.showSpinner = false;
        }
      );
    } else {
      this.toastrService.success("No modified rows to save", "");
    }
  }

  openConfirmDeletePopup(rowData: any) {
    const dialogRef = this.dialog.open(PopUpComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",

      width: "30%",
      height: "25%",
      data: {
        pageName: "subrecipient",
        headerName: "Confirmation",
        emitdata: rowData?.subRecName + " (" + rowData?.subRecCd + ")",
      },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data === "ok") {
        this.deleteSubRecipientData(rowData);
      }
    });
  }

  deleteSubRecipientData(rowData: any) {
    this.showSpinner = true;
    const desc = rowData.subRecName ?? "";
    const code = rowData.subRecCd ?? "";
    this.managementService.deleteSubRecipientData(rowData?.agencyId).subscribe(
      (res) => {
        if (res != null) {
          if (res === true) {
            this.clearSelection();
            this.searchSetupList();
            this.showSpinner = false;
            this.toastrService.success(
              "Sub-Recipient data has been removed successfully.",
              `${desc}${code ? ` (${code})` : ""}  `
            );
          }
        }
      },
      (error) => {
        this.showSpinner = false;
      }
    );
  }

  clearSelection() {
    this.selectedSearchSubRec = "";
    this.filteredSubRecInfo = [];
    this.searchObj["agency_id"] = null;
    this.searchObj["sub_rec_cd"] = null;
    this.searchObj["sub_rec_name"] = null;
  }

  onSelected() {
    this.responseData.data = [];
    this.responseData._updateChangeSubscription();
    this.searchObj["agency_id"] = null;
    this.searchObj["sub_rec_cd"] = null;
    this.searchObj["sub_rec_name"] = null;
    this.searchObj.agency_id = this.selectedSearchSubRec?.agencyId || null;
    this.searchObj.sub_rec_cd = this.selectedSearchSubRec?.subRecCd || null;
    this.searchObj.sub_rec_name = this.selectedSearchSubRec?.subRecName || null;
  }

  exportToPDF(): void {
    this.showSpinner = true;
    const selectedColumns: string[] = [
      "subRecCd",
      "subRecName",
      "notifyFmt",
      "recStat",
      "closeDt",
    ];
    const customHeaders: { [key: string]: string } = {
      subRecCd: "Code",
      subRecName: "Sub-Recipient Name",
      notifyFmt: "Notification Format",
      recStat: "Status",
      closeDt: "Close Date",
    };

    const transformedData =
      this.responseData?.filteredData?.map((item: any) => ({
        subRecCd: item.subRecCd,
        subRecName: item.subRecName,
        notifyFmt:
          item.notifyFmt === "E"
            ? "Email"
            : item.notifyFmt === "L"
            ? "Letter"
            : item.notifyFmt,
        recStat:
          item.recStat === "C"
            ? "Closed"
            : item.recStat === "O"
            ? "Open"
            : item.recStat,
        closeDt: item.closeDt ? this.formatDate(item.closeDt) : "",
      })) || [];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = this.formatDate(new Date().toISOString());

    const leftText = "Application";
    const centerText = "Sub-Recipient List";
    const rightText = today;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const leftX = 14;
    const rightX = pageWidth - doc.getTextWidth(rightText) - 14;
    const centerX = pageWidth / 2 - doc.getTextWidth(centerText) / 2;

    doc.text(leftText, leftX, 15);
    doc.text(centerText, centerX, 15);
    doc.text(rightText, rightX, 15);

    const columns = selectedColumns.map((key) => ({
      header: customHeaders[key],
      dataKey: key,
    }));

    autoTable(doc, {
      startY: 25,
      columns: columns,
      body: transformedData,
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        halign: "center",
      },
    });

    doc.save("SubRecipient-data.pdf");
    this.showSpinner = false;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  displayWith(value: any): string {
    if (!value || (!value.subRecName && !value.subRecCd)) {
      return "";
    }

    const desc = value.subRecName ?? "";
    const code = value.subRecCd ?? "";

    return `${desc}${code ? ` (${code})` : ""}`;
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.searchSetupList();
  }

  onPageSizeChange(event: MatSelectChange) {
    const selectedSize = event?.value;
    if (selectedSize === "all") {
      this.currentPageSize = "all";
      this.paginator.pageSize = this.totalItems;
    } else {
      this.currentPageSize = selectedSize;
      this.paginator.pageSize = selectedSize;
    }
    this.pageSize = this.paginator.pageSize;
    this.pageNumber = 1;
    this.searchSetupList();
    this.paginator.firstPage();
  }

  exportToExcel(): void {
    this.showSpinner = true;
    this.showSpinner = false;
  }

  validateData(data: any): boolean {
    const now = new Date();
    const nullCloseDtItems = data.filter(
      (item) =>
        item.recStat === "C" && (item.closeDt == null || item.closeDt === "")
    );
    const futureCloseDtItems = data.filter(
      (item) =>
        item.recStat === "C" &&
        item.closeDt != null &&
        new Date(item.closeDt) > now
    );
    const emptySubRecCdItems = data.filter(
      (item) => item.subRecCd || item.subRecCd.toString().trim() === ""
    );
    const emptySubRecNameItems = data.filter(
      (item) => item.subRecCd || item.subRecCd.toString().trim() === ""
    );

    const totalInvalid =
      nullCloseDtItems?.length +
      futureCloseDtItems?.length +
      emptySubRecCdItems?.length +
      emptySubRecNameItems?.length;
    if (totalInvalid > 0) {
      let errorMessage = "";
      if (nullCloseDtItems?.length > 0) {
        errorMessage += `${nullCloseDtItems?.length} entr${
          nullCloseDtItems?.length > 1 ? "ies" : "y"
        } with null Close Date. `;
      }
      if (futureCloseDtItems?.length > 0) {
        errorMessage += `${futureCloseDtItems?.length} entr${
          futureCloseDtItems?.length > 1 ? "ies have" : "y has"
        } Close Date in the future. `;
      }
      if (emptySubRecCdItems?.length > 0) {
        errorMessage += `${emptySubRecCdItems?.length} entr${
          emptySubRecCdItems?.length > 1 ? "ies have" : "y has"
        } empty subRecCd. `;
      }
      if (emptySubRecNameItems?.length > 0) {
        errorMessage += `${emptySubRecNameItems?.length} entr${
          emptySubRecNameItems?.length > 1 ? "ies have" : "y has"
        } empty subRecName. `;
      }

      this.toastrService.error(
        `Found ${totalInvalid} invalid entr${
          totalInvalid > 1 ? "ies" : "y"
        }: ${errorMessage}`,
        "Validation Error"
      );
      return false;
    }

    return true;
  }
}
