import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './visitorlogs.module.scss';
import { FaBuilding, FaBriefcase } from "react-icons/fa";

export interface IVisitorDashboardProps {
  sp: any; // spfi object passed from parent
}

interface IVisitor {
  Id: number;
  name: string;
  number: string;
  purposeofvisit: string;
  email: string;
  hostname: { Title: string }; // Person/Group field
  Department: string;
  visitdate: string;
  In_x002d_time: string;
}

const ViewVisitors: React.FC<IVisitorDashboardProps> = ({ sp }) => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<IVisitor[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 10;

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

  const formatTextTime = (timeString: string) => {
    if (!timeString) return "";
    const [hourStr, minute] = timeString.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${hour}:${minute} ${ampm}`;
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = visitors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(visitors.length / recordsPerPage);

  // ✅ Cleanup default SharePoint layout
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
        <header className={styles.dashboardHeader}>
          <div className={styles.dashboardHeader__left}>
            <h1 className={styles.dashboardHeader__title}>Visitor Management System</h1>
          </div>
          <div className={styles.dashboardHeader__right}>
            <span className={styles.dashboardHeader__userName}>Welcome, John Doe</span>
          </div>
        </header>

        {/* Navigation */}
        <div className={styles.visitorDashboard__actions}>
          <button className={styles.btn} onClick={() => navigate('/visitorform')}>
            Add Visitor
          </button>
          <button className={styles.btn} onClick={() => navigate('/reports')}>
            Reports
          </button>
          <button className={styles.btn} onClick={() => navigate('/')}>
            Dashboard
          </button>
        </div>

        {/* Heading */}
        <h2 className={styles.heading}>Visitor Records</h2>

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
              {currentRecords.map(visitor => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            ⬅ Previous
          </button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
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