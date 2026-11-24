import * as React from 'react';
import { useEffect, useState } from 'react';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './reports.module.scss';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import { FaBriefcase, FaBuilding } from "react-icons/fa";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import SharedSidebar, { IAppLayoutProps } from './SharedSidebar';

export interface IVisitorDashboardProps extends IAppLayoutProps {
  sp: any; // or SPFI if you're using @pnp/sp properly typed
    context: WebPartContext;
}

interface IVisitor {
  Id: number;
  name: string;
  host: string;
  email: string;
  Department: string;
  purposeofvisit: string;
  status: string;
  visitdate: string;
  In_x002d_time?: string;
  Outtime?: string;
}

// ---------- UI-only helpers (no business logic) ---------- //
const getInitial = (text?: string): string =>
  (text || '?').trim().charAt(0).toUpperCase();

const getStatusClass = (status?: string): string => {
  const s = (status || '').toLowerCase().replace(/\s|-/g, '');
  if (s === 'pending') return styles.statusPending;
  if (s === 'checkedin') return styles.statusCheckedin;
  if (s === 'rejected') return styles.statusRejected;
  return '';
};

const VisitorReportPage: React.FC<IVisitorDashboardProps> = ({
  sp,
  context,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const [visitors, setVisitors] = useState<IVisitor[]>([]);
  const [filtered, setFiltered] = useState<IVisitor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  

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
          "host",
          "purposeofvisit",
          "email",
          "Department",
          "In_x002d_time",
          "Outtime",
          "status",
          "visitdate"
        )
        .orderBy("Id", false)();
0
      setVisitors(items);
      setFiltered(items);
    } catch (error) {
      console.error("❌ Error loading visitors:", error);
    }
  };

  const applyFilters = () => {
    let filteredData = [...visitors];

    if (statusFilter !== 'All') {
  filteredData = filteredData.filter(v => {
    const normalizedStatus = (v.status || "").toLowerCase().replace(/\s|-/g, "");
    const normalizedFilter = statusFilter.toLowerCase().replace(/\s|-/g, "");
    return normalizedStatus === normalizedFilter;
  });
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

  //card-count logic
const getCountByStatus = (status: string) => {
  if (status === "All") return visitors.length;

  return visitors.filter(v => {
    const normalized = (v.status || "").toLowerCase().replace(/\s|-/g, ""); 
    const compareTo = status.toLowerCase().replace(/\s|-/g, ""); 
    return normalized === compareTo;
  }).length;
};


  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);
 const totalPages = Math.max(1, Math.ceil(filtered.length / recordsPerPage));

  // ✅ Remove SharePoint chrome
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

  const userName = context.pageContext.user.displayName;

  // Presentational range text for the pagination bar
  const rangeStart = filtered.length === 0 ? 0 : indexOfFirstRecord + 1;
  const rangeEnd = Math.min(indexOfLastRecord, filtered.length);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#f3f6f9', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
        <SharedSidebar
          activePage="reports"
          userName={userName}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
        />

        {/* ============ MAIN ============ */}
        <main className={styles.main}>

          {/* Top bar */}
          <div className={styles.topbar}>
            <div>
              <h1 className={styles.pageTitle}>Visitor Reports</h1>
              <p className={styles.pageSubtitle}>Analyze and export your visitor data</p>
            </div>
            <button className={styles.btnPrimary} onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <div className={styles.content}>

            {/* Filters */}
            <section className={styles.filters}>
              <h3 className={styles.filtersTitle}>Filters</h3>

              <div className={styles.field}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Checked In">Checked In</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>From date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>To date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </section>

            {/* Stats */}
            <section className={styles.kpiRow}>
              <div className={`${styles.kpi} ${styles.kpiTotal}`}>
                <strong className={styles.kpiLabel}>Total Visitors</strong>
                <span className={styles.kpiValue}>{visitors.length}</span>
              </div>
              <div className={`${styles.kpi} ${styles.kpiPending}`}>
                <strong className={styles.kpiLabel}>Pending</strong>
                <span className={styles.kpiValue}>{getCountByStatus("Pending")}</span>
              </div>
              <div className={`${styles.kpi} ${styles.kpiChecked}`}>
                <strong className={styles.kpiLabel}>Checked In</strong>
                <span className={styles.kpiValue}>{getCountByStatus("Checked In")}</span>
              </div>
              <div className={`${styles.kpi} ${styles.kpiRejected}`}>
                <strong className={styles.kpiLabel}>Rejected</strong>
                <span className={styles.kpiValue}>{getCountByStatus("Rejected")}</span>
              </div>
            </section>

            {/* Table */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Report Results</h3>
                <span className={styles.panelCount}>{filtered.length}</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Visitor</th>
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
                    {currentRecords.length > 0 ? (
                      currentRecords.map((visitor) => (
                        <tr key={visitor.Id}>
                          <td>
                            <div className={styles.person}>
                              <span className={styles.avatar}>{getInitial(visitor.name)}</span>
                              <div>
                                <p className={styles.personName}>{visitor.name}</p>
                                <p className={styles.personSub}>{visitor.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>{visitor.host || 'N/A'}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(visitor.status)}`}>
                              {visitor.status}
                            </span>
                          </td>
                          <td>
                            <span className={styles.iconText}>
                              <span className={styles.iconBadge}><FaBriefcase /></span>
                              {visitor.purposeofvisit}
                            </span>
                          </td>
                          <td>
                            <span className={styles.iconText}>
                              <span className={styles.iconBadge}><FaBuilding /></span>
                              {visitor.Department}
                            </span>
                          </td>
                          <td>{visitor.visitdate}</td>
                          <td>{visitor.In_x002d_time || "-"}</td>
                          <td>{visitor.Outtime || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className={styles.emptyCell}>
                          No records match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Showing {rangeStart}–{rangeEnd} of {filtered.length}
                </span>
                <div className={styles.paginationControls}>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>← Previous</button>
                  <span> Page {currentPage} of {totalPages} </span>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next →</button>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className={styles.footer}>
            © 2025 Visitor Management System. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default VisitorReportPage;