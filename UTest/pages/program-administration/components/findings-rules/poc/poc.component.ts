import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: "app-poc",
    templateUrl: "./poc.component.html",
    styleUrls: ["./poc.component.scss"],
    standalone: false
})
export class POCComponent implements OnInit {
  @Input() dropdownListValue: any = [];
  @Input() selectedItemsValues: any = [];
  @Input() selectedText: any = [];
  @Input() isDIsable: any = [];
  @Output() updatedSelectedValue = new EventEmitter();

  ngOnInit(): void {
    this.isDIsable = false;
    this.selectedText = "Please Select";
    this.dropdownListValue = [
      { id: 1, itemName: "India" },
      { id: 2, itemName: "Singapore" },
      { id: 3, itemName: "Australia" },
      { id: 4, itemName: "Canada" },
      { id: 5, itemName: "South Korea" },
      { id: 6, itemName: "Germany" },
      { id: 7, itemName: "France" },
      { id: 8, itemName: "Russia" },
      { id: 9, itemName: "Italy" },
      { id: 10, itemName: "Sweden" },
    ];
  }
}
