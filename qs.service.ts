import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { AppSettings } from "src/app/app-settings";

export interface QuestionnaireScriptModel {
  questionnaireScriptId: number;
  questionnaireId: number;
  scriptName?: string;
  scriptDescription?: string;
  script: string;
  changeNote?: string;
  currentUserId?: number;
  createdBy?: number;
  createDate?: string;
  modifiedBy?: number;
  modifyDate?: string;
}

export interface QuestionnaireModel {
  id: number;
  name: string;
  questionnaireId?: number;
  questionnaireCode?: string;
  recordStatus?: string | null;
  itemName?: string;
}

export interface QuestionnaireScriptHistoryModel {
  questionnaireScriptHistoryId: number;
  questionnaireScriptId: number;
  questionnaireId?: number;
  versionNumber: number;
  scriptName: string;
  scriptDescription?: string;
  script?: string;
  actionType: string;
  changedBy: number;
  changeDate: Date | string;
  changeNote?: string;
  restoredFromVersionNumber?: number;
}

export interface RestoreScriptRequest {
  questionnaireScriptId: number;
  sourceVersionNumber: number;
  currentUserId: number;
  changeNote: string;
}

@Injectable({
  providedIn: "root",
})
export class QsService {
  private http = inject(HttpClient);

  private normalizeScript(raw: any): QuestionnaireScriptModel {
    return {
      questionnaireScriptId: Number(raw?.questionnaireScriptId ?? raw?.QuestionnaireScriptId ?? 0),
      questionnaireId: Number(raw?.questionnaireId ?? raw?.QuestionnaireId ?? 0),
      scriptName: raw?.scriptName ?? raw?.ScriptName ?? undefined,
      scriptDescription: raw?.scriptDescription ?? raw?.ScriptDescription ?? undefined,
      script: raw?.script ?? raw?.Script ?? "",
      changeNote: raw?.changeNote ?? raw?.ChangeNote ?? undefined,
      createdBy: raw?.createdBy ?? raw?.CreatedBy ?? undefined,
      createDate: raw?.createDate ?? raw?.CreateDate ?? undefined,
      modifiedBy: raw?.modifiedBy ?? raw?.ModifiedBy ?? undefined,
      modifyDate: raw?.modifyDate ?? raw?.ModifyDate ?? undefined,
    };
  }

  private normalizeHistory(raw: any): QuestionnaireScriptHistoryModel {
    return {
      questionnaireScriptHistoryId: Number(raw?.questionnaireScriptHistoryId ?? raw?.QuestionnaireScriptHistoryId ?? 0),
      questionnaireScriptId: Number(raw?.questionnaireScriptId ?? raw?.QuestionnaireScriptId ?? 0),
      questionnaireId: raw?.questionnaireId ?? raw?.QuestionnaireId ?? undefined,
      versionNumber: Number(raw?.versionNumber ?? raw?.VersionNumber ?? 0),
      scriptName: raw?.scriptName ?? raw?.ScriptName ?? "",
      scriptDescription: raw?.scriptDescription ?? raw?.ScriptDescription ?? undefined,
      script: raw?.script ?? raw?.Script ?? "",
      actionType: raw?.actionType ?? raw?.ActionType ?? "",
      changedBy: Number(raw?.changedBy ?? raw?.ChangedBy ?? 0),
      changeDate: raw?.changeDate ?? raw?.ChangeDate ?? new Date(),
      changeNote: raw?.changeNote ?? raw?.ChangeNote ?? undefined,
      restoredFromVersionNumber: raw?.restoredFromVersionNumber ?? raw?.RestoredFromVersionNumber ?? undefined,
    };
  }

  getApiErrorMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;
    return (
      httpError?.error?.message ||
      httpError?.error?.Message ||
      httpError?.message ||
      fallback
    );
  }

  getScriptsByQuestionnaire(questionnaireId: number): Observable<QuestionnaireScriptModel[]> {
    return this.http.get<any>(
      AppSettings.apiURL("GetScriptsByQuestionnaire", { questionnaireId }),
    ).pipe(
      map((payload) => {
        const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
        return list.map((item: any) => this.normalizeScript(item));
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getScriptById(scriptId: number): Observable<QuestionnaireScriptModel> {
    return this.http.get<any>(
      AppSettings.apiURL("GetScriptById", { scriptId }),
    ).pipe(map((response) => this.normalizeScript(response)));
  }

  saveScript(data: QuestionnaireScriptModel): Observable<any> {
    return this.http.post(AppSettings.apiURL("SaveQuestionnaireScript"), data);
  }

  getHistoryList(scriptId: number): Observable<QuestionnaireScriptHistoryModel[]> {
    return this.http.get<any>(
      AppSettings.apiURL("GetHistoryList", { scriptId }),
    ).pipe(
      map((payload) => {
        const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
        return list.map((item: any) => this.normalizeHistory(item));
      })
    );
  }

  getHistoryVersion(scriptId: number, historyId: number): Observable<QuestionnaireScriptHistoryModel> {
    return this.http.get<any>(
      AppSettings.apiURL("GetHistoryVersion", { scriptId, historyId }),
    ).pipe(map((response) => this.normalizeHistory(response)));
  }

  restoreVersion(request: RestoreScriptRequest): Observable<any> {
    return this.http.post(AppSettings.apiURL("RestoreVersion"), request);
  }

  getQuestionnaireLookup(term = ""): Observable<QuestionnaireModel[]> {
    const liveLookup$ = this.http.get<any>(
      AppSettings.apiURL("GetAllQuestionnaireLookup", { questionnaire: term || "" }),
    ).pipe(
      map((payload) => {
        const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
        return list.map((item: any) => this.normalizeLookup(item));
      }),
      catchError(() => of([] as QuestionnaireModel[]))
    );

    const catalogLookup$ = this.http.get<any>("assets/api-data/GetAllQuestionnaireLookup.json").pipe(
      map((payload) => {
        const list = Array.isArray(payload) ? payload : [];
        return list.map((item: any) => this.normalizeLookup(item));
      }),
      catchError(() => of([] as QuestionnaireModel[]))
    );

    return catalogLookup$.pipe(
      switchMap((catalog) =>
        liveLookup$.pipe(
          map((live) => this.mergeLookups(catalog, live, term)),
          startWith(this.mergeLookups(catalog, [], term))
        )
      )
    );
  }

  private mergeLookups(catalog: QuestionnaireModel[], live: QuestionnaireModel[], term: string): QuestionnaireModel[] {
    const merged = new Map<number, QuestionnaireModel>();
    [...catalog, ...live].forEach((item) => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });
    const search = (term || "").trim().toLowerCase();
    const rows = Array.from(merged.values()).sort((left, right) =>
      (left.name || "").localeCompare(right.name || "")
    );
    if (!search) {
      return rows;
    }
    return rows.filter((item) =>
      (item.name || "").toLowerCase().includes(search)
      || (item.questionnaireCode || "").toLowerCase().includes(search)
      || String(item.id).includes(search)
    );
  }

  private normalizeLookup(raw: any): QuestionnaireModel {
    const id = Number(raw?.id ?? raw?.questionnaireId ?? raw?.QuestionnaireId ?? 0);
    const name = raw?.name ?? raw?.itemName ?? raw?.questionnaireName ?? raw?.Name ?? (id ? `Questionnaire ${id}` : "");
    return {
      id,
      questionnaireId: id,
      name,
      itemName: name,
      questionnaireCode: raw?.questionnaireCode ?? raw?.QuestionnaireCode ?? (id ? `Q-${id}` : undefined),
      recordStatus: raw?.recordStatus ?? raw?.RecordStatus ?? null
    };
  }

  searchQuestionnaries(questionnaireId: number): Observable<any[]> {
    return this.http.get<any[]>(AppSettings.apiURL('SearchQuestionnaries', { questionnaireId: questionnaireId || 0 }));
  }

  getQuestionnaireMgmtDownloadData(questionnaireCode: string): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL('GetQuestionnaireMgmtDownloadData', { questionnaireCode })
    );
  }
}
