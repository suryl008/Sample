import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportingModuleContainerComponent } from './ReportingModuleContainer/ReportingModuleContainer.component';

const routes: Routes = [
  {
    path: "",
    component: ReportingModuleContainerComponent,
    children: [
      { path: "reportingmodulesearch", component:  ReportingModuleContainerComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { 
}
