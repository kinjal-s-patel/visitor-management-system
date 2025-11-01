import * as React from "react";
import {
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
import { People24Regular, Alert24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';


import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/site-users/web";
import * as moment from "moment";
import styles from "./VisitorDashboard.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useNavigate } from "react-router-dom";


interface IVisitorItem {
  Id: number;
  Title: string;
  name: string;
  email: string;
  contactnumber: string;
  purposeofvisit: string;
  host: { Title: string; EMail: string };
  VisitDate?: string;
  pirposeofvisit: string;
  status?: string;
  Created?: string;
}

export interface IVisitorDashboardProps {
  description: string;
  isDarkTheme: boolean;
  context: WebPartContext;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

const VisitorDashboard: React.FC<IVisitorDashboardProps> = ({ context }) => {
 const [loading, setLoading] = React.useState(true); // start as false
  const [todayVisitors, setTodayVisitors] = React.useState<IVisitorItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<IVisitorItem[]>([]);
  const [checkedIn, setCheckedIn] = React.useState<IVisitorItem[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<IVisitorItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [rejectedVisitors, setRejectedVisitors] = React.useState<IVisitorItem[]>([]);


  const navigate = useNavigate();
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const loadAll = async () => {
    setLoading(true);
    
    setError(null);

    try {
      const todayStart = moment().startOf('day').toISOString();
      const todayEnd = moment().endOf('day').toISOString();

      const visitors = await sp.web.lists
        .getByTitle('visitor-list')
        .items
        .select(
          'name',
          'email',
          'number',
          'purposeofvisit',
          'Department',
          'status',
          'visitdate',
          'Created',
          'hostname/Title'
        )
        .expand('hostname')
        .filter(`visitdate ge datetime'${todayStart}' and visitdate le datetime'${todayEnd}'`)
        .orderBy('Created', false)
        .top(100)();

      const typedVisitors = visitors as IVisitorItem[];

      setTodayVisitors(typedVisitors);
      setPendingApprovals(typedVisitors.filter(v => v?.status === 'pending'));
      setCheckedIn(typedVisitors.filter(v => v?.status === 'Checked-in'));
      setRejectedVisitors(typedVisitors.filter(v => v?.status?.toLowerCase() === 'rejected'));
      setRecentActivity(
  typedVisitors
    .filter(v => ['checked-in', 'pending', 'rejected'].includes(v?.status?.toLowerCase() || ''))
    .slice(0, 10)
);

    } catch (e) {
      console.error(e);
setError(`
  <p>
    Welcome to the Visitor Management System! This solution helps your organization register visitors, manage approvals, and track check-ins and check-outs seamlessly.
  </p>
  <p>
    <strong>Note:</strong> Access to visitor and host data requires an active Microsoft 365 work account within the organization and the necessary SharePoint permissions.
  </p>
  <p>
    If you are unable to view visitor data, please contact our administrator or IT support team to request access or permissions to use this app.
  </p>
  <div style="margin-top: 12px;">
    <a href="mailto:consultant@jmsadvisory.in" style="color:#0078d4;text-decoration:underline;margin-right:16px;">
      Contact Administrator
    </a>
         <a href="mailto:kinjal@jmsadvisory.in?subject=Request%20Access%20to%20Visitor%20Management%20System" 
         style="color:#0078d4;text-decoration:underline;margin-right:16px;">
      Request Access
    </a>
  </div>
`);


    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAll();
  }, [sp]);

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      #SuiteNavWrapper,
      #spSiteHeader,
      #spLeftNav,
      .spAppBar,
      .sp-appBar,
      .sp-appBar-mobile,
      div[data-automation-id="pageCommandBar"],
      div[data-automation-id="pageHeader"],
      div[data-automation-id="pageFooter"] {
        display: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
        background: #fff !important;
      }

      #spPageCanvasContent, .CanvasComponent, .CanvasZone, .CanvasSection, .control-zone {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        max-width: 100vw !important;
      }

      .ms-FocusZone {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Spinner label="Loading dashboard..." size={SpinnerSize.large} />
      </div>
    );
  }

return (
  <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'auto', backgroundColor: '#fff', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
    <div className={styles.visitorDashboard}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.dashboardHeader__left}>
          <h1 className={styles.dashboardHeader__title}>Visitor Management System</h1>
        </div>
        <div className={styles.dashboardHeader__right}>
          <span className={styles.dashboardHeader__userName}>
            Welcome, {context.pageContext.user.displayName}
          </span>
        </div>
      </header>

      {/* Sub Header */}
      <div className={styles.visitorDashboard__header}>
        <div>
          <h1 className={styles.visitorDashboard__title}>Visitor Dashboard</h1>
          <p className={styles.visitorDashboard__subtitle}>
            Overview of today’s visitor activity
          </p>
        </div>
        <div className={styles.visitorDashboard__actions}>
          <button className={styles.btn} onClick={() => navigate("/visitorform")}>
            Add Visitor
          </button>
          <button className={styles.btn} onClick={() => navigate("/visitorlogs")}>
            View Visitor
          </button>
          <button className={styles.btn} onClick={() => navigate("/reports")}>
            Reports
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
  <div
    className={styles.visitorDashboard__error}
    dangerouslySetInnerHTML={{ __html: error }}
  />
)}


      {/* KPIs */}
      <div className={styles.visitorDashboard__kpis}>
        <div className={`${styles.kpiCard} ${styles.kpiCardPlum}`}>
          <div className={styles.kpiCard__icon}>
            <People24Regular />
          </div>
          <div className={styles.kpiCard__content}>
            <h3>Total Visitors Today</h3>
            <p>{todayVisitors.length}</p>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
          <div className={styles.kpiCard__icon}>
            <Alert24Regular />
          </div>
          <div className={styles.kpiCard__content}>
            <h3>Pending Approvals</h3>
            <p>{pendingApprovals.length}</p>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardMint}`}>
          <div className={styles.kpiCard__icon}>
            <CheckmarkCircle24Regular />
          </div>
          <div className={styles.kpiCard__content}>
            <h3>Checked In</h3>
            <p>{checkedIn.length}</p>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardRed}`}>
  <div className={styles.kpiCard__icon}>
    <Alert24Regular />
  </div>
  <div className={styles.kpiCard__content}>
    <h3>Rejected</h3>
    <p>{rejectedVisitors.length}</p>
  </div>
</div>

      </div>

      {/* Activity */}
      <div className={styles.visitorDashboard__activitySection}>
        <div className={styles.activityCard}>
          <h3>Pending Approvals</h3>
          {pendingApprovals.length === 0 ? (
            <p>No pending check-in requests.</p>
          ) : (
            pendingApprovals.map((visitor, index) => (
              <p key={index}>
                {visitor.name} - {visitor.purposeofvisit}
              </p>
            ))
          )}
        </div>

        <div className={styles.activityCard}>
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p>No recent activity today.</p>
          ) : (
            recentActivity.map((visitor, index) => (
              <p key={index}>
                {visitor.name} - {visitor.status}
              </p>
            ))
          )}
        </div>
      </div>

        <footer className={styles.footer}>
          © 2025 Visitor Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default VisitorDashboard;
