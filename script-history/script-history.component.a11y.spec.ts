import { A11yModule } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ScriptHistoryComponent } from './script-history.component';
import {
  QsService,
  QuestionnaireScriptHistoryModel,
  QuestionnaireScriptModel
} from 'src/app/shared/services/qs.service';
import { ProgramAdministrationService } from 'src/app/shared/services/program-administration.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MonacoEditorStubComponent } from 'src/testing/editor-stubs';
import { expectNoAccessibilityViolations } from 'src/testing/a11y';

function makeVersion(version: number, action: string): QuestionnaireScriptHistoryModel {
  return {
    questionnaireScriptHistoryId: version,
    questionnaireScriptId: 5,
    questionnaireId: 10,
    versionNumber: version,
    scriptName: `Field validation v${version}`,
    scriptDescription: 'Checks the response is present',
    script: `function validate() {\n  return ${version};\n}`,
    actionType: action,
    changedBy: 42,
    changeDate: '2026-01-0' + version + 'T10:00:00Z',
    changeNote: 'Adjusted the rule'
  } as QuestionnaireScriptHistoryModel;
}

describe('ScriptHistoryComponent accessibility', () => {
  let fixture: ComponentFixture<ScriptHistoryComponent>;
  let component: ScriptHistoryComponent;

  const history = [makeVersion(1, 'Baseline'), makeVersion(2, 'Update'), makeVersion(3, 'Update')];
  const activeScript = {
    questionnaireScriptId: 5,
    questionnaireId: 10,
    scriptName: 'Field validation v3',
    scriptDescription: 'Checks the response is present',
    script: 'function validate() {\n  return 3;\n}'
  } as QuestionnaireScriptModel;

  beforeEach(async () => {
    const qsService = jasmine.createSpyObj<QsService>('QsService', [
      'getHistoryList',
      'getHistoryVersion',
      'restoreVersion',
      'getApiErrorMessage'
    ]);
    qsService.getHistoryList.and.returnValue(of(history));
    qsService.getHistoryVersion.and.returnValue(of(history[0]));
    qsService.restoreVersion.and.returnValue(of({ message: 'Restored.' }));
    qsService.getApiErrorMessage.and.returnValue('Something went wrong.');

    const sharedService = jasmine.createSpyObj<SharedService>('SharedService', [
      'canMaintainQuestionnaireScripts',
      'getCurrentUserId'
    ]);
    sharedService.canMaintainQuestionnaireScripts.and.returnValue(true);
    sharedService.getCurrentUserId.and.returnValue(42);

    const programAdministrationService = jasmine.createSpyObj<ProgramAdministrationService>(
      'ProgramAdministrationService',
      ['getUserDetails']
    );
    programAdministrationService.getUserDetails.and.returnValue({ userId: 42 } as any);

    await TestBed.configureTestingModule({
      declarations: [ScriptHistoryComponent, MonacoEditorStubComponent],
      imports: [FormsModule, A11yModule],
      providers: [
        { provide: QsService, useValue: qsService },
        { provide: SharedService, useValue: sharedService },
        { provide: ProgramAdministrationService, useValue: programAdministrationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScriptHistoryComponent);
    component = fixture.componentInstance;
    component.scriptId = 5;
    component.questionnaireId = 10;
    component.questionnaireName = 'Annual Review';
    component.currentActiveScript = activeScript;
  });

  it('has no violations in the history list', async () => {
    fixture.detectChanges();
    expect(component.mode).toBe('LIST');
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('has no violations in the comparison view', async () => {
    fixture.detectChanges();
    component.selectedVersion = history[0];
    component.compareWithCurrent();
    fixture.detectChanges();
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('has no violations in the restore dialog', async () => {
    fixture.detectChanges();
    component.openRestoreModal(history[0]);
    fixture.detectChanges();
    expect(component.showRestoreModal).toBeTrue();
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('marks the restore dialog as modal and names it', () => {
    fixture.detectChanges();
    component.openRestoreModal(history[0]);
    fixture.detectChanges();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('restore-title');
  });

  it('describes each diff row in text rather than colour alone', () => {
    fixture.detectChanges();
    component.selectedVersion = history[0];
    component.compareWithCurrent();
    fixture.detectChanges();

    const changed = component.compareRows.find((row) => row.state !== 'same');
    expect(changed).withContext('the fixture should produce at least one difference').toBeTruthy();

    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="cell"] .sr-only'));
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.some((cell) => /Changed line|Added line|Removed line/.test(cell.textContent || ''))).toBeTrue();
  });
});
