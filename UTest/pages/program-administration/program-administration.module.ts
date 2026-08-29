import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProgramAdministrationRoutingModule } from "./program-administration-routing.module";
import { DocumentListComponent } from "./components/document-list/document-list.component";
import { FindingsComponent } from "./components/findings/findings.component";
import { ProgramInfoComponent } from "./components/program-info/program-info.component";
import { ReleaseProgramComponent } from "./components/release-program/release-program.component";
import { ReviewTypesComponent } from "./components/review-types/review-types.component";
import { StageRolesComponent } from "./components/stage-roles/stage-roles.component";
import { SubRecipientComponent } from "./components/sub-recipient/sub-recipient.component";
import { MainComponent } from "./components/main/main.component";
import { DashboardComponent } from "./components/main/dashboard/dashboard.component";
import { SidebarComponent } from "./components/main/sidebar/sidebar.component";
//import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { ToastrModule } from "ngx-toastr";
import { MatNativeDateModule } from "@angular/material/core";
import { MetadataDialogComponent } from "./components/review-types/metadata-dialog/metadata-dialog.component";
import { PlanRemaindersDialogComponent } from "./components/review-types/plan-remainders-dialog/plan-remainders-dialog.component";
import { ConfirmDialogComponent } from "./components/program-info/confirm-dialog/confirm-dialog.component";
import { MetadataConfirmDialogComponent } from "./components/review-types/metadata-confirm-dialog/metadata-confirm-dialog.component";
import { UserDialogComponent } from "./components/program-info/user-dialog/user-dialog.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DocumentListInfoDialogComponent } from "./components/document-list/document-list-info-dialog/document-list-info-dialog.component";
import { LoaderComponent } from "src/util/loader/loader.component";
import { DocumentListAddDialogComponent } from "./components/document-list/document-list-add-dialog/document-list-add-dialog.component";
import { FormComponent } from "./components/document-list/components/form/form.component";
import { EffComponent } from "./components/document-list/components/eff/eff.component";
import { ApprovalsComponent } from "./components/document-list/components/approvals/approvals.component";
import { QuestionnaireComponent } from "./components/document-list/components/questionnaire/questionnaire.component";
import { RemainderComponent } from "./components/document-list/components/remainder/remainder.component";
import { SetupComponent } from "./components/findings/setup/setup/setup.component";
import { SetupDialogComponent } from "./components/findings/setup/setup-dialog/setup-dialog.component";
import { FindingFieldsComponent } from "./components/findings/setup/finding-fields/finding-fields.component";
import { StageRolesAddDialogComponent } from "./components/stage-roles/stage-roles-add-dialog/stage-roles-add-dialog.component";
import { FindingsRulesComponent } from "./components/findings-rules/findings-rules.component";
import { FindingRuleAddDialogComponent } from "./components/findings-rules/finding-rule-add-dialog/finding-rule-add-dialog.component";
import { FindingsAddDialogComponent } from "./components/findings-rules/findings-add-dialog/findings-add-dialog.component";
import { DocumentListRemainderDialogComponent } from "./components/document-list/document-list-remainder-dialog/document-list-remainder-dialog.component";
import { POCComponent } from "./components/findings-rules/poc/poc.component";
import { MatAutocompleteModule } from '@angular/material/autocomplete'; 
import { SharedModule } from "src/app/shared/shared.module";

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
    LoaderComponent,
    DocumentListAddDialogComponent,
    DocumentListRemainderDialogComponent,
    FormComponent,
    EffComponent,
    ApprovalsComponent,
    QuestionnaireComponent,
    RemainderComponent,
    SetupComponent,
    SetupDialogComponent,
    FindingFieldsComponent,
    FindingRuleAddDialogComponent,
    FindingsAddDialogComponent,
    StageRolesAddDialogComponent,
    POCComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatFormFieldModule,
    SharedModule,
    ProgramAdministrationRoutingModule,
    //NgMultiSelectDropDownModule.forRoot(),
  ],
})
export class ProgramAdministrationModule {}
