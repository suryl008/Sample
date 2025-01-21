import { Component, Output, EventEmitter } from '@angular/core';
import { IUserSelection } from '../user.selection';

@Component({
  selector: 'row-col-selector',
  templateUrl: './rowcol.component.html',
  styleUrls: ['./rowcol.component.css'],
})
export class RowColSelectorComponent {
  @Output() userSelection: EventEmitter<IUserSelection> = new EventEmitter();

  private readonly defaultRow: number = 0;
  private readonly defaultCol: number = 0;
  public readonly totalRowCount: number = 10;
  public readonly totalColCount: number = 10;

  //set initial value to default
  public selectedRowNumber: number = this.defaultRow;
  public selectedColNumber: number = this.defaultCol;

  public selectedCell(row: number, col: number) {
    this.clearSelection();
    this.selectedRowNumber = row;
    this.selectedColNumber = col;
    for (let i = 1; i <= row; i++) {
      for (let j = 1; j <= col; j++) {
        let td = this.getTdId(i, j);
        document.getElementById(td).style.backgroundColor = 'cadetblue';
      }
    }
    let selectedInfo: IUserSelection = { row: row, col: col };
    this.userSelection.emit(selectedInfo);
  }

  public getTdId(row: number, col: number): string {
    return `td${row}${col}`;
  }

  public clearSelection(): void {
    this.selectedRowNumber = this.defaultRow;
    this.selectedColNumber = this.defaultCol;

    let selectedInfo: IUserSelection = {
      row: this.defaultRow,
      col: this.defaultCol,
    };
    this.userSelection.emit(selectedInfo);

    for (let i = 1; i <= this.totalRowCount; i++) {
      for (let j = 1; j <= this.totalColCount; j++) {
        let td = this.getTdId(i, j);
        document.getElementById(td).style.backgroundColor = '';
      }
    }
  }
}
