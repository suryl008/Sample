import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";
import { TAB_CONFIGURATIONS, TabId } from "./consolidated-review-tab-config";

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
        children: [],
        data: {
          tabId: tabId as TabId,
          title: config.title,
          page: "selectVisit",
        },
      },
      {
        path: "visitDetails",
        children: [],
        data: {
          tabId: tabId as TabId,
          title: config.title,
          page: "visitDetails",
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
            children: [],
          },
          {
            path: "visitDetails",
            children: [],
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
