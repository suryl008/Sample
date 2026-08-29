import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CopyWorkflowComponent } from './CopyWorkflow/CopyWorkflow.component';

const routes: Routes = [
  {
    path: "",
    component: CopyWorkflowComponent,
    children: [
      { path: "copyworkflow", component:  CopyWorkflowComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { 
}
