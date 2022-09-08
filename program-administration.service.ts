import { PgmMiscFld } from "./../../pages/program-administration/models/pgm-misc-fld.model";
import { PgmRvwInfo } from "./../../pages/program-administration/models/pgm-rvw-info.model";
import { UserInfo } from "./../../pages/program-administration/models/user-info.model";
import { RefDatum } from "./../../pages/program-administration/models/ref-datum.model";
import { WfConfig } from "./../../pages/program-administration/models/wf-config";
import { AppSettings } from "./../../app-settings";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  map,
  Observable,
  Subject,
  throwError,
} from "rxjs";
import { PgmInfo } from "src/app/pages/program-administration/models/pgm-info.model";
import { AgencyOffInfo } from "src/app/pages/program-administration/models/agency-off-info.model";
import { RvwType } from "src/app/pages/program-administration/models/rvw-type.model";
import { EmailTemplate } from "src/app/pages/program-administration/models/email-template.model";
import { RvwTypeMetaData } from "src/app/pages/program-administration/models/rvw-type-metadata.model";
import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "src/app/pages/program-administration/models/rvwtype-complianceplan-reminder-schedule.model";
import { ReviewDocumentList } from "src/app/pages/program-administration/models/review-document-list.model";
import { FormMaster } from "src/app/pages/program-administration/models/form-master-model";
import { FlexFormPdftemplate } from "src/app/pages/program-administration/models/flex-form-pdf-template.model";
import { Questionnaire } from "src/app/pages/program-administration/models/questionnaire.model";
import { SearchDocumentList } from "src/app/pages/program-administration/models/search-document-list.model";
import { SearchDocumentListParms } from "src/app/pages/program-administration/models/Search-document-list-parms.model";
import { CitFindArc } from "src/app/pages/program-administration/models/cit-find-arc.model";
//import { PlanRemainder } from "src/app/pages/program-administration/models/PlanRemainser.model";
@Injectable({
  providedIn: "root",
})
export class ProgramAdministrationService {
  selectedPgmId: any;

  isNewProgram: boolean = true;
  program$ = new BehaviorSubject<any>(null);
  selectedProgram$ = this.program$.asObservable();
  customReviewType$: Observable<any>;
  customReviewType = new Subject<any>();

  customDocumentList$: Observable<any>;
  customDocumentList = new Subject<any>();
  customFindings$: Observable<any>;
  customFindings = new Subject<any>();
  customFindingsRules$: Observable<any>;
  customFindingsRules = new Subject<any>();
  customStageRoles$: Observable<any>;
  customStageRoles = new Subject<any>();

  constructor(private http: HttpClient) {
    this.customReviewType$ = this.customReviewType.asObservable();
    this.customDocumentList$ = this.customDocumentList.asObservable();
    this.customFindings$ = this.customFindings.asObservable();
    this.customFindingsRules$ = this.customFindingsRules.asObservable();
    this.customStageRoles$ = this.customStageRoles.asObservable();
  }
  private _selectedProgramId: string;
  private _selectedReviewTypeId: string;
  private _reviewType: string;

  get selectedProgramId() {
    return this._selectedProgramId;
  }

  set selectedProgramId(newValue: any) {
    this._selectedProgramId = newValue;
  }

  get selectedReviewTypeId() {
    return this._selectedReviewTypeId;
  }

  set selectedReviewTypeId(newValue: any) {
    this._selectedReviewTypeId = newValue;
  }

  get reviewType() {
    return this._reviewType;
  }

  set reviewType(newValue: any) {
    this._reviewType = newValue;
  }
  setProgram(program: any) {
    if (program && program.grantPgm) {
      this.program$.next(program);
      this.isNewProgram = false;
    }
  }
  getPlanRemainder(): Observable<
    RvwTypeCompliancePlanSubmissionReminderSchedule[]
  > {
    return this.http.get<RvwTypeCompliancePlanSubmissionReminderSchedule[]>(
      AppSettings.apiURL("GetAllOffInfo")
    );
  }

  getAllPgmSearchLookup(programName: string): Observable<PgmInfo[]> {
    return this.http.get<PgmInfo[]>(
      AppSettings.apiURL("GetAllPgmSearchLookup", { programName: programName })
    );
  }

