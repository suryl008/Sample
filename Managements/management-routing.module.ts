import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrandComponent } from './Errand/errand.component';
import { TemplateComponent } from './Template/template.component';

const routes: Routes = [
  {
    path : 'errand', component : ErrandComponent
  },
  {
    path : 'template', component : TemplateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
