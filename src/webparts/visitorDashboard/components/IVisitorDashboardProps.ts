import { NavigateFunction } from "react-router/dist/lib/hooks";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IVisitorDashboardProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
 navigateto: NavigateFunction;

}
