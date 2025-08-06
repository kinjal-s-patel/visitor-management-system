import * as React from 'react';
import { useEffect, useState } from 'react';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './reports.module.scss';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

export interface IVisitorDashboardProps {
  sp: any; // or SPFI if you're using @pnp/sp properly typed
}

const VisitorReportPage: React.FC<IVisitorDashboardProps> = ({ sp }) => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, startDate, endDate]);

  const loadVisitors = async () => {
    try {
      const items = await sp.web.lists.getByTitle("visitor-list").items.top(5000).get();
      setVisitors(items);
      setFiltered(items);
    } catch (error) {
      console.error("Error loading visitors:", error);
    }
  };

  const applyFilters = () => {
    let filteredData = [...visitors];

    if (statusFilter !== 'All') {
      filteredData = filteredData.filter(v => v.Status === statusFilter);
    }

    if (startDate) {
      filteredData = filteredData.filter(v => new Date(v.Created) >= new Date(startDate));
    }

    if (endDate) {
      filteredData = filteredData.filter(v => new Date(v.Created) <= new Date(endDate));
    }

    setFiltered(filteredData);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Visitor_Report.csv');
  };

  const getCountByStatus = (status: string) => {
    return visitors.filter(v => v.Status === status).length;
  };

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
  
      

  return (
     <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'auto', backgroundColor: '#fff', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
  <div className={styles.visitorReportWrapper}>
    {/* HEADER */}
    <header className={styles.dashboardHeader}>
      <div className={styles.dashboardHeader__left}>
        <h1 className={styles.dashboardHeader__title}>Visitor Management System</h1>
      </div>
      <div className={styles.dashboardHeader__right}>
        <span className={styles.dashboardHeader__userName}>Welcome, John Doe</span>
      </div>
    </header>

    {/* NAVIGATION BUTTONS */}
    <div className={styles.navButtons}>
      <button onClick={() => window.location.href = "/sites/yoursite/SitePages/VisitorDashboard.aspx"}>Dashboard</button>
      <button onClick={() => window.location.href = "/sites/yoursite/SitePages/ViewVisitors.aspx"}>View Visitors</button>
      <button onClick={() => window.location.href = "/sites/yoursite/SitePages/VisitorReport.aspx"} className={styles.active}>Reports</button>
    </div>

    {/* REPORT CONTENT */}
    <div className={styles.reportPage}>
      <h2>Visitor Reports</h2>
      <p>Analyze and export your visitor data</p>

      {/* Filters */}
      <div className={styles.filters}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="CheckedIn">Checked In</option>
          <option value="CheckedOut">Checked Out</option>
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <button onClick={exportCSV}>Export CSV</button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.card}>
          <strong>Total Visitors</strong>
          <span>{visitors.length}</span>
        </div>
        <div className={styles.card}>
          <strong>Checked In</strong>
          <span>{getCountByStatus("CheckedIn")}</span>
        </div>
        <div className={styles.card}>
          <strong>Pending</strong>
          <span>{getCountByStatus("Pending")}</span>
        </div>
        <div className={styles.card}>
          <strong>Rejected</strong>
          <span>{getCountByStatus("Rejected")}</span>
        </div>
      </div>

      {/* Table */}
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Host</th>
            <th>Status</th>
            <th>Purpose</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(visitor => (
            <tr key={visitor.Id}>
              <td>{visitor.VisitorName}</td>
              <td>{visitor.Email}</td>
              <td>{visitor.HostName}</td>
              <td>{visitor.Status}</td>
              <td>{visitor.Purpose}</td>
              <td>{visitor.CheckInTime || '-'}</td>
              <td>{visitor.CheckOutTime || '-'}</td>
              <td>{new Date(visitor.Created).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  </div>
);

};

export default VisitorReportPage;
