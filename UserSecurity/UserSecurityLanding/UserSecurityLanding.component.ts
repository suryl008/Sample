import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-security-landing',
  templateUrl: './UserSecurityLanding.component.html',
  styleUrls: ['./UserSecurityLanding.component.css', '../UserSecurity.css']
})
export class UserSecurityLandingComponent implements OnInit {

  @Input() selectedTabIndex;
  public tabIndex : any = [];
  public selectedIndex : number

  constructor(private router : Router) { }

  async ngOnInit() {
    this.pageHeadingTab();
    this.selectedIndex = this.selectedTabIndex ? this.selectedTabIndex : 0 ;
  }

  pageHeadingTab(){
    this.tabIndex = [
      { tabHeaderName : 'GEMS', visible : true},
      { tabHeaderName : 'CIA', visible : true},
    ] 
  }

  async navigateTab(event : any){
    if(event.index === 0){
      this.router.navigate(['usersecurity/gemsusersearch'])
    }
    if(event.index === 1){
      this.router.navigate(['usersecurity/usersecuritydetails'])
    }
  }

}
