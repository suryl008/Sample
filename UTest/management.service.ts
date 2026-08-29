import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppSettings } from "src/app/app-settings";
import { RefDatum } from "src/app/pages/program-administration/models/ref-datum.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ManagementService {
  constructor(private http: HttpClient) {}

  getSubRecipientInfo(data: any): Observable<any> {
    return this.http.post(environment.api_url + "GetSubRecipientInfo", data);
  }

  searchSubRecipientDetails(data: any): Observable<any> {
    return this.http.post(
      environment.api_url + "SearchSubRecipientDetails",
      data
    );
  }

  saveSubRecipientDetails(data: any[]): Observable<any> {
    return this.http.post(
      environment.api_url + "SaveSubRecipientDetails",
      data
    );
  }

  getRefDataInfo(refType: any, refSubType: any): Observable<RefDatum[]> {
    return this.http.get<RefDatum[]>(
      AppSettings.apiURL("GetSubRecRefDataInfo", {
        refType: refType,
        refSubType: refSubType,
      })
    );
  }

  getSubRecAddlInfo(agencyId: number): Observable<any[]> {
    return this.http.get<any[]>(
      AppSettings.apiURL("GetSubRecAddlInfo", {
        agencyId: agencyId,
      })
    );
  }

  getSubRecBldgInfo(parentCd: string): Observable<any[]> {
    return this.http.get<any[]>(
      AppSettings.apiURL("GetSubRecBldgInfo", {
        parentCd: parentCd,
      })
    );
  }

  getSubRecLupInfo(searchStr: string): Observable<any[]> {
    return this.http.get<any[]>(
      AppSettings.apiURL("GetSubRecLupInfo", { searchStr: searchStr })
    );
  }

  deleteSubRecipientData(agencyId: number): Observable<any> {
    return this.http.delete<any>(
      AppSettings.apiURL("DeleteSubRecipientData", { agencyId: agencyId })
    );
  }
}