  getProgramInfoById(pgId: any): Observable<PgmInfo> {
    return this.http.get<PgmInfo>(
      AppSettings.apiURL("GetRvwTypesByPgmId", { progamId: pgId })
    );
  }

  getProgramOfficeList(): Observable<AgencyOffInfo[]> {
    return this.http.get<AgencyOffInfo[]>(AppSettings.apiURL("GetAllOffInfo"));
  }

  getReviewType(prgId: any): Observable<RvwType[]> {
    return this.http.get<RvwType[]>(AppSettings.apiURL("GetAllRvwTypes"));
  }

  getPermUserInfo(pgId: any): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(
      AppSettings.apiURL("GetAssignedOffUsersByPgmId", { pgmId: pgId })
    );
  }

  getUnassignedUserByPgId(
    pgmId: any,
    offCd: any,
    recType: any
  ): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(
      AppSettings.apiURL("GetUnAssignedOffUsers", {
        pgmId: pgmId,
        offCd: offCd,
        recType: recType,
      })
    );
  }

  getRefDataByRefType(refType: any, refSubType: any): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetRefDataByRefTypeAllowRoles", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getAreaOfResponsibility(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("AreaOfResponsibility", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getConsolReviewResponsbility(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("ConsolReviewResponsbility", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getCitationCategory(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetCitationCategory", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getFindingCategory(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetFindingCategory", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  
  getARC(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetARC", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }


  getWorkFlow(): Observable<WfConfig[]> {
    return this.http.get<WfConfig[]>(AppSettings.apiURL("GetAllWFConfig"));
  }

  getEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(AppSettings.apiURL("EmailTemplates"));
  }

  getAllContactTypeLookup(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("ConsolReviewResponsbility", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getAllFileTypesInfo(refType: any, refSubType: any): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetRefDataFileTypesInfo", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  // programInfoSave(data: PgmInfo): Observable<PgmInfo> {
  //   return this.http.post<PgmInfo>(AppSettings.apiURL("SaveProgram"), data);
  // }

  programInfoSave(data: PgmInfo): Observable<any> {
    return this.http.post("https://localhost:7057/SavePgmInfo", data);
  }

  programReviewInfoSave(data: PgmRvwInfo): Observable<any> {
    return this.http.post("https://localhost:7057/SavePgmRvwInfo", data);
  }

  ReviewMetaDataSave(data: PgmMiscFld[]): Observable<any> {
    return this.http.post("https://localhost:7057/SaveReviewMetadata", data);
  }

  GetRefDataDocumentCategory(
    refType: any,
    refSubType: any
  ): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetRefDataDocumentCategory", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  GetReviewTypeMetaDataByProgramId(
    pgmId: any,
    rvwType: any
  ): Observable<RvwTypeMetaData[]> {
    return this.http.get<RvwTypeMetaData[]>(
      AppSettings.apiURL("MyMetadata", {
        pgmId: pgmId,
        rvwType: rvwType,
      })
    );
  }

  GetCompliancePlanInfo(
    scheduleId: any,
    rvwId: any
  ): Observable<RvwTypeCompliancePlanSubmissionReminderSchedule[]> {
    return this.http.get<RvwTypeCompliancePlanSubmissionReminderSchedule[]>(
      AppSettings.apiURL("ReviewCompliancePlanReminder", {
        scheduleId: scheduleId,
        rvwId: rvwId,
      })
    );
  }

  GetDocumentNameLookup(
    pgmId: any,
    rvwType: any
  ): Observable<ReviewDocumentList[]> {
    return this.http.get<ReviewDocumentList[]>(
      AppSettings.apiURL("GetRvwDocumentNameLookup", {
        pgmId: pgmId,
        rvwType: rvwType,
      })
    );
  }

  GetFormMasterLookup(pgmId: any, formRule: any): Observable<FormMaster[]> {
    return this.http.get<FormMaster[]>(
      AppSettings.apiURL("GetFormMasterLookup", {
        pgmId: pgmId,
        formRule: formRule,
      })
    );
  }

  GetFlexFormPdftemplateLookup(
    pgmId: any,
    rvwType: any,
    offCd: any,
    flexForm: any
  ): Observable<FlexFormPdftemplate[]> {
    return this.http.get<FlexFormPdftemplate[]>(
      AppSettings.apiURL("GetFlexFormPdftemplateLookup", {
        pgmId: pgmId,
        rvwType: rvwType,
        offCd: offCd,
        flexForm: flexForm,
      })
    );
  }

  GetAllQuestionnaireLookup(
    questionnaire: string
  ): Observable<Questionnaire[]> {
    return this.http.get<Questionnaire[]>(
      AppSettings.apiURL("GetAllQuestionnaireLookup", {
        questionnaire: questionnaire,
      })
    );
  }

  getCitationLookup(
    questionnaire: string
  ): Observable<CitFindArc[]> {
    return this.http.get<CitFindArc[]>(
      AppSettings.apiURL("GetCitationLookup", {
        questionnaire: questionnaire,
      })
    );
  }

  getFindingLookup(
    questionnaire: string
  ): Observable<CitFindArc[]> {
    return this.http.get<CitFindArc[]>(
      AppSettings.apiURL("GetFindingLookup", {
        questionnaire: questionnaire,
      })
    );
  }

  getFindingResult(
    questionnaire: string
  ): Observable<CitFindArc[]> {
    return this.http.get<CitFindArc[]>(
      AppSettings.apiURL("GetFindingResult", {
        questionnaire: questionnaire,
      })
    );
  }
  getAllUsersList(offCd: any): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(
      AppSettings.apiURL("AllUsersInfo", {
        offCd: offCd,
      })
    );
  }

  setCustomReviewType(customReview: boolean) {
    this.customReviewType.next(customReview);
  }

  setCustomDocumentList(customDocument: boolean) {
    this.customDocumentList.next(customDocument);
  }

  setCustomFindings(CustomFindings: boolean) {
    this.customFindings.next(CustomFindings);
  }

  setCustomFindingsRule(customFindingsRule: boolean) {
    this.customFindingsRules.next(customFindingsRule);
  }

  setCustomStageRole(customStageRole: boolean) {
    this.customStageRoles.next(customStageRole);
  }

  getUsers(): Observable<RvwTypeMetaData[]> {
    return this.http
      .get(AppSettings.apiURL("MyMetadata"))
      .pipe<RvwTypeMetaData[]>(map((data: any) => data.users));
  }

  deleteUser(id: number): Observable<RvwTypeMetaData> {
    return this.http.delete<RvwTypeMetaData>(
      `${AppSettings.MockApiServiceURL}users/${id}`
    );
  }

  deleteUsers(users: RvwTypeMetaData[]): Observable<RvwTypeMetaData[]> {
    return forkJoin(
      users.map((user) =>
        this.http.delete<RvwTypeMetaData>(
          `${AppSettings.MockApiServiceURL}users/${user.pgmMiscFldsId}`
        )
      )
    );
  }

  updateUser(user: RvwTypeMetaData): Observable<RvwTypeMetaData> {
    return this.http.patch<RvwTypeMetaData>(
      `${AppSettings.MockApiServiceURL}users/${user.pgmMiscFldsId}`,
      user
    );
  }

  addUser(user: RvwTypeMetaData): Observable<RvwTypeMetaData> {
    return this.http.post<RvwTypeMetaData>(
      `${AppSettings.MockApiServiceURL}users/add`,
      user
    );
  }

  getDocumentListInfoByListId(
    docListId: any
  ): Observable<SearchDocumentList[]> {
    return this.http.get<SearchDocumentList[]>(
      AppSettings.apiURL("DocumentListInfoByListId", {
        docListId: docListId,
      })
    );
  }

  GetDocumentListSearchInfo(
    searchParms: SearchDocumentListParms
  ): Observable<any> {
    return this.http.post(
      "https://localhost:7057/SearchDocumentList",
      searchParms
    );
  }

  rvwDocumentListInfoSave(data: ReviewDocumentList): Observable<any> {
    return this.http.post(
      "https://localhost:7057/SaveReviewDocumentList",
      data
    );
  }
}
