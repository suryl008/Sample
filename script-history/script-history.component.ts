import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { QsService, QuestionnaireScriptHistoryModel, QuestionnaireScriptModel } from 'src/app/shared/services/qs.service';
import { ProgramAdministrationService } from 'src/app/shared/services/program-administration.service';
import { SharedService } from 'src/app/shared/services/shared.service';

type HistoryViewMode = 'LIST' | 'VIEW' | 'COMPARE';
type HistorySortColumn = 'versionNumber' | 'actionType' | 'changedBy' | 'changeDate';

@Component({
  selector: 'app-script-history',
  templateUrl: './script-history.component.html',
  styleUrls: ['./script-history.component.scss']
})
export class ScriptHistoryComponent implements OnInit, OnChanges {
  @Input() scriptId!: number;
  @Input() questionnaireId!: number;
  @Input() questionnaireName!: string;
  @Input() currentActiveScript: QuestionnaireScriptModel | null = null;
  @Output() historyLoaded = new EventEmitter<boolean>();
  @Output() goBack = new EventEmitter<void>();
  @Output() versionRestored = new EventEmitter<{ scriptId: number; message: string }>();

  readonly readOnlyEditorOptions = {
    language: 'javascript',
    theme: 'vs',
    readOnly: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 13,
    renderWhitespace: 'selection'
  };

