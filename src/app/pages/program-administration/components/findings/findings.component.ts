import { Component, ViewChild, OnInit } from "@angular/core";
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
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public userForm: FormGroup;
  public user: User;
  public fruits = [
    { id: 1, name: "lemon" },
    { id: 2, name: "lime" },
    { id: 3, name: "orange" },
    { id: 4, name: "strawberry" },
    { id: 5, name: "raspberry" },
  ];
  public filteredFruits$: Observable<Fruit[]>;

  @ViewChild("fruitList") fruitList: MatChipList;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public fb: FormBuilder) {}

  ngOnInit(): void {
    this.user = user;
    this.buildUserForm();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.userForm.controls[controlName].hasError(errorName);
  };

  public selectFruit(event: MatAutocompleteSelectedEvent): void {
    if (!event.option) {
      return;
    }

    const value = event.option.value;

    // this.programInfoForm.controls['programTypesCtrl'].setValue(
    //   this.program.pgmSrc == 'X' ? false : true
    // );

    if (value && value instanceof Object && !this.user.fruits.includes(value)) {
      this.user.fruits.push(value);
      this.userForm.controls["fruits"].setValue(this.user.fruits);
      this.userForm.controls["fruitInput"].setValue("");
    }
  }

  public addFruit(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (value.trim()) {
      const matches = this.fruits.filter(
        (fruit) => fruit.name.toLowerCase() === value
      );
      const formValue = this.userForm.controls["fruits"].value;
      const matchesNotYetSelected =
        formValue === null
          ? matches
          : matches.filter(
              (x) => !formValue.find((y: { id: number }) => y.id === x.id)
            );
      if (matchesNotYetSelected.length === 1) {
        this.user.fruits.push(matchesNotYetSelected[0]);
        this.userForm.controls["fruits"].setValue(this.user.fruits);
        this.userForm.controls["fruitInput"].setValue("");
      }
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  public remove(fruit: Fruit) {
    const index = this.user.fruits.indexOf(fruit);
    if (index >= 0) {
      this.user.fruits.splice(index, 1);
      this.userForm.controls["fruits"].setValue(this.user.fruits);
      this.userForm.controls["fruitInput"].setValue("");
    }
  }

  public submitForm(): void {
    console.log({ user: this.user, submitForm: this.userForm.get("fruits") });
  }

  private buildUserForm(): void {
    this.userForm = this.fb.group({
      firstName: [this.user.firstName, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      fruitInput: [null],
      fruits: [this.user.fruits, this.validateFruits],
    });

    this.userForm.controls["fruits"].statusChanges.subscribe(
      (status) => (this.fruitList.errorState = status === "INVALID")
    );

    this.filteredFruits$ = this.userForm.controls[
      "fruitInput"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this.fruitFilter(value))
    );
  }

  private fruitFilter(value: any): Fruit[] {
    const filterValue =
      value === null || value instanceof Object ? "" : value.toLowerCase();
    const matches = this.fruits.filter((fruit) =>
      fruit.name.toLowerCase().includes(filterValue)
    );
    const formValue = this.userForm.controls["fruits"].value;
    return formValue === null
      ? matches
      : matches.filter(
          (x) => !formValue.find((y: { id: number }) => y.id === x.id)
        );
  }

  private validateFruits(fruits: FormControl) {
    if (fruits.value && fruits.value.length === 0) {
      return {
        validateFruitsArray: { valid: false },
      };
    }

    return null;
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
