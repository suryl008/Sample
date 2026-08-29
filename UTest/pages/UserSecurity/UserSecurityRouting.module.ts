import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GEMSUserSearchComponent } from './GEMSUserSearch/GEMSUserSearch.component';
import { CTEUserComponent } from './CTEUser/cteuser.component';

const routes: Routes = [
  { path: "", redirectTo: "gemsusersearch" },
  { path: "gemsusersearch", component: GEMSUserSearchComponent },
  { path: 'cteuser', component: CTEUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserSecurityRoutingModule { 
}
