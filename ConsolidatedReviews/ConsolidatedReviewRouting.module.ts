// ConsolidatedReviewRouting.module.ts
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";
import { ConsolidatedReviewSearchComponent } from "./ConsolidatedReviewSearch/ConsolidatedReviewSearch.component";
import { ConsolidatedReviewDetailsComponent } from "./ConsolidatedReviewDetails/ConsolidatedReviewDetails.component";

const routes: Routes = [
  {
    path: "",
    component: ConsolidatedReviewContainerComponent,
    children: [
      {
        path: "",
        redirectTo: "excessfundbal/selectVisit",
        pathMatch: "full",
      },
      {
        path: ":tabId",
        component: ConsolidatedReviewContainerComponent,
        children: [
          {
            path: "",
            redirectTo: "selectVisit",
            pathMatch: "full",
          },
          {
            path: "selectVisit",
            component: ConsolidatedReviewSearchComponent,
          },
          {
            path: "visitDetails",
            component: ConsolidatedReviewDetailsComponent,
          },
        ],
      },
      {
        path: ":tabId/selectVisit",
        component: ConsolidatedReviewSearchComponent,
      },
      {
        path: ":tabId/visitDetails",
        component: ConsolidatedReviewDetailsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsolidatedReviewRoutingModule {}

// import { NgModule } from "@angular/core";
// import { RouterModule, Routes } from "@angular/router";
// import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";
// import { ConsolidatedReviewSearchComponent } from "./ConsolidatedReviewSearch/ConsolidatedReviewSearch.component";

// const routes: Routes = [
//   {
//     path: "",
//     component: ConsolidatedReviewContainerComponent,
//     children: [
//       {
//         path: "",
//         redirectTo: "excessfundbal",
//         pathMatch: "full",
//       },
//       {
//         path: ":tabId",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "excessfundbal",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "ltclaimexcep",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "contrpage",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "10cent",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "cnpcontr",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "clswallinv",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "psacontrrvw",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "31n6beyondhir",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "privschconsult",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: "falseel",
//         component: ConsolidatedReviewSearchComponent,
//       },
//     ],
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class ConsolidatedReviewRoutingModule {}

// // import { NgModule } from "@angular/core";
// // import { RouterModule, Routes } from "@angular/router";
// // import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";

// // const routes: Routes = [
// //   {
// //     path: "",
// //     component: ConsolidatedReviewContainerComponent,
// //     children: [
// //       {
// //         path: "excessfundbal",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "ltclaimexcep",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "contrpage",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "10cent",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "cnpcontr",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "clswallinv",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "psacontrrvw",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "31n6beyondhir",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "privschconsult",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //       {
// //         path: "falseel",
// //         component: ConsolidatedReviewContainerComponent,
// //       },
// //     ],
// //   },
// // ];

// // @NgModule({
// //   imports: [RouterModule.forChild(routes)],
// //   exports: [RouterModule],
// // })
// // export class ConsolidatedReviewRoutingModule {}
