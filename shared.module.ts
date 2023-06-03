import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DropdownComponent } from '../Dropdown/Dropdown.component';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';                                     
import { LandingHeaderComponent } from '../Landing/Landing.component';


@NgModule({
  declarations: [
    DropdownComponent,
    LandingHeaderComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    AngularMultiSelectModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatCheckboxModule,
    
  ],
  exports:[
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    DropdownComponent,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatCheckboxModule,
    LandingHeaderComponent,

  ]
})
export class SharedModule { }
