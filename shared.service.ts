import { Injectable } from '@angular/core';
import { DatePipe, formatDate } from "@angular/common";
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXTENSION = 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  public exportToExcel(json: any, downloadDetails, excelSheetName: any[], isTemplateHeader) {
    let excelArray = [] = JSON.parse(JSON.stringify(json))
    const wb = XLSX.utils.book_new();
    if (excelArray.length > 0) {
      excelArray.forEach((element: any[], index) => {
        const ws = XLSX.utils.json_to_sheet(element);
        XLSX.utils.book_append_sheet(wb, ws, excelSheetName[index]);
        const range = XLSX.utils.decode_range(ws["!ref"] ?? "");
        !isTemplateHeader ? range.s.r = 1 : '';
        ws['!ref'] = XLSX.utils.encode_range(range);

        //DYNAMIC STYLE
        if (isTemplateHeader) {
          for (let row = 0; row <= downloadDetails['sheetHeaderCount'][index]; row++) {
            // console.log(index, downloadDetails[ 'sheetHeaderCount'][index], Object.keys(element[row]).length, excelArray, element[row])
            for (let column = 0; column <= Object.keys(element[row]).length - 1; column++) {
              const callRef = XLSX.utils.encode_cell({ r: row, c: column });
              ws[callRef].s = {
                border: {
                  top: { style: 'thin', color: { rgb: '000000' } },
                  left: { style: 'thin', color: { rgb: '000000' } },
                  right: { style: 'thin', color: { rgb: '000000' } },
                  bottom: { style: 'thin', color: { rgb: '000000' } },
                },
                font: {
                  bold: true,
                  color: { rbg: 'FFFFFF' },
                },
                fill: {
                  patternType: 'solid',
                  fgColor: { rgb: 'b2b2b2' },
                },
                alignment: {
                  horizontal: "center",
                  wrap: true
                },
              }
            }
          }
        }
        else {
          for (let row = 0; row <= 0; row++) {
            for (let column = 0; column <= element[row].length - 1; column++) {
              const callRef = XLSX.utils.encode_cell({ r: row + 1, c: column });
              ws[callRef].s = {
                border: {
                  top: { style: 'thin', color: { rgb: '000000' } },
                  left: { style: 'thin', color: { rgb: '000000' } },
                  right: { style: 'thin', color: { rgb: '000000' } },
                  bottom: { style: 'thin', color: { rgb: '000000' } },
                },
                font: {
                  bold: true,
                  color: { rbg: 'FFFFFF' },
                },
                fill: {
                  patternType: 'solid',
                  fgColor: { rgb: 'b2b2b2' },
                },
                alignment: {
                  horizontal: "center",
                  wrap: true
                },
              }
            }
          }
        }

        //DYNAMIC MERGE CELL
        let merge = [];
        [element].forEach((x, xindex) => {
          if (xindex < downloadDetails['sheetHeaderCount'][index]) {
            if (isTemplateHeader) {
              let startIndex: number;
              let endIndex: number = 0;
              let firstRow: number = 0;

              //ROW WISE MERGE
              Object.keys(x[xindex]).forEach((y, yindex) => {
                if (y?.toLocaleString().includes('__EMPTY')) {
                  console.log(xindex, yindex, y)
                  endIndex = yindex;
                  firstRow = startIndex;
                  if (yindex == x.length - 1) {
                    merge.push({ s: { r: xindex, c: firstRow }, e: { r: xindex, c: endIndex } })
                  }
                }
                else {
                  startIndex = yindex;
                  endIndex != 0 ? merge.push({ s: { r: xindex, c: firstRow }, e: { r: xindex, c: endIndex } }) : '';
                  endIndex = 0;
                }

              })

              // COLUMN WISE MERGE
              Object.keys(x[xindex]).forEach((y, yindex) => {
                if (x[xindex][y]?.toLocaleString().includes('__COLUMN')) {
                  merge.push({ s: { r: xindex, c: yindex }, e: { r: xindex + 1, c: yindex } })
                }
              })
            }
          }
          ws["!merges"] = merge;
          ws['!cols'] = this.fitToColumn(element);
        })
      })
    }
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
    this.saveAsExcellFile(excelBuffer, downloadDetails.reportName);
  }

  public fitToColumn(array) {
    const columnWidth = [];
    for (const property in array[0]) {
      columnWidth.push({ wch: Math.max(property ? property.toString().length : 0, ...array.map(obj => obj[property] ? obj[property].toString().length : 0)) + 2 })
    }
    return columnWidth;
  }

  public saveAsExcellFile(buffer: any, fileName: string) {
    const date = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_' + date + EXCEL_EXTENSION);
  }
}
