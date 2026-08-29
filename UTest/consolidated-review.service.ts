import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { AppSettings } from "src/app/app-settings";
import { getConfiguredGrantPgms } from "src/app/pages/ConsolidatedReviews/consolidated-review-tab-config";
import { RefDatum } from "src/app/pages/program-administration/models/ref-datum.model";
import { environment } from "src/environments/environment";

export interface ConsPgmIdLookup {
  grantPgm: string;
  grantPgmId: number;
  roundNo: number;
}

@Injectable({
  providedIn: "root",
})
export class ConsolidatedReviewService {    
  
  private pgmIdMap = new Map<string, number>();
  private pgmIdLoad$: Observable<Map<string, number>> | null = null;

  constructor(private http: HttpClient) {}

  ensurePgmIdMap(): Observable<Map<string, number>> {
    if (this.pgmIdLoad$) {
      return this.pgmIdLoad$;
    }

    const grantPgms = getConfiguredGrantPgms();
    if (grantPgms.length === 0) {
      this.pgmIdMap.clear();
      this.pgmIdLoad$ = of(this.pgmIdMap);
      return this.pgmIdLoad$;
    }

    this.pgmIdLoad$ = this.http
      .get<ConsPgmIdLookup[]>(
        AppSettings.apiURL("GetConsPgmIdLookup", {
          grantPgms: grantPgms.join(","),
        }),
      )
      .pipe(
        map((rows) => {
          this.pgmIdMap.clear();
          (rows || []).forEach((row: any) => {
            const grantPgm = row?.grantPgm || row?.GrantPgm;
            const grantPgmId = row?.grantPgmId || row?.GrantPgmId;
            if (grantPgm && grantPgmId > 0) {
              this.pgmIdMap.set(String(grantPgm).trim().toUpperCase(), Number(grantPgmId));
            }
          });
          return this.pgmIdMap;
        }),
        tap({
          error: () => {
            this.pgmIdLoad$ = null;
          },
        }),
        shareReplay(1),
      );

    return this.pgmIdLoad$;
  }

  getGrantPgmId(grantPgm?: string | null): number | null {
    if (!grantPgm?.trim()) {
      return null;
    }
    return this.pgmIdMap.get(grantPgm.trim().toUpperCase()) ?? null;
  }

  getConsolidatedReviews(payload: any): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsolidatedReviews", {
        pgmId: payload?.grantPgmId,
        rvwType: payload?.rvwType,
        agencyId: payload?.agencyId,
      }),
    );
  }

  getRvwAgyLup(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetRvwAgyLup", data);
  }

  getConsolReviewCharteringAgency(data: any): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsolReviewCharteringAgency", data),
    );
  }

  getConsReviewTeam(subRvwId: number, recType: string): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsReviewTeam", {
        subRvwId: subRvwId,
        recType: recType,
      }),
    );
  }

  getConsPreSelectionRoleInfo(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "GetConsPreSelectionRoleInfo",
      data,
    );
  }

  getConsSchedulingDocInfo(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "GetConsSchedulingDocInfo",
      data,
    );
  }

  getConsRvwDocInfo(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetConsRvwDocInfo", data);
  }

  getConsPgmRoleTypeLup(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetConsPgmRoleTypeLup", data);
  }

  getConsAssignSchedUsersLup(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "GetConsAssignSchedUsersLup",
      data,
    );
  }

  getConsAgyUserLup(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetConsAgyUserLup", data);
  }

  getConsSubRecipientRvwStatus(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "GetConsSubRecipientRvwStatus",
      data,
    );
  }

  getConsReviewerOverallComment(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "GetConsSubRecipientRvwStatus",
      data,
    );
  }

  getConsSubRecInfoAuto(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetConsSubRecInfoAuto", data);
  }

  getConsEmailLogInfo(logId: number): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsEmailLogInfo", {
        logId: logId,
      }),
    );
  }

  viewSchedDocFile(fileName: string): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("ViewSchedDocFile", {
        fileName: fileName,
      }),
    );
  }

  getConsReviewStageHistory(subRvwId: number): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsReviewStageHistory", {
        subRvwId: subRvwId,
      }),
    );
  }

  getConsNextStageStatus(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetConsNextStageStatus", data);
  }

  getConsReviewEmailData(subRvwId: number): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsReviewEmailData", {
        subRvwId: subRvwId,
      }),
    );
  }

  getConsRefDataInfo(refType: any, refSubType: any): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetConsRefDataInfo", {
        refType: refType,
        refSubType: refSubType,
      }),
    );
  }

  getWorkflowCd(pgmId: number, refType: any): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetWorkflowCd", {
        pgmId: pgmId,
        refType: refType,
      }),
    );
  }

  getConsMiscData(subRvwId: number): Observable<any> {
    return this.http.get<any>(
      AppSettings.apiURL("GetConsMiscData", {
        subRvwId: subRvwId,
      }),
    );
  }

  getProgramMgmtInfo(data: any): Observable<any> {
    return this.http.post(environment.api_url + "ProgramMgmtInfo", data);
  }

  addConsolidatedReview(data: any): Observable<any> {
    return this.http.post(environment.api_url + "AddConsolidatedReview", data);
  }

  saveAdditionalDocument(data: any): Observable<any> {
    return this.http.post(environment.api_url + "ProgramMgmtInfo", data);
  }

  saveSupportComment(data: any): Observable<any> {
    return this.http.post(environment.api_url + "ProgramMgmtInfo", data);
  }

  getProgramReviewTypeInfo(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetProgramReviewTypeInfo", data);
  }

  getNavigationID(payload: { userID: any; targetKey: string; xmlStr: string; }): any {
    return this.http.post(environment.api_url + "GetNavigationID", payload);
  }

  questionnaireResponseBySubReviewAndDocListId(data: { subRvwId: any; doclistid: any; }) {
    return this.http.post(environment.api_url + "QuestionnaireResponseBySubReviewAndDocListId", data);
  }
}
