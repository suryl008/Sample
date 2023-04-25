import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-header',
  templateUrl: './Landing.component.html',
  styleUrls: ['./Landing.component.scss']
})
export class LandingHeaderComponent implements OnInit {

  @Input() headerMenu;
  public tabIndex : any = [];
  public selectedIndex : number

  constructor(private router : Router) { }

  async ngOnInit() {
    this.getHeaderData()    
  }

  getHeaderData(){
    if(this.headerMenu == 'communication'){
      this.tabIndex = [
        { tabHeaderName : 'Email Template', visible : true},
      ] 
    }

  }


}

