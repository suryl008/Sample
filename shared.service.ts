import { Injectable } from '@angular/core';
import {DatePipe, formatDate } from "@angular/common";
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXTENSION = 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  public exportToExcel(json: any, excelFileName: string, excelSheetName: string) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(json);
    XLSX.utils.book_append_sheet(wb, ws, excelSheetName);
    
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "");
    const rowCount = range.e.r;
    const columnCount = range.e.c;

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        const callRef = XLSX.utils.encode_cell({r : row, c: column});
        ws[callRef].s = {
          border : {
            top : {style : 'thin', color : {rgb : '000000'}},
            left : {style : 'thin', color : {rgb : '000000'}},
            right : {style : 'thin', color : {rgb : '000000'}},
            bottom : {style : 'thin', color : {rgb : '000000'}},
          }
        }

        if(row == 0){
          ws[callRef].s = {
            border : {
              top : {style : 'thin', color : {rgb : '000000'}},
              left : {style : 'thin', color : {rgb : '000000'}},
              right : {style : 'thin', color : {rgb : '000000'}},
              bottom : {style : 'thin', color : {rgb : '000000'}},
            },
            font : {
              bold : true,
              color : {rbg : 'FFFFFF'},
            },
            // fill :{
            //   patternType : 'solid',
            //   fgColor : { rgb : '00008B'},
            //   bgColor : { rgb : '00008B'},
            // }
          }
        }

        ws['!cols'] = this.fitToColumn(json);
      }
    }
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
    this.saveAsExcellFile(excelBuffer, excelFileName);
  }

  public fitToColumn(array){
    const columnWidth = [];
    for(const property in array[0]){
      columnWidth.push({wch : Math.max(property ? property.toString().length : 0, ...array.map(obj => obj[property] ? obj[property].toString().length : 0 )) + 2})
    }
    return columnWidth; 
  }

  public saveAsExcellFile(buffer :any, fileName : string){
    const date = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const data : Blob = new Blob([buffer], {
      type : EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName+'_'+date+EXCEL_EXTENSION);
  }
}
