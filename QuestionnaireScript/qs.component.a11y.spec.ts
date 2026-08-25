import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { QsComponent } from './qs.component';
import { QsService, QuestionnaireScriptModel } from 'src/app/shared/services/qs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MonacoEditorStubComponent } from 'src/testing/editor-stubs';
import { expectNoAccessibilityViolations } from 'src/testing/a11y';

function makeScript(id: number, name: string): QuestionnaireScriptModel {
  return {
    questionnaireScriptId: id,
    questionnaireId: 10,
    scriptName: name,
    scriptDescription: `Description for ${name}`,
    script: 'function validate() {\n  return true;\n}',
    modifiedBy: 42,
    modifyDate: '2026-01-01T10:00:00Z'
  } as QuestionnaireScriptModel;
}

describe('QsComponent accessibility', () => {
  let fixture: ComponentFixture<QsComponent>;
  let component: QsComponent;

  const scripts = [makeScript(1, 'Field validation'), makeScript(2, 'Total calculation')];

  beforeEach(async () => {
    const qsService = jasmine.createSpyObj<QsService>('QsService', [
      'getScriptsByQuestionnaire',
      'saveScript',
      'getApiErrorMessage'
    ]);
    qsService.getScriptsByQuestionnaire.and.returnValue(of(scripts));
    qsService.saveScript.and.returnValue(of(scripts[0]));
    qsService.getApiErrorMessage.and.returnValue('Something went wrong.');

    const sharedService = jasmine.createSpyObj<SharedService>('SharedService', [
      'canMaintainQuestionnaireScripts',
      'getCurrentUserId'
    ]);
    sharedService.canMaintainQuestionnaireScripts.and.returnValue(true);
    sharedService.getCurrentUserId.and.returnValue(42);

    await TestBed.configureTestingModule({
      declarations: [QsComponent, MonacoEditorStubComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: QsService, useValue: qsService },
        { provide: SharedService, useValue: sharedService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QsComponent);
    component = fixture.componentInstance;
    component.selectedQuestionnaire = { id: 10, name: 'Annual Review' };
  });

  it('has no violations in the script list', async () => {
    fixture.detectChanges();
    expect(component.state).toBe('LIST');
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('has no violations when editing a script', async () => {
    fixture.detectChanges();
    component.viewScript(scripts[0], true);
    component.editScript();
    fixture.detectChanges();
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('has no violations while showing validation errors', async () => {
    fixture.detectChanges();
    component.addScript();
    fixture.detectChanges();
    component.save();
    fixture.detectChanges();
    await expectNoAccessibilityViolations(fixture.nativeElement);
  });

  it('exposes the sort direction of the column being sorted', () => {
    fixture.detectChanges();
    component.sortBy('scriptName');
    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('th[aria-sort="ascending"]');
    expect(header).withContext('the sorted column should report its direction').toBeTruthy();
    expect(header.querySelector('button')).withContext('sorting must be keyboard operable').toBeTruthy();
  });

  it('gives the code editor an accessible name', () => {
    fixture.detectChanges();
    component.viewScript(scripts[0], true);
    fixture.detectChanges();

    const editorGroup: HTMLElement = fixture.nativeElement.querySelector('[role="group"][aria-labelledby="scriptEditorLabel"]');
    expect(editorGroup).withContext('the editor needs a programmatic label').toBeTruthy();
    expect(component.monacoOptions['ariaLabel']).toBe('Questionnaire script editor');
  });
});
