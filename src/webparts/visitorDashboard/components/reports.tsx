import * as React from 'react';
import { useEffect, useState } from 'react';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './reports.module.scss';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import * as Papa from 'papaparse';
import { FaBriefcase, FaBuilding } from "react-icons/fa";

export interface IVisitorDashboardProps {
  sp: any; // or SPFI if you're using @pnp/sp properly typed
}

interface IVisitor {
  Id: number;
  name: string;
  email: string;
  hostname?: { Title: string };
  Department: string;
  purposeofvisit: string;
  status: string;
  visitdate: string;
  In_x002d_time?: string;
  Outtime?: string;
}

const VisitorReportPage: React.FC<IVisitorDashboardProps> = ({ sp }) => {
  const [visitors, setVisitors] = useState<IVisitor[]>([]);
  const [filtered, setFiltered] = useState<IVisitor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const navigate = useNavigate();

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, startDate, endDate, visitors]);

  const loadVisitors = async () => {
    try {
      const items: IVisitor[] = await sp.web.lists
        .getByTitle("visitor-list")
        .items
        .select(
          "Id",
          "name",
          "purposeofvisit",
          "email",
          "hostname/Title",
          "Department",
          "In_x002d_time",
          "Outtime",
          "status",
          "visitdate"
        )
        .expand("hostname")
        .orderBy("Id", false)();

      setVisitors(items);
      setFiltered(items);
    } catch (error) {
      console.error("❌ Error loading visitors:", error);
    }
  };

  const applyFilters = () => {
    let filteredData = [...visitors];

    if (statusFilter !== 'All') {
      filteredData = filteredData.filter(v => v.status === statusFilter);
    }

    if (startDate) {
      filteredData = filteredData.filter(v => new Date(v.visitdate) >= new Date(startDate));
    }

    if (endDate) {
      filteredData = filteredData.filter(v => new Date(v.visitdate) <= new Date(endDate));
    }

    setFiltered(filteredData);
    setCurrentPage(1); // reset to first page after filter
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Visitor_Report.csv');
  };

  const getCountByStatus = (status: string) => {
    return visitors.filter(v => v.status === status).length;
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  // ✅ Remove SharePoint chrome
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      #SuiteNavWrapper, #spSiteHeader, #spLeftNav,
      .spAppBar, .sp-appBar, .sp-appBar-mobile,
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

        {/* NAVIGATION */}
        <div className={styles.navButtons}>
          <button className={styles.btn} onClick={() => navigate('/visitorform')}>Add Visitor</button>
          <button className={styles.btn} onClick={() => navigate('/visitorlogs')}>View Visitor</button>
          <button className={styles.btn} onClick={() => navigate('/')}>Dashboard</button>
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
            <div className={styles.card}><strong>Total Visitors</strong><span>{visitors.length}</span></div>
            <div className={styles.card}><strong>Checked In</strong><span>{getCountByStatus("CheckedIn")}</span></div>
            <div className={styles.card}><strong>Pending</strong><span>{getCountByStatus("Pending")}</span></div>
            <div className={styles.card}><strong>Rejected</strong><span>{getCountByStatus("Rejected")}</span></div>
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
                <th>Department</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((visitor) => (
                <tr key={visitor.Id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.email}</td>
                  <td>{visitor.hostname?.Title || 'N/A'}</td>
                  <td>{visitor.status}</td>
                  <td><FaBriefcase /> {visitor.purposeofvisit}</td>
                  <td><FaBuilding /> {visitor.Department}</td>
                  <td>{visitor.visitdate}</td>
                  <td>{visitor.In_x002d_time || "-"}</td>
                  <td>{visitor.Outtime || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>⬅ Previous</button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next ➡</button>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          © 2025 Visitor Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default VisitorReportPage;
