import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent, MatChipList } from "@angular/material/chips";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { startWith, map } from "rxjs/operators";
import { Observable } from "rxjs";

const user = {
  firstName: "Lindsey",
  lastName: "Broos",
  fruits: [],
};

@Component({
  selector: "app-findings",
  templateUrl: "./findings.component.html",
  styleUrls: ["./findings.component.css"],
})
export class FindingsComponent implements OnInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public userForm: FormGroup;
  public user: User;
 
  public filteredFruits$: Observable<Fruit[]>;

  @ViewChild("fruitList") fruitList: MatChipList;



  constructor(public fb: FormBuilder) {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
  ngOnInit(): void {
    this.user = user;
   
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.userForm.controls[controlName].hasError(errorName);
  };

 
   

  
  public submitForm(): void {
    console.log({ user: this.user, submitForm: this.userForm.get("fruits") });
  }

  

 
 
}

export interface User {
  firstName: string;
  lastName: string;
  fruits: Fruit[];
}

export interface Fruit {
  id: number;
  name: string;
}
