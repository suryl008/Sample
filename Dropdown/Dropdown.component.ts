import { outputAst, ThisReceiver } from '@angular/compiler';
import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './Dropdown.component.html',
  styleUrls: ['./Dropdown.component.css']
})
export class DropdownComponent implements OnInit {
@Input() dropdownListValue : any =[];
@Input() selectedItemsValues : any =[];
@Input() dropdownSettings : any =[];
@Input() selectedText : any =[];
@Input() isDisable : any =[];
@Input() isMultiSelectDropdown : any =[];
@Input() controlName : any =[];
@Output() updatedSelectedValue = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.dropdownSettings = {
      disabled : false,
      singleSelection: !this.isMultiSelectDropdown,
      text: this.selectedText,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      badgeShowLimit : 2,
    };

  }

  onItemSelect(item: any) {
    this.updatedSelectedValue.emit({selectedItemsValues : this.selectedItemsValues,  controlName : this.controlName})
  }
  OnItemDeSelect(item: any) {
    this.updatedSelectedValue.emit({selectedItemsValues : this.selectedItemsValues,  controlName : this.controlName})
  }
  onSelectAll(items: any) {
    this.updatedSelectedValue.emit({selectedItemsValues : this.selectedItemsValues,  controlName : this.controlName})
  }
  onDeSelectAll(items: any) {
    this.updatedSelectedValue.emit({selectedItemsValues : this.selectedItemsValues,  controlName : this.controlName})
  }
}
