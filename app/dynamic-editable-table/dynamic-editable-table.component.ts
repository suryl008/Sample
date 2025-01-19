import { Component } from '@angular/core';

@Component({
  selector: 'app-dynamic-editable-table',
  templateUrl: './dynamic-editable-table.html',
  styleUrls: ['./dynamic-editable-table.css'],
})
export class DynamicEditableTableComponent {
  rows: number = 0;
  columns: number = 0;
  showPopup: boolean = false;
  tableRows: any[] = [];

  // Toggle the popup visibility
  togglePopup() {
    this.showPopup = !this.showPopup;
  }
 // Delete a specific row
  deleteRow(index: number) {
    this.tableRows.splice(index, 1);
  }

  // Generate the table based on popup selection
  generateTable(event: { rows: number; columns: number }) {
    // consider rows as event.columns and columns as event.rows

    this.rows = event.columns;
    this.columns = event.rows;
    this.showPopup = false;
    console.log('Table dimensions:', this.rows, 'x', this.columns);
  }
}
