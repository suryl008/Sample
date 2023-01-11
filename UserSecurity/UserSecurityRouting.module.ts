import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserSecurityLandingComponent } from './UserSecurityLanding/UserSecurityLanding.component';
import { GEMSUserSearchComponent } from './GEMSUserSearch/GEMSUserSearch.component';

const routes: Routes = [
  {
    path: "",
    component: GEMSUserSearchComponent,
    children: [
      { path: "gemsusersearch", component: GEMSUserSearchComponent },
      { path: "", redirectTo: "gemsusersearch" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserSecurityRoutingModule { 
}
