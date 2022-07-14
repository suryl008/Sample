import {environment} from "../environments/environment";

export class AppSettings {

  public static MockApiServiceURL = 'https://dummyjson.com/';

  public static DEFAULT_REVIEW_TYPE = 'DRT';

  public static toggleClass(ele: any, className: string): any {
    ele.classList.toggle(className);
  }

  public static removeClass(ele: any, className: string): any {
    ele.classList.remove(className);
  }

  public static addClass(ele: any, className: string): any {
    ele.classList.add(className);
  }

  public static eleByClass(className: string): any {
    return document.querySelector(className);
  }

  public static apiURL(route: any, params: any = null): string {
    let routeParams: any = '', routeKey = route as keyof typeof environment.api_route;
    if (environment.realAPI && params) {
      Object.keys(params).forEach(key => {
        routeParams += `${key}=${params[key]}&`;
      });
      routeParams = '?' + routeParams.substring(0, routeParams.length - 1);
    }
    return environment.api_url + environment.api_route[routeKey] + routeParams;
  }
}
