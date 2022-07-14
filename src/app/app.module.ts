import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';

import { ProgramAdministrationService } from './shared/services/program-administration.service';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialExampleModule } from './material.module';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    CoreModule,
    HttpClientModule,
    FormsModule,
    AutocompleteLibModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatNativeDateModule,
    MaterialExampleModule,
    NgMultiSelectDropDownModule.forRoot(),
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 10000, // 10 seconds
      progressBar: true,
    }),
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [ProgramAdministrationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
