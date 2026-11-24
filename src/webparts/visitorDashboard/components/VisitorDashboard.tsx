import * as React from "react";
import {
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
import {
  People24Regular,
  Alert24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
} from '@fluentui/react-icons';

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/site-users/web";
import moment from "moment";
import styles from "./VisitorDashboard.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useNavigate } from "react-router-dom";
import SharedSidebar, { IAppLayoutProps } from './SharedSidebar';


interface IVisitorItem {
  Id: number;
  Title: string;
  name: string;
  email: string;
  contactnumber: string;
  purposeofvisit: string;
  host: string;
  VisitDate?: string;
  pirposeofvisit: string;
  status?: string;
  Created?: string;
}

export interface IVisitorDashboardProps extends IAppLayoutProps {
  description: string;
  isDarkTheme: boolean;
  context: WebPartContext;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

// ---------- UI-only helpers (no business logic) ---------- //
const getInitial = (text?: string): string =>
  (text || '?').trim().charAt(0).toUpperCase();

const getStatusClass = (status?: string): string => {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return styles.statusPending;
  if (s === 'checked-in') return styles.statusCheckedin;
  if (s === 'rejected') return styles.statusRejected;
  return '';
};

const getDotClass = (status?: string): string => {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return styles.dotPending;
  if (s === 'checked-in') return styles.dotChecked;
  if (s === 'rejected') return styles.dotRejected;
  return '';
};

const VisitorDashboard: React.FC<IVisitorDashboardProps> = ({
  context,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const [loading, setLoading] = React.useState(true);
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
          'host',
          'Department',
          'status',
          'visitdate',
          'Created',
        )
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
          .filter(v => ['checked-in', 'pending', 'rejected'].indexOf(v?.status?.toLowerCase() || '') !== -1)
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

  // Presentational values derived from existing state
  const userName = context.pageContext.user.displayName;
  const total = todayVisitors.length;
  const pct = (n: number): string => (total > 0 ? `${(n / total) * 100}%` : '0%');

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#f3f6f9', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
        <SharedSidebar
          activePage="dashboard"
          userName={userName}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
        />

        {/* ============ MAIN ============ */}
        <main className={styles.main}>

          {/* Top bar */}
          <div className={styles.topbar}>
            <div>
              <h1 className={styles.pageTitle}>Visitor Dashboard</h1>
              <p className={styles.pageDate}>
                Overview of today’s visitor activity · {moment().format('dddd, D MMMM YYYY')}
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => navigate("/visitorform")}>
              + Add Visitor
            </button>
          </div>

          <div className={styles.content}>

            {/* Welcome banner */}
            <section className={styles.banner}>
              <div>
                <h2 className={styles.bannerTitle}>Welcome, {userName}</h2>
                <p className={styles.bannerText}>
                  {pendingApprovals.length} pending approval{pendingApprovals.length === 1 ? '' : 's'} need your attention today.
                </p>
              </div>
              <div className={styles.bannerStat}>
                <span className={styles.bannerStatNumber}>{total}</span>
                <span className={styles.bannerStatLabel}>visitors today</span>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div
                className={styles.errorBox}
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}

            {/* KPIs */}
            <section className={styles.kpiRow}>
              <div className={`${styles.kpi} ${styles.kpiTotal}`}>
                <div className={styles.kpiTop}>
                  <h3 className={styles.kpiLabel}>Total Visitors Today</h3>
                  <span className={styles.kpiIcon}><People24Regular /></span>
                </div>
                <p className={styles.kpiValue}>{todayVisitors.length}</p>
              </div>

              <div className={`${styles.kpi} ${styles.kpiPending}`}>
                <div className={styles.kpiTop}>
                  <h3 className={styles.kpiLabel}>Pending Approvals</h3>
                  <span className={styles.kpiIcon}><Alert24Regular /></span>
                </div>
                <p className={styles.kpiValue}>{pendingApprovals.length}</p>
              </div>

              <div className={`${styles.kpi} ${styles.kpiChecked}`}>
                <div className={styles.kpiTop}>
                  <h3 className={styles.kpiLabel}>Checked In</h3>
                  <span className={styles.kpiIcon}><CheckmarkCircle24Regular /></span>
                </div>
                <p className={styles.kpiValue}>{checkedIn.length}</p>
              </div>

              <div className={`${styles.kpi} ${styles.kpiRejected}`}>
                <div className={styles.kpiTop}>
                  <h3 className={styles.kpiLabel}>Rejected</h3>
                  <span className={styles.kpiIcon}><DismissCircle24Regular /></span>
                </div>
                <p className={styles.kpiValue}>{rejectedVisitors.length}</p>
              </div>
            </section>

            {/* Body: table (left) + side panels (right) */}
            <div className={styles.body}>

              {/* Left column */}
              <div className={styles.column}>
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Today’s Visitors</h3>
                    <span className={styles.panelCount}>{todayVisitors.length}</span>
                  </div>
                  {todayVisitors.length === 0 ? (
                    <p className={styles.emptyState}>No visitors scheduled for today.</p>
                  ) : (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Visitor</th>
                            <th>Purpose of visit</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayVisitors.map((visitor, index) => (
                            <tr key={index}>
                              <td>
                                <div className={styles.person}>
                                  <span className={styles.avatar}>{getInitial(visitor.name)}</span>
                                  <div>
                                    <p className={styles.personName}>{visitor.name}</p>
                                    <p className={styles.personSub}>{visitor.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>{visitor.purposeofvisit}</td>
                              <td>
                                <span className={`${styles.statusBadge} ${getStatusClass(visitor.status)}`}>
                                  {visitor.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              {/* Right column */}
              <div className={styles.column}>

                {/* Status breakdown */}
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Today at a Glance</h3>
                  </div>
                  <div className={styles.breakdown}>
                    <div className={styles.breakdownBar}>
                      <span className={styles.breakdownChecked} style={{ width: pct(checkedIn.length) }} />
                      <span className={styles.breakdownPending} style={{ width: pct(pendingApprovals.length) }} />
                      <span className={styles.breakdownRejected} style={{ width: pct(rejectedVisitors.length) }} />
                    </div>
                    <ul className={styles.legend}>
                      <li>
                        <span className={styles.legendDot} style={{ backgroundColor: '#22a355' }} />
                        Checked In
                        <span className={styles.legendValue}>{checkedIn.length}</span>
                      </li>
                      <li>
                        <span className={styles.legendDot} style={{ backgroundColor: '#f59e0b' }} />
                        Pending
                        <span className={styles.legendValue}>{pendingApprovals.length}</span>
                      </li>
                      <li>
                        <span className={styles.legendDot} style={{ backgroundColor: '#dc2626' }} />
                        Rejected
                        <span className={styles.legendValue}>{rejectedVisitors.length}</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Pending approvals */}
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Pending Approvals</h3>
                    <span className={styles.panelCount}>{pendingApprovals.length}</span>
                  </div>
                  {pendingApprovals.length === 0 ? (
                    <p className={styles.emptyState}>No pending check-in requests.</p>
                  ) : (
                    pendingApprovals.map((visitor, index) => (
                      <div key={index} className={styles.listItem}>
                        <span className={styles.avatar}>{getInitial(visitor.name)}</span>
                        <div className={styles.listBody}>
                          <p className={styles.listName}>{visitor.name}</p>
                          <p className={styles.listMeta}>{visitor.purposeofvisit}</p>
                        </div>
                      </div>
                    ))
                  )}
                </section>

                {/* Recent activity */}
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Recent Activity</h3>
                  </div>
                  {recentActivity.length === 0 ? (
                    <p className={styles.emptyState}>No recent activity today.</p>
                  ) : (
                    <ul className={styles.timeline}>
                      {recentActivity.map((visitor, index) => (
                        <li key={index} className={`${styles.timelineItem} ${getDotClass(visitor.status)}`}>
                          <span className={styles.timelineName}>{visitor.name}</span>
                          <span className={`${styles.statusBadge} ${getStatusClass(visitor.status)}`}>
                            {visitor.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            © 2025 Visitor Management System. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default VisitorDashboard;