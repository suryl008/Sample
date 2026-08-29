import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnhancedFlexFormContainerComponent } from './EnhancedFlexFormContainer/EnhancedFlexFormContainer.component';

const routes: Routes = [
  {
    path: "",
    component: EnhancedFlexFormContainerComponent,
    children: [
      { path: "formDetails", component:  EnhancedFlexFormContainerComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnhancedFlexFormRoutingModule { 
}
