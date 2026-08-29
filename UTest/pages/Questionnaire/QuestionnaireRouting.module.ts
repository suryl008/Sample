import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QusContainerComponent } from "./QusContainer/qus-container.component";
const routes: Routes = [
  {
    path: "",
    component: QusContainerComponent,
    children: [
      { path: "questionnairesearch", component: QusContainerComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionnaireRoutingModule {}
