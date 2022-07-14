import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramAdministrationRoutingModule } from './program-administration-routing.module';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { FindingsComponent } from './components/findings/findings.component';
import { FindingsRulesComponent } from './components/findings-rules/findings-rules.component';
import { ProgramInfoComponent } from './components/program-info/program-info.component';
import { ReleaseProgramComponent } from './components/release-program/release-program.component';
import { ReviewTypesComponent } from './components/review-types/review-types.component';
import { StageRolesComponent } from './components/stage-roles/stage-roles.component';
import { SubRecipientComponent } from './components/sub-recipient/sub-recipient.component';
import { MainComponent } from './components/main/main.component';
import { DashboardComponent } from './components/main/dashboard/dashboard.component';
import { SidebarComponent } from './components/main/sidebar/sidebar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialExampleModule } from 'src/app/material.module';
import { MetadataDialogComponent } from './components/review-types/metadata-dialog/metadata-dialog.component';
import { PlanRemaindersDialogComponent } from './components/review-types/plan-remainders-dialog/plan-remainders-dialog.component';
import { ConfirmDialogComponent } from './components/program-info/confirm-dialog/confirm-dialog.component';
import { MetadataConfirmDialogComponent } from './components/review-types/metadata-confirm-dialog/metadata-confirm-dialog.component';
import { UserDialogComponent } from './components/program-info/user-dialog/user-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DocumentListInfoDialogComponent } from './components/document-list/document-list-info-dialog/document-list-info-dialog.component';
import { LoaderComponent } from 'src/util/loader/loader.component';

@NgModule({
  declarations: [
    DocumentListComponent,
    FindingsComponent,
    FindingsRulesComponent,
    ProgramInfoComponent,
    ReleaseProgramComponent,
    ReviewTypesComponent,
    StageRolesComponent,
    SubRecipientComponent,
    MainComponent,
    DashboardComponent,
    SidebarComponent,
    MetadataDialogComponent,
    PlanRemaindersDialogComponent,
    ConfirmDialogComponent,
    MetadataConfirmDialogComponent,
    UserDialogComponent,
    DocumentListInfoDialogComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteLibModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MaterialExampleModule,
    ProgramAdministrationRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ProgramAdministrationModule {}
