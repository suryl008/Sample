import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HttpHeaderInterceptorService implements HttpInterceptor {
    constructor() {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const apiKey = (environment as { api_key?: string }).api_key || "";
        const user = this.readStoredUser();
        const headers: Record<string, string> = {
            'Access-Control-Allow-Origin': '*',
            Accept: 'text/plain',
            'My-Apikey': apiKey
        };

        if (user?.userId) {
            headers['X-User-Id'] = String(user.userId);
        }
        if (user?.userRole) {
            headers['X-User-Role'] = String(user.userRole);
        }

        req = req.clone({
            setHeaders: headers,
            withCredentials: true
        });

        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }),
            catchError((err: any) => {
                if (err instanceof HttpErrorResponse && err.status >= 400) {
                    console.error(JSON.stringify(err), 'Thrown Exception on Http Error');
                }
                return throwError(() => err);
            }));
    }

    private readStoredUser(): { userId?: number; userRole?: string } | null {
        try {
            const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Unable to read stored user details for request headers.", error);
            return null;
        }
    }
}
