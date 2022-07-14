import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  timerVal: any;
  display: any;

  constructor(private toastrService: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.timer(60);
  }
  // startCountdown(seconds:any) {
  //   let counter = seconds;
  //   const interval = setInterval(() => {
  //     this.timerVal = counter;
  //     counter--;

  //     if (counter < 0) {
  //       clearInterval(interval);
  //       this.toastrService.warning('Your session is expired, Please login again!', 'Session Expired');
  //       this.router.navigate(['/program/info']);
  //     }
  //   }, 1000);
  // }

  timer(minute: any) {
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;

      this.timerVal = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;

      if (seconds == 0) {
        clearInterval(timer);
        this.toastrService.error(
          "Your session is expired, Please login again!",
          "Session Expired"
        );
        this.router.navigate(["/dashboard"]);
      }
    }, 1000);
  }
}
