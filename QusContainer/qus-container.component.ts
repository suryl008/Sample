import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-qus-container',
  templateUrl: './qus-container.component.html',
  styleUrls: ['./qus-container.component.scss'],
  host: { class: 'questionnaire-root' }
})
export class QusContainerComponent implements OnInit {
  public headerMenu: any[] = [];
  public selectedIndex = 0;
  public selectedPage = 'search';
  public selectedQuestionnaire: any;
  public selectedSection: any;
  public activeScript: any = null;
  public activeScriptId: number | null = null;
  public historyTabVisible = false;
  public scriptStatusMessage = '';
  private syncingTabs = false;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    const canMaintainScripts = this.sharedService.canMaintainQuestionnaireScripts();
    this.headerMenu = [
      { tabHeaderName: 'Search', visible: true, selectedPage: 'search' },
      { tabHeaderName: 'Questionnaires', visible: true, selectedPage: 'questionnaires' },
      { tabHeaderName: 'Sections', visible: true, selectedPage: 'section' },
      { tabHeaderName: 'Fields', visible: true, selectedPage: 'field' },
      { tabHeaderName: 'Scripts', visible: canMaintainScripts, selectedPage: 'scripts' },
      { tabHeaderName: 'Script History', visible: false, selectedPage: 'script-history' },
    ];
    this.selectedIndex = 0;
    this.selectedPage = 'search';
  }

  getHeaderTabSelection(event: string) {
    if (this.syncingTabs) {
      return;
    }
    if ((event === 'scripts' || event === 'script-history') && !this.sharedService.canMaintainQuestionnaireScripts()) {
      this.setSelectedPage('search');
      return;
    }
    this.setSelectedPage(event);
  }

  emitSelectedQuestionnaire(event: any) {
    if (!event) {
      return;
    }
    this.selectedQuestionnaire = event?.data || this.selectedQuestionnaire;
    this.scriptStatusMessage = '';
    this.activeScript = null;
    this.activeScriptId = null;
    this.historyTabVisible = false;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage(event.selectedPage || 'search');
  }

  emitSelectedSection(event: any) {
    this.selectedSection = event?.data;
    this.setSelectedPage(event.selectedPage);
  }

  onNavigateToScripts(questionnaire: any): void {
    this.selectedQuestionnaire = questionnaire;
    this.scriptStatusMessage = '';
    this.activeScript = null;
    this.activeScriptId = null;
    this.historyTabVisible = false;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('scripts');
  }

  onActiveScriptChange(script: any) {
    this.activeScript = script;
    this.activeScriptId = script?.questionnaireScriptId ?? null;
  }

  onScriptHistoryRequest(script: any) {
    this.activeScript = script;
    this.activeScriptId = script?.questionnaireScriptId ?? null;
    this.historyTabVisible = true;
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
    this.historyTabVisible = true;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('scripts');
  }

  closeScriptManager(): void {
    this.activeScript = null;
    this.activeScriptId = null;
    this.historyTabVisible = false;
    this.updateHeaderMenuVisibility();
    this.setSelectedPage('questionnaires');
  }

  onHistoryLoaded(hasHistory: boolean) {
    this.historyTabVisible = hasHistory;
    this.updateHeaderMenuVisibility();
  }

  private updateHeaderMenuVisibility() {
    const scriptHistoryTab = this.headerMenu.find((item: any) => item.selectedPage === 'script-history');
    if (scriptHistoryTab) {
      scriptHistoryTab.visible = this.historyTabVisible;
    }
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
