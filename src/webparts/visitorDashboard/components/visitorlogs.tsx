import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './visitorlogs.module.scss';
import { FaBuilding, FaBriefcase, FaSearch } from "react-icons/fa"; // ✅ Added FaSearch
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IVisitorDashboardProps {
  sp: any; // spfi object passed from parent
  context: WebPartContext;
}

interface IVisitor {
  Id: number;
  name: string;
  number: string;
  purposeofvisit: string;
  email: string;
  hostname: { Title: string };
  Department: string;
  visitdate: string;
  In_x002d_time: string;
}

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
            "purposeofvisit",
            "email",
            "hostname/Title",
            "Department",
            "visitdate",
            "In_x002d_time"
          )
          .expand("hostname")
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

  // ✅ Filter visitors
  const filteredVisitors = visitors.filter((v) =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.hostname?.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'auto',
      backgroundColor: '#fff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
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

        {/* Navigation */}
        <div className={styles.visitorDashboard__actions}>
          <button className={styles.btn} onClick={() => navigate('/visitorform')}>Add Visitor</button>
          <button className={styles.btn} onClick={() => navigate('/reports')}>Reports</button>
          <button className={styles.btn} onClick={() => navigate('/')}>Dashboard</button>
        </div>

        {/* Heading + Search */}
        <div className={styles.headingRow}>
          <h2 className={styles.heading}>Visitor Records</h2>
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
        <div className={styles.tableContainer}>
          <table className={styles.visitorTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th>Purpose</th>
                <th>Host</th>
                <th>Department</th>
                <th>Date</th>
                <th>In-Time</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map(visitor => (
                  <tr key={visitor.Id}>
                    <td>{visitor.name}</td>
                    <td>{visitor.number}</td>
                    <td>{visitor.email}</td>
                    <td className={styles.iconText}>
                      <FaBriefcase style={{ color: "#165a43", marginRight: "6px" }} />
                      {visitor.purposeofvisit}
                    </td>
                    <td>{visitor.hostname?.Title || "N/A"}</td>
                    <td className={styles.iconText}>
                      <FaBuilding style={{ color: "#165a43", marginRight: "6px" }} />
                      {visitor.Department}
                    </td>
                    <td>{visitor.visitdate}</td>
                    <td>{formatTextTime(visitor.In_x002d_time)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                    No visitors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            ⬅ Previous
          </button>
          <span> Page {currentPage} of {totalPages || 1} </span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}>
            Next ➡
          </button>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          © 2025 Visitor Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default ViewVisitors;
