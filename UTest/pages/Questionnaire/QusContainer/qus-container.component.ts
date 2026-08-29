import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
    selector: 'app-qus-container',
    templateUrl: './qus-container.component.html',
    styleUrls: ['./qus-container.component.scss'],
    host: { class: 'questionnaire-root' },
    standalone: false
})
export class QusContainerComponent implements OnInit {
  public headerMenu: any[] = [];
  public selectedIndex = 0;
  public selectedPage = 'search';
  public selectedQuestionnaire: any;
  public selectedSection: any;
  public activeScript: any = null;
  public activeScriptId: number | null = null;
  public scriptStatusMessage = '';
  private questionnaireSelected = false;
  private syncingTabs = false;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.buildHeaderMenu();
    this.selectedIndex = 0;
    this.selectedPage = 'search';
    this.sharedService.refreshQuestionnaireScriptAccess().subscribe(() => {
      this.updateHeaderMenuVisibility();
    });
  }

  getHeaderTabSelection(event: string) {
    if (this.syncingTabs) {
      return;
    }
    if (!this.questionnaireSelected && event !== 'search') {
      this.setSelectedPage('search');
      return;
    }
    if ((event === 'scripts' || event === 'script-history') && !this.sharedService.canMaintainQuestionnaireScripts()) {
      this.setSelectedPage(this.questionnaireSelected ? 'questionnaires' : 'search');
      return;
    }
    this.setSelectedPage(event);
  }

  emitSelectedQuestionnaire(event: any) {
    if (!event) {
      return;
    }

    if (event.showDetails === false) {
      this.questionnaireSelected = false;
      this.selectedQuestionnaire = null;
      this.selectedSection = null;
      this.scriptStatusMessage = '';
      this.activeScript = null;
      this.activeScriptId = null;
      this.updateHeaderMenuVisibility();
      this.setSelectedPage('search');
      return;
    }

    this.questionnaireSelected = true;
    this.selectedQuestionnaire = event?.data || this.selectedQuestionnaire;
    this.scriptStatusMessage = '';
    this.activeScript = null;
    this.activeScriptId = null;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage(event.selectedPage || 'questionnaires');
  }

  emitSelectedSection(event: any) {
    this.selectedSection = event?.data;
    this.setSelectedPage(event.selectedPage);
  }

  onNavigateToScripts(questionnaire: any): void {
    if (!this.sharedService.canMaintainQuestionnaireScripts()) {
      return;
    }
    this.questionnaireSelected = true;
    this.selectedQuestionnaire = questionnaire;
    this.scriptStatusMessage = '';
    this.activeScript = null;
    this.activeScriptId = null;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('scripts');
  }

  onActiveScriptChange(script: any) {
    this.activeScript = script;
    this.activeScriptId = script?.questionnaireScriptId ?? null;
  }

  onScriptHistoryRequest(script: any) {
    if (!this.sharedService.canMaintainQuestionnaireScripts()) {
      return;
    }
    this.activeScript = script;
    this.activeScriptId = script?.questionnaireScriptId ?? null;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('script-history');
  }

  goBackToScripts(): void {
    this.scriptStatusMessage = '';
    this.setSelectedPage('scripts');
  }

  onVersionRestored(event: { scriptId: number; message: string }): void {
    this.activeScriptId = event?.scriptId ?? this.activeScriptId;
    this.scriptStatusMessage = event?.message || '';
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('scripts');
  }

  closeScriptManager(): void {
    this.activeScript = null;
    this.activeScriptId = null;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('questionnaires');
  }

  onHistoryLoaded(_hasHistory: boolean) {
    this.updateHeaderMenuVisibility();
  }

  private updateHeaderMenuVisibility() {
    const canMaintainScripts = this.sharedService.canMaintainQuestionnaireScripts();
    this.headerMenu.forEach((item: any) => {
      if (item.selectedPage === 'search') {
        item.visible = true;
        return;
      }
      if (item.selectedPage === 'scripts' || item.selectedPage === 'script-history') {
        item.visible = this.questionnaireSelected && canMaintainScripts;
        return;
      }
      item.visible = this.questionnaireSelected;
    });
  }

  private buildHeaderMenu() {
    this.headerMenu = [
      { tabHeaderName: 'Search', visible: true, selectedPage: 'search' },
      { tabHeaderName: 'Questionnaires', visible: false, selectedPage: 'questionnaires' },
      { tabHeaderName: 'Sections', visible: false, selectedPage: 'section' },
      { tabHeaderName: 'Fields', visible: false, selectedPage: 'field' },
      { tabHeaderName: 'Scripts', visible: false, selectedPage: 'scripts' },
      { tabHeaderName: 'Script History', visible: false, selectedPage: 'script-history' },
    ];
  }

  private setSelectedPage(page: string): void {
    this.syncingTabs = true;
    this.selectedPage = page;
    const visibleTabs = this.headerMenu.filter((item) => item.visible);
    const visibleIndex = visibleTabs.findIndex((item) => item.selectedPage === page);
    if (visibleIndex >= 0) {
      this.selectedIndex = visibleIndex;
    }
    setTimeout(() => {
      this.syncingTabs = false;
    });
  }
}
