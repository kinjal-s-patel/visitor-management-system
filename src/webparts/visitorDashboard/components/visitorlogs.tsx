 import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './visitorlogs.module.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export interface IVisitorDashboardProps {
  sp: any;
}

interface IVisitor {
  Id: number;
  name: string;
  contactNumber: string;
  purposeofvisit: string;
  email: string;
  hostName: string;
  department: string;
  inTime: string;
}

const ViewVisitors: React.FC<IVisitorDashboardProps> = ({ sp }) => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<IVisitor[]>([]);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const items = await sp.web.lists.getByTitle("visitor-list").items.select(
          "Id",
          "name",
          "contactNumber",
          "purposeofvisit",
          "email",
          "hostName",
          "department",
          "inTime"
        ).orderBy("Id", false)();
        setVisitors(items);
      } catch (error) {
        console.error("❌ Error loading visitors:", error);
      }
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
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
      <div className={styles.container}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              {/* Optional logo here */}
              {/* <img src="/logo.png" alt="Logo" className={styles.logo} /> */}
            </div>
            <div className={styles.headerCenter}>
              <h1 className={styles.title}>Visitor Management System</h1>
              <p className={styles.subtitle}>Track, manage, and view all your visitors efficiently.</p>
            </div>
            <div className={styles.headerRight}>
              {/* You can add user info here if needed */}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className={styles.navbar}>
          <button onClick={() => navigate('/visitorform')}>
            Add Visitor <FontAwesomeIcon icon={faArrowRight} />
          </button>
            <button onClick={() => navigate('/visitorform')}>
            Reports <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <button onClick={() => navigate('/')}>
            Dashboard <FontAwesomeIcon icon={faArrowRight} />
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
                <th>In-Time</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(visitor => (
                <tr key={visitor.Id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.contactNumber}</td>
                  <td>{visitor.email}</td>
                  <td>{visitor.purposeofvisit}</td>
                  <td>{visitor.hostName}</td>
                  <td>{visitor.department}</td>
                  <td>{visitor.inTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
