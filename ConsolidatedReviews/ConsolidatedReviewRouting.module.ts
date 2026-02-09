import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";
import { ConsolidatedReviewSearchComponent } from "./ConsolidatedReviewSearch/ConsolidatedReviewSearch.component";
import { ConsolidatedReviewDetailsComponent } from "./ConsolidatedReviewDetails/ConsolidatedReviewDetails.component";
import { TAB_CONFIGURATIONS, TabId } from "./consolidated-review-tab-config";

// Generate routes for all tabs dynamically
const tabRoutes: Routes = Object.keys(TAB_CONFIGURATIONS).map((tabId) => {
  const config = TAB_CONFIGURATIONS[tabId as TabId];
  return {
    path: tabId,
    children: [
      {
        path: "",
        redirectTo: "selectVisit",
        pathMatch: "full",
      },
      {
        path: "selectVisit",
        component: ConsolidatedReviewSearchComponent,
        data: {
          tabId: tabId as TabId,
          title: config.title,
          config: config,
        },
      },
      {
        path: "visitDetails",
        component: ConsolidatedReviewDetailsComponent,
        data: {
          tabId: tabId as TabId,
          title: config.title,
          config: config,
        },
      },
    ],
  };
});

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
      ...tabRoutes,
      // Fallback route for unknown tabs
      {
        path: ":tabId",
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
// import { ConsolidatedReviewDetailsComponent } from "./ConsolidatedReviewDetails/ConsolidatedReviewDetails.component";

// const routes: Routes = [
//   {
//     path: "",
//     component: ConsolidatedReviewContainerComponent,
//     children: [
//       {
//         path: "",
//         redirectTo: "excessfundbal/selectVisit",
//         pathMatch: "full",
//       },
//       {
//         path: ":tabId",
//         component: ConsolidatedReviewContainerComponent,
//         children: [
//           {
//             path: "",
//             redirectTo: "selectVisit",
//             pathMatch: "full",
//           },
//           {
//             path: "selectVisit",
//             component: ConsolidatedReviewSearchComponent,
//           },
//           {
//             path: "visitDetails",
//             component: ConsolidatedReviewDetailsComponent,
//           },
//         ],
//       },
//       {
//         path: ":tabId/selectVisit",
//         component: ConsolidatedReviewSearchComponent,
//       },
//       {
//         path: ":tabId/visitDetails",
//         component: ConsolidatedReviewDetailsComponent,
//       },
//     ],
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class ConsolidatedReviewRoutingModule {}
