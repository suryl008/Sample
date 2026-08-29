import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectorVisitContainerComponent } from './DirectorVisitContainer/DirectorVisitContainer.component';

const routes: Routes = [
  {
    path: "",
    component: DirectorVisitContainerComponent,
    children: [
      { path: "directordetails", component:  DirectorVisitContainerComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirectorVisitRoutingModule { 
}