  mode: HistoryViewMode = 'LIST';
  historyList: QuestionnaireScriptHistoryModel[] = [];
  selectedVersion: QuestionnaireScriptHistoryModel | null = null;
  compareRows: Array<{ left: string; right: string; state: 'same' | 'changed' | 'added' | 'removed' }> = [];
  compareNameChanged = false;
  compareDescriptionChanged = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  restoreChangeNote = '';
  isRestoring = false;
  showRestoreModal = false;
  toastMessage = '';
  sortColumn: HistorySortColumn = 'versionNumber';
  sortAscending = false;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private qsService: QsService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadHistoryList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scriptId'] || changes['currentActiveScript']) {
      this.loadHistoryList();
    }
  }

  loadHistoryList(): void {
    if (!this.sharedService.canMaintainQuestionnaireScripts() || !this.scriptId) {
      this.historyList = [];
      this.selectedVersion = null;
      this.mode = 'LIST';
      this.historyLoaded.emit(false);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.qsService.getHistoryList(this.scriptId).subscribe({
      next: (data) => {
        this.historyList = data || [];
        this.applySort();
        this.loading = false;
        this.selectedVersion = null;
        this.historyLoaded.emit(this.historyList.length > 0);
        if (this.historyList.length === 1) {
          this.viewVersion(this.historyList[0]);
        } else {
          this.mode = 'LIST';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.qsService.getApiErrorMessage(error, 'Questionnaire script history could not be loaded. Please try again.');
        this.historyLoaded.emit(false);
      }
    });
  }

  sortBy(column: HistorySortColumn): void {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = column !== 'versionNumber' && column !== 'changeDate';
    }
    this.applySort();
  }

  sortState(column: HistorySortColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn !== column) {
      return 'none';
    }
    return this.sortAscending ? 'ascending' : 'descending';
  }

  diffLabel(state: 'same' | 'changed' | 'added' | 'removed'): string {
    switch (state) {
      case 'added':
        return 'Added line';
      case 'removed':
        return 'Removed line';
      case 'changed':
        return 'Changed line';
      default:
        return 'Unchanged line';
    }
  }

  closeRestoreModal(): void {
    this.showRestoreModal = false;
  }

  applySort(): void {
    this.historyList = [...this.historyList].sort((left, right) => {
      const valueA = left[this.sortColumn] ?? '';
      const valueB = right[this.sortColumn] ?? '';
      if (valueA < valueB) return this.sortAscending ? -1 : 1;
      if (valueA > valueB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  viewVersion(record: QuestionnaireScriptHistoryModel): void {
    this.loading = true;
    this.errorMessage = '';
    this.qsService.getHistoryVersion(this.scriptId, record.questionnaireScriptHistoryId).subscribe({
      next: (fullData) => {
        this.selectedVersion = fullData;
        this.mode = 'VIEW';
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.qsService.getApiErrorMessage(error, 'The selected questionnaire script version could not be loaded.');
      }
    });
  }

  compareRecord(record: QuestionnaireScriptHistoryModel): void {
    this.loading = true;
    this.errorMessage = '';
    this.qsService.getHistoryVersion(this.scriptId, record.questionnaireScriptHistoryId).subscribe({
      next: (fullData) => {
        this.loading = false;
        this.selectedVersion = fullData;
        this.compareWithCurrent();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'The selected versions could not be compared. Please try again.';
      }
    });
  }

  compareWithCurrent(): void {
    if (!this.selectedVersion || !this.currentActiveScript) {
      this.errorMessage = 'The selected versions could not be compared. Please try again.';
      return;
    }
    this.compareNameChanged = (this.selectedVersion.scriptName ?? '') !== (this.currentActiveScript.scriptName ?? '');
    this.compareDescriptionChanged = (this.selectedVersion.scriptDescription ?? '') !== (this.currentActiveScript.scriptDescription ?? '');
    this.compareRows = this.buildCompareRows(this.selectedVersion.script || '', this.currentActiveScript.script || '');
    this.mode = 'COMPARE';
  }

  get compareChangeCount(): number {
    return this.compareRows.filter((row) => row.state !== 'same').length;
  }

  private buildCompareRows(historical: string, current: string) {
    const leftLines = this.toComparableLines(historical);
    const rightLines = this.toComparableLines(current);
    const max = Math.max(leftLines.length, rightLines.length);
    const rows = [];
    for (let index = 0; index < max; index += 1) {
      const left = leftLines[index];
      const right = rightLines[index];
      let state: 'same' | 'changed' | 'added' | 'removed' = 'same';
      if (left === undefined) state = 'added';
      else if (right === undefined) state = 'removed';
      else if (left !== right) state = 'changed';
      rows.push({ left: left ?? '', right: right ?? '', state });
    }
    return rows;
  }

  // Plain-text scripts must be split verbatim; parsing them as HTML would silently drop
  // anything that looks like a tag. Only versions saved as markup are unwrapped.
  private toComparableLines(content: string): string[] {
    const value = String(content ?? '');
    const isMarkup = /<\/(p|div|li|h[1-6]|tr|pre|blockquote)>|<br\s*\/?>/i.test(value);
    if (!isMarkup) {
      return value.split('\n');
    }
    const normalized = value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|tr|pre|blockquote)>/gi, '\n');
    const container = document.createElement('div');
    container.innerHTML = normalized;
    return (container.textContent || '').replace(/\u00a0/g, ' ').split('\n');
  }

  get latestVersionNumber(): number {
    return this.historyList.reduce((max, item) => Math.max(max, item.versionNumber || 0), 0);
  }

  canRestoreRecord(record: QuestionnaireScriptHistoryModel): boolean {
    if (this.isRestoring || !record?.versionNumber) {
      return false;
    }
    // The newest version is always the snapshot of the active script, so restoring it
    // would make no change. List rows carry no script content to compare directly.
    return record.versionNumber !== this.latestVersionNumber;
  }

  isVersionDifferentFromCurrent(version: QuestionnaireScriptHistoryModel | null = this.selectedVersion): boolean {
    if (!version || !this.currentActiveScript) {
      return false;
    }
    return (this.currentActiveScript.scriptName ?? '') !== (version.scriptName ?? '')
      || (this.currentActiveScript.scriptDescription ?? '') !== (version.scriptDescription ?? '')
      || (this.currentActiveScript.script ?? '') !== (version.script ?? '');
  }

  canRestoreSelectedVersion(): boolean {
    return !!this.selectedVersion && !this.isRestoring && this.isVersionDifferentFromCurrent();
  }

  copyScript(text: string | undefined, historical: boolean): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(historical
        ? 'The complete historical questionnaire script was copied to the clipboard.'
        : 'The complete questionnaire script was copied to the clipboard.');
    });
  }

  copyHistoryRecord(record: QuestionnaireScriptHistoryModel): void {
    this.loading = true;
    this.qsService.getHistoryVersion(this.scriptId, record.questionnaireScriptHistoryId).subscribe({
      next: (fullData) => {
        this.loading = false;
        this.copyScript(fullData.script, true);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'The selected questionnaire script version could not be loaded.';
      }
    });
  }

  openRestoreModal(record?: QuestionnaireScriptHistoryModel): void {
    this.errorMessage = '';
    const startRestore = (version: QuestionnaireScriptHistoryModel) => {
      this.selectedVersion = version;
      if (!this.canRestoreSelectedVersion()) {
        this.errorMessage = 'The selected version is already the current version and cannot be restored.';
        return;
      }
      this.restoreChangeNote = '';
      this.showRestoreModal = true;
    };

    if (record && !record.script) {
      this.loading = true;
      this.qsService.getHistoryVersion(this.scriptId, record.questionnaireScriptHistoryId).subscribe({
        next: (fullData) => {
          this.loading = false;
          startRestore(fullData);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'The selected questionnaire script version could not be loaded.';
        }
      });
      return;
    }
    if (record) {
      startRestore(record);
      return;
    }
    if (this.selectedVersion) {
      startRestore(this.selectedVersion);
    }
  }

  confirmRestore(): void {
    if (!this.canRestoreSelectedVersion() || !this.selectedVersion) {
      this.errorMessage = 'The selected version is already the current version and cannot be restored.';
      return;
    }
    if (!this.restoreChangeNote.trim()) {
      this.errorMessage = 'Enter a Change Note explaining why this version is being restored.';
      return;
    }

    this.isRestoring = true;
    this.qsService.restoreVersion({
      questionnaireScriptId: this.scriptId,
      sourceVersionNumber: this.selectedVersion.versionNumber,
      currentUserId: this.programAdministrationService.getUserDetails()?.userId ?? this.sharedService.getCurrentUserId(),
      changeNote: this.restoreChangeNote.trim()
    }).subscribe({
      next: (response) => {
        this.isRestoring = false;
        this.showRestoreModal = false;
        this.successMessage = response?.message || `Version ${this.selectedVersion?.versionNumber} was restored successfully. The previous active version remains available in history.`;
        this.versionRestored.emit({ scriptId: this.scriptId, message: this.successMessage });
      },
      error: (error) => {
        this.isRestoring = false;
        this.showRestoreModal = false;
        this.errorMessage = this.qsService.getApiErrorMessage(error, 'The questionnaire script version could not be restored. No changes were made.');
      }
    });
  }

  backToList(): void {
    this.mode = 'LIST';
    this.selectedVersion = null;
    this.successMessage = '';
  }

  backToScripts(): void {
    this.goBack.emit();
  }

  backToView(): void {
    this.mode = 'VIEW';
  }

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 3000);
  }
}
