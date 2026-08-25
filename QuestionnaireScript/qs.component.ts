import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QsService, QuestionnaireModel, QuestionnaireScriptModel } from 'src/app/shared/services/qs.service';
import { SharedService } from 'src/app/shared/services/shared.service';

type PageState = 'LOADING' | 'ERROR' | 'NO_SCRIPTS' | 'LIST' | 'VIEW' | 'ADD' | 'EDIT' | 'DENIED';

@Component({
  selector: 'app-qs',
  templateUrl: './qs.component.html',
  styleUrls: ['./qs.component.scss']
})
export class QsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedQuestionnaire: any;
  @Input() focusScriptId: number | null = null;
  @Input() statusMessage = '';
  @Output() activeScriptChange = new EventEmitter<QuestionnaireScriptModel | null>();
  @Output() showHistory = new EventEmitter<QuestionnaireScriptModel>();
  @Output() closeScriptManager = new EventEmitter<void>();

  private qsService = inject(QsService);
  private formBuilder = inject(FormBuilder);
  private sharedService = inject(SharedService);

  state: PageState = 'LOADING';
  questionnaire: QuestionnaireModel = { id: 0, name: '' };
  scripts: QuestionnaireScriptModel[] = [];
  filteredScripts: QuestionnaireScriptModel[] = [];
  currentScript: QuestionnaireScriptModel | null = null;
  scriptForm: FormGroup;
  searchTerm = '';
  toastMessage = '';
  saveError = '';
  syntaxWarning = '';
  isSaving = false;
  editorExpanded = false;
  wordWrapEnabled = true;
  private monacoOptionsKey = '';
  private monacoOptionsValue: Record<string, any> = {};
  sortColumn: keyof QuestionnaireScriptModel | 'scriptName' = 'scriptName';
  sortAscending = true;
  readonly scriptNameMax = 200;
  readonly scriptDescriptionMax = 1000;

  constructor() {
    this.scriptForm = this.formBuilder.group({
      questionnaireScriptId: [0],
      questionnaireId: [0],
      scriptName: ['', [Validators.required, Validators.maxLength(this.scriptNameMax)]],
      scriptDescription: ['', [Validators.maxLength(this.scriptDescriptionMax)]],
      script: ['', [Validators.required]],
      changeNote: ['', [Validators.maxLength(1000)]],
      createdBy: [null],
      createDate: [null],
      modifiedBy: [null],
      modifyDate: [null]
    });
  }

  ngOnInit(): void {
    this.syncQuestionnaire();
    this.loadScripts();
  }

  ngOnDestroy(): void {
    this.setEditorExpanded(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['statusMessage'] && this.statusMessage) {
      this.showToast(this.statusMessage);
    }
    if (changes['selectedQuestionnaire'] && !changes['selectedQuestionnaire'].firstChange) {
      this.syncQuestionnaire();
      this.loadScripts();
    } else if (changes['focusScriptId'] && this.scripts.length) {
      this.applyFocusScript();
    }
  }

  get canEdit(): boolean {
    return this.state === 'ADD' || this.state === 'EDIT';
  }

  get scriptNameLength(): number {
    return String(this.scriptForm.get('scriptName')?.value || '').length;
  }

  get scriptDescriptionLength(): number {
    return String(this.scriptForm.get('scriptDescription')?.value || '').length;
  }

  get scriptContentLength(): number {
    return String(this.scriptForm.get('script')?.value || '').length;
  }

  get scriptLineCount(): number {
    const script = String(this.scriptForm.get('script')?.value || '');
    return script ? script.split('\n').length : 0;
  }

  // The reference must stay stable between renders: the editor wrapper rebuilds the
  // instance whenever a new options object arrives.
  get monacoOptions(): Record<string, any> {
    const readOnly = this.state === 'VIEW';
    const key = `${readOnly}|${this.wordWrapEnabled}`;
    if (key !== this.monacoOptionsKey) {
      this.monacoOptionsKey = key;
      this.monacoOptionsValue = {
        language: 'javascript',
        theme: 'vs',
        readOnly,
        wordWrap: this.wordWrapEnabled ? 'on' : 'off',
        lineNumbers: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 13,
        tabSize: 4,
        renderWhitespace: 'selection',
        ariaLabel: 'Questionnaire script editor'
      };
    }
    return this.monacoOptionsValue;
  }

  sortState(column: string): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn !== column) {
      return 'none';
    }
    return this.sortAscending ? 'ascending' : 'descending';
  }

  toggleWordWrap(): void {
    this.wordWrapEnabled = !this.wordWrapEnabled;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.editorExpanded) {
      this.setEditorExpanded(false);
    }
  }

  toggleEditorSize(): void {
    this.setEditorExpanded(!this.editorExpanded);
  }

  private setEditorExpanded(expanded: boolean): void {
    this.editorExpanded = expanded;
    document.body.classList.toggle('qscript-editor-locked', expanded);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      $event.preventDefault();
      $event.returnValue = true;
    }
  }

  private syncQuestionnaire(): void {
    this.questionnaire = {
      id: Number(this.selectedQuestionnaire?.id ?? this.selectedQuestionnaire?.questionnaireId ?? 0),
      name: this.selectedQuestionnaire?.name || this.selectedQuestionnaire?.itemName || 'Selected Questionnaire'
    };
    this.scriptForm?.patchValue({ questionnaireId: this.questionnaire.id }, { emitEvent: false });
  }

  private emitActiveScript(): void {
    this.activeScriptChange.emit(this.currentScript);
  }

  loadScripts(): void {
    if (!this.sharedService.canMaintainQuestionnaireScripts()) {
      this.state = 'DENIED';
      this.currentScript = null;
      this.emitActiveScript();
      return;
    }

    const questionnaireId = this.questionnaire.id;
    if (!questionnaireId) {
      this.state = 'NO_SCRIPTS';
      this.currentScript = null;
      this.emitActiveScript();
      return;
    }

    this.state = 'LOADING';
    this.saveError = '';
    this.qsService.getScriptsByQuestionnaire(questionnaireId).subscribe({
      next: (data) => {
        this.scripts = data || [];
        this.applyFilterAndSort();
        this.determineInitialState();
      },
      error: (error) => {
        this.state = 'ERROR';
        this.saveError = this.qsService.getApiErrorMessage(error, 'Questionnaire scripts could not be loaded. Please try again.');
      }
    });
  }

  determineInitialState(): void {
    if (this.applyFocusScript()) {
      return;
    }
    if (this.scripts.length === 0) {
      this.state = 'NO_SCRIPTS';
      this.currentScript = null;
      this.emitActiveScript();
    } else if (this.scripts.length === 1) {
      this.viewScript(this.scripts[0], true);
    } else {
      this.state = 'LIST';
      this.currentScript = null;
      this.emitActiveScript();
    }
  }

  applyFocusScript(): boolean {
    if (!this.focusScriptId) {
      return false;
    }
    const matched = this.scripts.find((script) => script.questionnaireScriptId === Number(this.focusScriptId));
    if (!matched) {
      return false;
    }
    this.viewScript(matched, true);
    return true;
  }

  viewScript(script: QuestionnaireScriptModel, skipConfirm = false): void {
    if (!skipConfirm && !this.confirmNavigateAway()) {
      return;
    }
    this.currentScript = script;
    this.emitActiveScript();
    this.scriptForm.patchValue({ ...script, changeNote: '' });
    this.scriptForm.markAsPristine();
    this.scriptForm.disable();
    this.scriptForm.get('changeNote')?.enable();
    this.state = 'VIEW';
    this.syntaxWarning = '';
    this.setEditorExpanded(false);
  }

  openScriptHistory(script: QuestionnaireScriptModel): void {
    if (!this.confirmNavigateAway()) {
      return;
    }
    this.currentScript = script;
    this.emitActiveScript();
    this.showHistory.emit(script);
  }

  addScript(): void {
    if (!this.confirmNavigateAway()) return;
    this.currentScript = null;
    this.emitActiveScript();
    this.scriptForm.reset({
      questionnaireId: this.questionnaire.id,
      questionnaireScriptId: 0,
      scriptName: '',
      scriptDescription: '',
      script: '',
      changeNote: ''
    });
    this.scriptForm.enable();
    this.state = 'ADD';
    this.syntaxWarning = '';
    this.setEditorExpanded(false);
  }

  editScript(): void {
    this.scriptForm.enable();
    this.state = 'EDIT';
  }

  closeToManagement(): void {
    if (!this.confirmNavigateAway()) return;
    this.setEditorExpanded(false);
    this.closeScriptManager.emit();
  }

  backToList(): void {
    if (!this.confirmNavigateAway()) return;
    this.state = 'LIST';
  }

  cancelEdit(): void {
    if (!this.confirmNavigateAway()) return;
    if (this.state === 'ADD') {
      if (this.scripts.length > 0) {
        this.state = this.scripts.length === 1 ? 'VIEW' : 'LIST';
        if (this.scripts.length === 1) {
          this.viewScript(this.scripts[0], true);
        }
      } else {
        this.closeToManagement();
      }
      return;
    }
    if (this.currentScript) {
      this.viewScript(this.currentScript, true);
    }
  }

  save(closeAfter = false): void {
    if (this.scriptForm.invalid) {
      this.scriptForm.markAllAsTouched();
      return;
    }

    const formValue = this.scriptForm.getRawValue();
    const payload: QuestionnaireScriptModel = {
      ...formValue,
      currentUserId: this.sharedService.getCurrentUserId(),
      modifiedBy: this.sharedService.getCurrentUserId()
    };
    this.evaluateSyntax(payload.script);
    this.isSaving = true;
    this.saveError = '';

    this.qsService.saveScript(payload).subscribe({
      next: (savedData) => {
        this.isSaving = false;
        this.showToast('The questionnaire script was saved successfully.');
        const savedScript = this.normalizeSavedScript(savedData, payload);
        this.currentScript = savedScript;
        this.emitActiveScript();
        this.scriptForm.patchValue({ ...savedScript, changeNote: '' }, { emitEvent: false });
        this.scriptForm.markAsPristine();
        this.refreshScriptsAfterSave(savedScript, closeAfter);
      },
      error: (error) => {
        this.isSaving = false;
        this.saveError = this.qsService.getApiErrorMessage(error, 'The questionnaire script could not be saved. No changes were made.');
      }
    });
  }

  private normalizeSavedScript(savedData: any, payload: QuestionnaireScriptModel): QuestionnaireScriptModel {
    const raw = savedData?.data ?? savedData ?? payload;
    return {
      ...payload,
      questionnaireScriptId: Number(raw?.questionnaireScriptId ?? payload.questionnaireScriptId),
      questionnaireId: Number(raw?.questionnaireId ?? payload.questionnaireId),
      scriptName: raw?.scriptName ?? payload.scriptName,
      scriptDescription: raw?.scriptDescription ?? payload.scriptDescription,
      script: raw?.script ?? payload.script,
      createdBy: raw?.createdBy ?? payload.createdBy,
      createDate: raw?.createDate ?? payload.createDate,
      modifiedBy: raw?.modifiedBy ?? payload.modifiedBy,
      modifyDate: raw?.modifyDate ?? payload.modifyDate
    };
  }

  private refreshScriptsAfterSave(savedScript: QuestionnaireScriptModel, closeAfter: boolean): void {
    this.qsService.getScriptsByQuestionnaire(this.questionnaire.id).subscribe({
      next: (data) => {
        this.scripts = data || [];
        this.applyFilterAndSort();
        const latest = this.scripts.find((item) => item.questionnaireScriptId === savedScript.questionnaireScriptId) || savedScript;
        this.currentScript = latest;
        this.emitActiveScript();
        this.scriptForm.patchValue({ ...latest, changeNote: '' }, { emitEvent: false });
        this.scriptForm.markAsPristine();
        if (closeAfter) {
          if (this.scripts.length > 1) {
            this.state = 'LIST';
          } else {
            this.closeToManagement();
          }
          return;
        }
        this.scriptForm.enable();
        this.state = 'EDIT';
      },
      error: () => {
        this.scriptForm.enable();
        this.state = 'EDIT';
      }
    });
  }

  copyScript(): void {
    const scriptContent = this.scriptForm.getRawValue().script || '';
    navigator.clipboard.writeText(scriptContent).then(() => {
      this.showToast('The complete questionnaire script was copied to the clipboard.');
    });
  }

  evaluateSyntax(script: string): void {
    const open = (script.match(/{/g) || []).length;
    const close = (script.match(/}/g) || []).length;
    this.syntaxWarning = open === close
      ? ''
      : `Possible JavaScript syntax issue: unmatched braces (opened ${open}, closed ${close}). You can still save after reviewing.`;
  }

  hasUnsavedChanges(): boolean {
    return this.canEdit && this.scriptForm.dirty;
  }

  confirmNavigateAway(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Leaving this page will discard those changes.');
    }
    return true;
  }

  getDisplayName(script: QuestionnaireScriptModel): string {
    const name = script.scriptName?.trim();
    return name ? name : `Script ${script.questionnaireScriptId}`;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilterAndSort();
  }

  sortBy(column: keyof QuestionnaireScriptModel): void {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = true;
    }
    this.applyFilterAndSort();
  }

  applyFilterAndSort(): void {
    let result = [...this.scripts];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((script) =>
        (this.getDisplayName(script).toLowerCase().includes(term)) ||
        (script.scriptDescription?.toLowerCase().includes(term)) ||
        script.questionnaireScriptId.toString().includes(term)
      );
    }

    result.sort((left, right) => {
      const valueA = this.sortColumn === 'scriptName' ? this.getDisplayName(left) : (left[this.sortColumn] ?? '');
      const valueB = this.sortColumn === 'scriptName' ? this.getDisplayName(right) : (right[this.sortColumn] ?? '');
      if (valueA < valueB) return this.sortAscending ? -1 : 1;
      if (valueA > valueB) return this.sortAscending ? 1 : -1;
      return left.questionnaireScriptId - right.questionnaireScriptId;
    });
    this.filteredScripts = result;
  }

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 3000);
  }
}
