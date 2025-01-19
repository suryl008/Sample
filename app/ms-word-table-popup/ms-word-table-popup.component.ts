import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-table-insert-popup',
  templateUrl: './ms-word-table-popup.html',
  styleUrls: ['./ms-word-table-popup.css'],
})
export class MsWordTablePopupComponent {
    @Output() close = new EventEmitter<void>();
    @Output() tableGenerated = new EventEmitter<{ rows: number; columns: number }>();
  
    maxRows: number = 10; // Max rows for the grid
    maxCols: number = 10; // Max columns for the grid
    rows: number = 0; // Selected rows
    columns: number = 0; // Selected columns
  
    // Update rows and columns for highlighting based on hover
    updateHighlight(rows: number, columns: number) {
      this.rows = rows;
      this.columns = columns;
      console.log({ rows, columns });
    }
  
    // Emit the selected table dimensions
    confirmSelection() {
      this.tableGenerated.emit({ rows: this.rows, columns: this.columns });
    }
}
