import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './visitorlogs.module.scss';
import { FaBuilding, FaBriefcase, FaSearch } from "react-icons/fa";
import {
  Home24Regular,
  PersonAdd24Regular,
  TextBulletList24Regular,
  DataBarVertical24Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IVisitorDashboardProps {
  sp: any; // spfi object passed from parent
  context: WebPartContext;
}

interface IVisitor {
  host: string;
  Id: number;
  name: string;
  number: string;
  purposeofvisit: string;
  email: string;
  Department: string;
  visitdate: string;
  In_x002d_time: string;
  Outtime : string;
  status?: string;

}

// UI-only helper (no business logic)
const getInitial = (text?: string): string =>
  (text || '?').trim().charAt(0).toUpperCase();

const ViewVisitors: React.FC<IVisitorDashboardProps> = ({ sp, context }) => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<IVisitor[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const recordsPerPage = 10;

  // ✅ Fetch visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("visitor-list")
          .items
          .select(
            "Id",
            "name",
            "number",
            "host",
            "purposeofvisit",
            "email",
            "Department",
            "visitdate",
            "In_x002d_time",
            "Outtime",
            "status"
          )
          .orderBy("Id", false)();

        setVisitors(items);
      } catch (error) {
        console.error("❌ Error loading visitors:", error);
      }
    };

    fetchVisitors();
  }, [sp]);

  // ✅ Format In-Time
  const formatTextTime = (timeString: string) => {
    if (!timeString) return "";
    const [hourStr, minute] = timeString.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${hour}:${minute} ${ampm}`;
  };

const handleCheckout = async (visitor: IVisitor) => {
  try {
    // 🔒 Prevent checkout if status is "Pending"
    if (visitor.status?.toLowerCase() === "pending") {
      alert("Approval pending, cannot check out.");
      return;
    }

    // 🔒 Prevent checkout if already checked out
    // if (visitor.Outtime) {
    //   alert("Visitor already checked out.");
    //   return;
    // }

    const now = new Date();
    const outTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    await sp.web.lists.getByTitle("visitor-list").items.getById(visitor.Id).update({
      Outtime: outTime
    });

    // ✅ Update local state
    setVisitors(prev =>
      prev.map(v => v.Id === visitor.Id ? { ...v, Outtime: outTime } : v)
    );

    alert(`Visitor ${visitor.name} checked out successfully at ${outTime}`);
  } catch (err) {
    console.error("❌ Error updating check-out:", err);
    alert("Something went wrong while checking out.");
  }
};



  // ✅ Filter visitors
  const filteredVisitors = visitors.filter((v) =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.Department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Pagination logic applied on filteredVisitors
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredVisitors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredVisitors.length / recordsPerPage);

  // ✅ Cleanup SharePoint chrome
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

      #spPageCanvasContent, .CanvasComponent, .CanvasZone,
      .CanvasSection, .control-zone {
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
  const rangeStart = filteredVisitors.length === 0 ? 0 : indexOfFirstRecord + 1;
  const rangeEnd = Math.min(indexOfLastRecord, filteredVisitors.length);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#f3f6f9',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className={styles.app}>

        {/* ============ SIDEBAR ============ */}
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandLogo}>V</span>
            <p className={styles.brandName}>Visitor Management System</p>
          </div>

          <nav className={styles.nav}>
            <button className={styles.navItem} onClick={() => navigate('/')}>
              <span className={styles.navIcon}><Home24Regular /></span>
              Dashboard
            </button>
            <button className={styles.navItem} onClick={() => navigate('/visitorform')}>
              <span className={styles.navIcon}><PersonAdd24Regular /></span>
              Add Visitor
            </button>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <span className={styles.navIcon}><TextBulletList24Regular /></span>
              View Visitor
            </button>
            <button className={styles.navItem} onClick={() => navigate('/reports')}>
              <span className={styles.navIcon}><DataBarVertical24Regular /></span>
              Reports
            </button>
          </nav>

          <div className={styles.sidebarUser}>
            <span className={styles.avatar}>{getInitial(userName)}</span>
            <div className={styles.sidebarUserText}>
              <p className={styles.sidebarUserName}>{userName}</p>
              <p className={styles.sidebarUserRole}>Signed in</p>
            </div>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className={styles.main}>

          {/* Top bar */}
          <div className={styles.topbar}>
            <div>
              <h1 className={styles.pageTitle}>Visitor Records</h1>
              <p className={styles.pageSubtitle}>
                Search, review and check out visitors
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => navigate('/visitorform')}>
              + Add Visitor
            </button>
          </div>

          <div className={styles.content}>
            <section className={styles.panel}>

              {/* Panel header: title + search */}
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleWrap}>
                  <h3 className={styles.panelTitle}>All Visitors</h3>
                  <span className={styles.panelCount}>{filteredVisitors.length}</span>
                </div>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // reset page when searching
                    }}
                  />
                </div>
              </div>

              {/* Visitor Table */}
              <div className={styles.tableWrap}>
                <table className={styles.visitorTable}>
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Contact Number</th>
                      <th>Purpose</th>
                      <th>Host</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>In-Time</th>
                      <th>Out-Time</th>
                      <th>Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length > 0 ? (
                      currentRecords.map(visitor => (
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
                          <td>{visitor.number}</td>
                          <td>
                            <span className={styles.iconText}>
                              <span className={styles.iconBadge}><FaBriefcase /></span>
                              {visitor.purposeofvisit}
                            </span>
                          </td>
                          <td>{visitor.host || "N/A"}</td>
                          <td>
                            <span className={styles.iconText}>
                              <span className={styles.iconBadge}><FaBuilding /></span>
                              {visitor.Department}
                            </span>
                          </td>
                          <td>{visitor.visitdate}</td>
                          <td>{formatTextTime(visitor.In_x002d_time)}</td>
                          <td>
                            {visitor.Outtime
                              ? formatTextTime(visitor.Outtime)
                              : <span className={styles.muted}>—</span>}
                          </td>
                          <td>
                            {visitor.status?.toLowerCase() === "rejected" ? (
                              <span className={`${styles.pill} ${styles.pillRejected}`}>Rejected</span>
                            ) : visitor.Outtime ? (
                              // ✅ After check-out, hide the button
                              <span className={`${styles.pill} ${styles.pillDone}`}>Checked out</span>
                            ) : (
                              <button
                                className={styles.btnSmall}
                                onClick={() => handleCheckout(visitor)}
                              >
                                Check Out
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className={styles.emptyCell}>
                          No visitors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Showing {rangeStart}–{rangeEnd} of {filteredVisitors.length}
                </span>
                <div className={styles.paginationControls}>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                    ← Previous
                  </button>
                  <span> Page {currentPage} of {totalPages || 1} </span>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                    Next →
                  </button>
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

export default ViewVisitors;