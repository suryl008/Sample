import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrandComponent } from "./Errand/errand.component";
import { TemplateComponent } from "./Template/template.component";
import { SetupComponent } from "./Review/Setup/setup.component";
import { SubRecipientSearchComponent } from "./SubRecipient/SubRecipientSearch/SubRecipientSearch.component";

const routes: Routes = [
  {
    path: "errand",
    component: ErrandComponent,
  },
  {
    path: "template",
    component: TemplateComponent,
  },
  // {
  //   path : 'cteportal', component : CTEPortalComponent
  // },
  {
    path: "subrecipient",
    component: SubRecipientSearchComponent,
  },
  {
    path: "review",
    component: SetupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagementRoutingModule {}
