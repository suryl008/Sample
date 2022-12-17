import { HttpParams } from "@angular/common/http";
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: "app-authentication",
    templateUrl: './Authentication.component.html',
    styleUrls: ['./Authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
    private paramsObject: any;
    public tempRoute: string;

    @HostListener('window:beforeunload', ['$event'])
    destroy() {
        // sessionStorage.clear();
    }

    constructor(private router: Router, private activatedRoute: ActivatedRoute, location: Location, tempRoute: Router) {
    }

    async ngOnInit() {
        this.tempRoute = '';
        await this.router.events?.subscribe((val) => {
            this.tempRoute = location.pathname.slice(1);
        });
        this.tempRoute = this.tempRoute ? this.tempRoute : '';
        let url = window.location.href;
        if (url && url.indexOf("authGUID") != -1) {
            this.onLogin();
        }
        else {
            let isRegisteredUser = localStorage.getItem("isRegisteredUser");
            if (isRegisteredUser === 'true') {
                this.router.navigate([this.tempRoute])
            }else{
                this.router.navigate(['autherror']);
            }
        }
    }

    async onLogin() {
        let url = window.location.href;
        if (url.includes("?")) {
            const httpParams = new HttpParams({ fromString: url.split('?')[1] });
            const authGUID = httpParams.get("authGUID");
            let res = {
                data: {
                    isRegisteredUser: true,
                    authId : 'EAEAE-GREDFG6464-45464-HIHI',
                },
                error: 'Data Not Available',
                statusCode: 200
            }
            let response = res.data;
            if (response.isRegisteredUser) {
                this.router.navigate(['usersecurity']);
                sessionStorage.setItem('isRegisteredUser', response.isRegisteredUser === true ? 'true' : 'false');
                localStorage.setItem('isRegisteredUser', response.isRegisteredUser === true ? 'true' : 'false');
                sessionStorage.setItem('userAuthGUID', response.authId);
                localStorage.setItem('userAuthGUID', response.authId);
            } else {
                this.router.navigate(['autherror']);
            }
        }
        else {
            let isRegisteredUser = localStorage.getItem("isRegisteredUser");
            if (isRegisteredUser === 'true') {
                this.router.navigate([this.tempRoute])
            }else{
                this.router.navigate(['autherror']);
            }
        }
    }

}
