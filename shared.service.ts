import { catchError, map, Observable, of } from "rxjs";
import { AdminMenuItem, ProgramAdministrationService } from "./program-administration.service";
import { Injectable } from "@angular/core";
import { DatePipe, formatDate } from "@angular/common";
import * as XLSX from "xlsx-js-style";
import * as FileSaver from "file-saver";
import { Router } from "@angular/router";
import SaveAs from "file-saver";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8";
const EXCEL_EXTENSION = "xlsx";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  private qscrMaintain: boolean | null = null;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private router: Router
  ) {}

  numberOnly(event): boolean {
    const numOnly = event.which ? event.which : event.keyCode;
    if (numOnly > 31 && (numOnly < 48 || numOnly > 57)) {
      return false;
    }
    return true;
  }

  checkIsAddOrEdit(pageCode: any) {
    let userDetails = this.programAdministrationService.getUserDetails();
    if (
      userDetails?.roleMenuMappings.filter((x: any) => x.menuCode == pageCode)
        .length > 0
    ) {
      let userMenu = userDetails?.roleMenuMappings.filter(
        (x: any) => x.menuCode == pageCode
      )[0];
      if (!userMenu?.active) {
        this.router.navigate(["autherror"]);
        return;
      }
      return userMenu?.edit;
    } else {
      this.router.navigate(["autherror"]);
      return;
    }
  }

  refreshQuestionnaireScriptAccess(): Observable<boolean> {
    const userDetails = this.programAdministrationService.getUserDetails();
    const role = userDetails?.userRole;
    const userId = userDetails?.userId;

    if (!role) {
      this.qscrMaintain = this.readSessionQscr();
      return of(this.qscrMaintain);
    }

    return this.programAdministrationService.getAdminMenus(role, userId).pipe(
      map((menus) => {
        this.qscrMaintain = this.resolveQscrFromAdminMenus(menus);
        return this.qscrMaintain;
      }),
      catchError((error) => {
        console.error("Unable to load QSCR permission from GetAdminMenus.", error);
        this.qscrMaintain = this.readSessionQscr();
        return of(this.qscrMaintain);
      })
    );
  }

  canMaintainQuestionnaireScripts(): boolean {
    if (this.qscrMaintain !== null) {
      return this.qscrMaintain;
    }
    return this.readSessionQscr();
  }

  private resolveQscrFromAdminMenus(menus: AdminMenuItem[] | null | undefined): boolean {
    const qscr = (menus || []).find((item: any) =>
      String(item?.menuCode || item?.MenuCode || "").toUpperCase() === "QSCR"
    ) as any;
    if (!qscr) {
      return false;
    }

    const userActive = qscr.userActive ?? qscr.UserActive;
    const userEdit = qscr.userEdit ?? qscr.UserEdit;
    const roleActive = qscr.roleActive ?? qscr.RoleActive;
    const roleEdit = qscr.roleEdit ?? qscr.RoleEdit;
    const hasUserOverride = userActive != null;
    const visible = hasUserOverride ? !!userActive : !!roleActive;
    const edit = hasUserOverride ? !!userEdit : !!roleEdit;
    return visible && edit;
  }

  private readSessionQscr(): boolean {
    const mappings = this.programAdministrationService.getUserDetails()?.roleMenuMappings;
    if (!mappings?.length) {
      return false;
    }

    const scriptMenu = mappings.find(
      (item: any) => String(item?.menuCode || "").toUpperCase() === "QSCR"
    );
    if (!scriptMenu) {
      return false;
    }

    const isVisible = scriptMenu.visible === true
      || (scriptMenu.visible === undefined && scriptMenu.active === true);
    return isVisible && scriptMenu.edit === true;
  }

  getCurrentUserId(): number {
    return this.programAdministrationService.getUserDetails()?.userId ?? 0;
  }

  public exportToExcel(
    json: any,
    downloadDetails,
    excelSheetName: any[],
    isTemplateHeader
  ) {
    console.log(json, downloadDetails);
    let excelArray = ([] = JSON.parse(JSON.stringify(json)));
    const wb = XLSX.utils.book_new();
    if (excelArray.length > 0) {
      excelArray.forEach((element: any[], index) => {
        const ws = XLSX.utils.json_to_sheet(element);
        XLSX.utils.book_append_sheet(wb, ws, excelSheetName[index]);
        const range = XLSX.utils.decode_range(ws["!ref"] ?? "");
        !isTemplateHeader || downloadDetails["isSingleRows"][index]
          ? (range.s.r = 1)
          : "";
        ws["!ref"] = XLSX.utils.encode_range(range);

        let fitToColumn = [];
        //DYNAMIC STYLE
        if (isTemplateHeader) {
          for (
            let row = 0;
            row <= downloadDetails["sheetHeaderCount"][index];
            row++
          ) {
            for (
              let column = 0;
              column <= Object.keys(element[row]).length - 1;
              column++
            ) {
              const callRef = XLSX.utils.encode_cell({ r: row, c: column });
              ws[callRef].s = {
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                },
                font: {
                  bold: true,
                  color: { rbg: "FFFFFF" },
                },
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: "b2b2b2" },
                },
                alignment: {
                  horizontal: "center",
                  wrap: true,
                },
              };
            }
          }

          for (
            let row = 0;
            row <= downloadDetails["sheetHeaderCount"][index] - 1;
            row++
          ) {
            fitToColumn.push(element[row]);
          }
        } else {
          for (let row = 0; row <= 0; row++) {
            for (let column = 0; column <= element[row].length - 1; column++) {
              const callRef = XLSX.utils.encode_cell({ r: row + 1, c: column });
              ws[callRef].s = {
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                },
                font: {
                  bold: true,
                  color: { rbg: "FFFFFF" },
                },
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: "b2b2b2" },
                },
                alignment: {
                  horizontal: "center",
                  wrap: true,
                },
              };
            }
            fitToColumn.push(element[row]);
          }
        }

        //DYNAMIC MERGE CELL
        let merge = [];
        [element].forEach((x, xindex) => {
          if (xindex < downloadDetails["sheetHeaderCount"][index]) {
            if (isTemplateHeader) {
              let startIndex: number;
              let endIndex: number = 0;
              let firstRow: number = 0;

              //ROW WISE MERGE
              Object.keys(x[xindex]).forEach((y, yindex) => {
                if (y?.toLocaleString().includes("__EMPTY")) {
                  endIndex = yindex;
                  firstRow = startIndex;
                  if (yindex == Object.keys(x[xindex]).length - 1) {
                    merge.push({
                      s: { r: xindex + 1, c: startIndex },
                      e: { r: xindex + 1, c: yindex },
                    });
                  }
                } else {
                  startIndex = yindex;
                  endIndex != 0
                    ? merge.push({
                        s: { r: xindex, c: firstRow },
                        e: { r: xindex, c: endIndex },
                      })
                    : "";
                  endIndex = 0;
                }
              });

              Object.keys(x[xindex]).forEach((y, yindex) => {
                if (x[xindex][y]?.toLocaleString().includes("__COLUMN")) {
                  // console.log(y, yindex, Object.keys(x[xindex]).length-1, x[xindex][y])
                  endIndex = yindex;
                  firstRow = startIndex;
                  if (yindex == Object.keys(x[xindex]).length - 1) {
                    merge.push({
                      s: { r: xindex + 1, c: startIndex },
                      e: { r: xindex + 1, c: yindex },
                    });
                  }
                } else {
                  // console.log(y, yindex, Object.keys(x[xindex]).length-1, x[xindex][y])
                  startIndex = yindex;
                  endIndex != 0
                    ? merge.push({
                        s: { r: xindex + 1, c: firstRow },
                        e: { r: xindex + 1, c: endIndex },
                      })
                    : "";
                  endIndex = 0;
                }
              });
            }
          }
          ws["!merges"] = merge;
        });
        ws["!cols"] = this.fitToColumn(fitToColumn);
      });
    }
    const excelBuffer: any = XLSX.write(wb, {
      bookType: "xlsx",
      type: "buffer",
      cellStyles: true,
    });
    this.saveAsExcellFile(excelBuffer, downloadDetails.reportName);
  }

  public fitToColumn(array) {
    const columnWidth = [];
    for (const property in array[0]) {
      columnWidth.push({
        wch:
          Math.max(
            property ? property.toString().length : 0,
            ...array.map((obj) =>
              obj[property] ? obj[property].toString().length : 0
            )
          ) + 2,
      });
    }
    return columnWidth;
  }

  public saveAsExcellFile(buffer: any, fileName: string) {
    const date = formatDate(new Date(), "dd-MM-yyyy", "en");
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName + "_" + date + EXCEL_EXTENSION);
  }

  sorting(list: any, key: string) {
    return list.sort((a: any, b: any) => {
      if (a[key] < b[key]) {
        return -1;
      }
      if (a[key] > b[key]) {
        return 1;
      }
      return 0;
    });
  }

  updateEmptyObjToNull(val: any) {
    const updateArray = val?.map((item: any) => {
      for (const key in item) {
        if (
          Object.prototype.hasOwnProperty.call(item, key) &&
          typeof item[key] === "object" &&
          Object.keys(item[key])?.length === 0
        ) {
          item[key] = null;
        }
      }
      return item;
    });
    return updateArray;
  }

  exportToExcel1(
    fileName: any,
    exportInfo: {
      sheetName: string;
      data: any[];
      exportColumns: string[] | null;
      customHeaders: {} | null;
    }[]
  ) {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    exportInfo.forEach((sheet) => {
      let exportData: any = [];
      if (sheet.exportColumns != null) {
        const filteredData = sheet.data.map((item) => {
          let filteredItem = {};
          sheet.exportColumns?.forEach((column) => {
            filteredItem[column] = item[column];
          });
          return filteredItem;
        });

        const dataWithCustomHeaders = filteredData.map((item) => {
          const newItem = {};
          sheet.exportColumns?.forEach((column, index) => {
            const customHeader = sheet.customHeaders[column] || column;
            newItem[customHeader] = item[column];
          });
          return newItem;
        });
        exportData = dataWithCustomHeaders;
      } else {
        exportData = sheet.data;
      }
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, worksheet, sheet.sheetName);
    });
    XLSX.writeFile(wb, fileName);
  }

  convertByteArrayToBlob(data: any) {
    const byteChar = atob(data);
    const byteNumber = new Array(byteChar.length);
    for (let index = 0; index < byteChar.length; index++) {
      byteNumber[index] = byteChar.charCodeAt(index);
    }
    var byteArray = new Uint8Array(byteNumber);
    var blob = new Blob([byteArray], {
      type: "application/octet-stream",
    });
    return blob;
  }

  downloadZip(blobData: any, folderName: string) {
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blobData);
    a.href = url;
    a.download = folderName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  byteArrayToExportExcel(data: any, fileName: string) {
    var blob = this.convertByteArrayToBlob(data);
    SaveAs(blob, fileName.toString().toLowerCase());
  }

  byteArrayToZip(data: any, folderName: string) {
    var blob = this.convertByteArrayToBlob(data);
    this.downloadZip(blob, folderName.toString().toLowerCase());
  }
}
