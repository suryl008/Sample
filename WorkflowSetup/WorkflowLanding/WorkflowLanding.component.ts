import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workflow-landing',
  templateUrl: './WorkflowLanding.component.html',
  styleUrls: ['./WorkflowLanding.component.scss', '../Workflow.scss']
})
export class WorkflowLandingComponent implements OnInit {

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
      { tabHeaderName : 'Copy Workflow', visible : true},
    ] 
  }

  async navigateTab(event : any){
    if(event.index === 0){
      this.router.navigate(['WorkflowLanding/copyWorkflow'])
    }
  }

}

