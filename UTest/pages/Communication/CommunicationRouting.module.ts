import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailTemplateComponent } from './EmailTemplate/EmailTemplate.component';

const routes: Routes = [
  {
    path: "",
    component: EmailTemplateComponent,
    children: [
      { path: "emailtemplate", component:  EmailTemplateComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunicationRoutingModule { 
}
