import { SubRecipientComponent } from "./components/sub-recipient/sub-recipient.component";
import { ReleaseProgramComponent } from "./components/release-program/release-program.component";
import { StageRolesComponent } from "./components/stage-roles/stage-roles.component";
import { FindingsRulesComponent } from "./components/findings-rules/findings-rules.component";
import { FindingsComponent } from "./components/findings/findings.component";
import { DocumentListComponent } from "./components/document-list/document-list.component";
import { ReviewTypesComponent } from "./components/review-types/review-types.component";
import { ProgramInfoComponent } from "./components/program-info/program-info.component";
import { DashboardComponent } from "./components/main/dashboard/dashboard.component";
import { MainComponent } from "./components/main/main.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "info/:pid", component: ProgramInfoComponent },
      { path: "sub-recipient/:pid", component: SubRecipientComponent },
      { path: "release/:pid", component: ReleaseProgramComponent },
      { path: "review/:rid", component: ReviewTypesComponent },
      { path: "document/:pid", component: DocumentListComponent },
      { path: "findings/:pid", component: FindingsComponent },
      { path: "finding-rules/:pid", component: FindingsRulesComponent },
      { path: "stage-roles/:pid", component: StageRolesComponent },
      { path: "", redirectTo: "dashboard" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramAdministrationRoutingModule {}
