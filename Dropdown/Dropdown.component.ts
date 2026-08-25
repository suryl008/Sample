import { Component, Input, OnInit, OnChanges, DoCheck, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './Dropdown.component.html',
  styleUrls: ['./Dropdown.component.scss']
})
export class DropdownComponent implements OnInit, OnChanges, DoCheck {
  @Input() dropdownListValue: any[] = [];
  @Input() selectedItemsValues: any = [];
  @Input() selectedText: string = 'Please Select';
  @Input() isDisable: boolean = false;
  @Input() isMultiSelectDropdown: boolean = false;
  @Input() controlName: string = '';
  @Output() updatedSelectedValue = new EventEmitter<any>();

  // Material model: a single object (or null) when single select, an array when multi select.
  // Kept separate from selectedItemsValues so the parent always keeps the array contract.
  public internalSelection: any = null;

  // Identity of the parent selection as last observed, so in-place array edits are detected
  private lastParentKey: string | null = null;
  private searchTermLower: string = '';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.syncFromParent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItemsValues'] || changes['isMultiSelectDropdown']) {
      this.syncFromParent();
      this.cdr.markForCheck();
    }
  }

  ngDoCheck(): void {
    // Callers such as Review Setup clear the array then push into it, which never
    // changes the input reference, so ngOnChanges alone would miss the new value.
    const parentKey = this.buildKey(this.toArray(this.selectedItemsValues));
    if (parentKey === this.lastParentKey) return;

    this.lastParentKey = parentKey;
    if (parentKey !== this.buildKey(this.toArray(this.internalSelection))) {
      this.syncFromParent();
      this.cdr.markForCheck();
    }
  }

  // Tells Angular Material how to match items by identity value instead of object reference
  public compareObjects(option1: any, option2: any): boolean {
    if (!option1 || !option2) return false;
    const id1 = option1.id ?? option1.itemId ?? option1.itemCode ?? option1.itemName;
    const id2 = option2.id ?? option2.itemId ?? option2.itemCode ?? option2.itemName;
    return id1 === id2;
  }

  // Callers pass and receive arrays for both modes, matching the previous multiselect widget
  private toArray(value: any): any[] {
    if (value === null || value === undefined || value === '') return [];
    return Array.isArray(value) ? value : [value];
  }

  private buildKey(items: any[]): string {
    return items
      .map(item => String(item?.id ?? item?.itemId ?? item?.itemCode ?? item?.itemName ?? ''))
      .join('|');
  }

  private syncFromParent(): void {
    const selected = this.toArray(this.selectedItemsValues);
    this.internalSelection = this.isMultiSelectDropdown
      ? [...selected]
      : (selected[0] ?? null);
    this.lastParentKey = this.buildKey(selected);
  }

  public filterDropdownValues(searchTerm: string): void {
    this.searchTermLower = (searchTerm || '').toLowerCase();
    this.cdr.markForCheck();
  }

  // Options stay rendered and only hide, so Material keeps the selection and trigger text intact
  public isItemVisible(item: any): boolean {
    if (!this.searchTermLower) return true;
    return (item?.itemName || item?.name || '').toLowerCase().includes(this.searchTermLower);
  }

  public get hasVisibleItems(): boolean {
    const list = this.dropdownListValue || [];
    if (!this.searchTermLower) return list.length > 0;
    return list.some(item => this.isItemVisible(item));
  }

  public onSelectionChange(): void {
    this.updatedSelectedValue.emit({
      selectedItemsValues: this.isMultiSelectDropdown
        ? this.toArray(this.internalSelection)
        : (this.internalSelection ? [this.internalSelection] : []),
      controlName: this.controlName
    });
  }

  // Returns true if every item in the master list is found inside the selection model
  public isAllSelected(): boolean {
    if (!this.isMultiSelectDropdown || !this.dropdownListValue?.length) return false;
    return this.toArray(this.internalSelection).length === this.dropdownListValue.length;
  }

  // Clears or selects the entire list dataset immediately
  public toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation(); // Stops the dropdown container menu from hiding on selection click

    this.internalSelection = this.isAllSelected() ? [] : [...this.dropdownListValue];

    this.onSelectionChange();
    this.cdr.markForCheck(); // Repaints UI element checkboxes instantly
  }
}
