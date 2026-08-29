import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-landing-header',
    templateUrl: './Landing.component.html',
    styleUrls: ['./Landing.component.scss'],
    standalone: false
})
export class LandingHeaderComponent {

  @Input() headerMenu;
  @Input() selectedIndex;
  @Output() emitcurrentTabSelection = new EventEmitter();

  constructor(private router : Router) { }

  navigateTab(event : any){
    const visibleTabs = (this.headerMenu || []).filter((item: any) => item?.visible);
    const selectedPage = visibleTabs[event?.index]?.selectedPage;
    if (selectedPage) {
      this.emitcurrentTabSelection.emit(selectedPage);
    }
  }


}

