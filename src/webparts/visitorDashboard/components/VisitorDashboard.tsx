import * as React from "react";
import {
  Stack,
  Spinner,
  SpinnerSize,
  PrimaryButton,
  DetailsList,
  IColumn,
} from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";

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
  Email?: string;
  Mobile?: string;
  Host?: { Title: string; EMail: string };
  VisitDate?: string;
  Purpose?: string;
  Status?: string;
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

const VisitorDashboard: React.FC<IVisitorDashboardProps> = ({
  context,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [todayVisitors, setTodayVisitors] = React.useState<IVisitorItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<IVisitorItem[]>([]);
  const [checkedIn, setCheckedIn] = React.useState<IVisitorItem[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<IVisitorItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();

  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayStart = moment().startOf('day').toISOString();
      const todayEnd = moment().endOf('day').toISOString();

      const visitors = await (
        sp.web.lists
          .getByTitle('visitor-list')
          .items
          .select(
             'name', 'email', 'Contactnumber', 'Host', 'purposeofvisit', 'Department'
          )
          .expand('Host')
          .filter(`VisitDate ge datetime'${todayStart}' and VisitDate le datetime'${todayEnd}'`)
          .orderBy('Created', false)
          .top(100) as any
      ).get();

      const typedVisitors = visitors as IVisitorItem[];

      setTodayVisitors(typedVisitors);
      setPendingApprovals(typedVisitors.filter(v => v?.Status === 'Pending'));
      setCheckedIn(typedVisitors.filter(v => v?.Status === 'Checked-in'));
      setRecentActivity(typedVisitors.slice(0, 10));
    } catch (e) {
      console.error(e);
      setError('Failed to load visitor data.');
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

  const columns: IColumn[] = [
    {
      key: "visitor",
      name: "Visitor",
      fieldName: "Title",
      minWidth: 120,
      isResizable: true,
    },
    {
      key: "host",
      name: "Host",
      fieldName: "Host",
      minWidth: 140,
      onRender: (item: IVisitorItem) => item.Host?.Title || "--",
    },
    {
      key: "visitDate",
      name: "Visit Date",
      fieldName: "VisitDate",
      minWidth: 160,
      onRender: (item: IVisitorItem) =>
        item.VisitDate ? moment(item.VisitDate).format("DD MMM YYYY, h:mm A") : "--",
    },
    {
      key: "status",
      name: "Status",
      fieldName: "Status",
      minWidth: 100,
      onRender: (item: IVisitorItem) => {
        const status = item.Status || "";
        let color = "#666";
        if (status === "Pending") color = "#d9822b";
        if (status === "Approved" || status === "Checked-in") color = "#107c10";
        if (status === "Rejected") color = "#a80000";
        return (
          <span style={{ fontWeight: 600, color }}>
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      name: "Actions",
      minWidth: 140,
      onRender: (item: IVisitorItem) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton
            text="View"
            onClick={() => {
              alert(`Visitor: ${item.Title}\nStatus: ${item.Status}`);
            }}
            styles={{ root: { minWidth: 70 } }}
          />
        </Stack>
      ),
    },
  ];

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
        <header className={styles.dashboardHeader}>
          <div className={styles.dashboardHeader__left}>
            <h1 className={styles.dashboardHeader__title}>Visitor Management System</h1>
          </div>
          <div className={styles.dashboardHeader__right}>
            <span className={styles.dashboardHeader__userName}>Welcome, John Doe</span>
          </div>
        </header>

        <div className={styles.visitorDashboard__header}>
          <div>
            <h1 className={styles.visitorDashboard__title}>Visitor Dashboard</h1>
            <p className={styles.visitorDashboard__subtitle}>Overview of today’s visitor activity</p>
          </div>
          <div className={styles.visitorDashboard__actions}>
            <button
  className={`${styles.btn} ${styles.secondary}`}
  onClick={() => navigate('/visitorform')}
>
  Add Visitor
</button>

<button
  className={`${styles.btn} ${styles.primary}`}
  onClick={() => navigate('/new-visitor')}
>
  View Visitor
</button>

<button
  className={`${styles.btn} ${styles.secondary}`}
  onClick={() => navigate('/reports')}
>
  Reports
</button>


<button
  className={`${styles.btn} ${styles.secondary}`}
  onClick={() => navigate('/')}
>
  Reports
</button>

          </div>
        </div>
        {error && <div className={styles.visitorDashboard__error}>{error}</div>}

        <div className={styles.visitorDashboard__kpis}>
          <div className={`${styles.kpiCard} ${styles.kpiCardPlum}`}>
            <h3>Total Visitors Today</h3>
            <p>{todayVisitors.length}</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
            <h3>Pending Approvals</h3>
            <p>{pendingApprovals.length}</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardMint}`}>
            <h3>Checked In</h3>
            <p>{checkedIn.length}</p>
          </div>
        </div>

        <div className={styles.visitorDashboard__content}>
          <div className={styles.visitorDashboard__left}>
            <div className={styles.visitorDashboard__section}>
              <h2>Pending Approvals</h2>
              {pendingApprovals.length === 0 ? (
                <p>No pending check-in requests.</p>
              ) : (
                <DetailsList items={pendingApprovals} columns={columns} />
              )}
            </div>
          </div>

          {/* <div className={styles.visitorDashboard__right}>
            <div className={styles.visitorDashboard__section}>
              <h3>Quick Links</h3>
              <ul className={styles.quickLinks}>
              <li><button onClick={() => navigate('/visitorsform')}>Visitor Directory</button></li>
              <li><button onClick={() => navigate('/')}>Visitor</button></li>
              <li><button onClick={() => navigate('/visitors')}>Visitor Directory</button></li>
              </ul>
            </div> */}

            <div className={styles.visitorDashboard__section}>
              <h3>Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p>No recent activity today.</p>
              ) : (
                <DetailsList items={recentActivity} columns={columns} compact />
              )}
            </div>
          </div>
        </div>

        <div className={styles.visitorDashboard__footer}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={loadAll}>Refresh</button>
        </div>
      </div>
  );
};

export default VisitorDashboard;
