import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  DataBarVertical24Regular,
  Home24Regular,
  PersonAdd24Regular,
  TextBulletList24Regular,
} from '@fluentui/react-icons';
import styles from './SharedSidebar.module.scss';

export type SidebarPage = 'dashboard' | 'visitorform' | 'visitorlogs' | 'reports';

export interface IAppLayoutProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

interface ISharedSidebarProps extends IAppLayoutProps {
  activePage: SidebarPage;
  userName: string;
}

const SharedSidebar: React.FC<ISharedSidebarProps> = ({
  activePage,
  userName,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const initial = (userName || '?').trim().charAt(0).toUpperCase();
  const ToggleIcon = sidebarCollapsed ? ChevronRight24Regular : ChevronLeft24Regular;

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.brand}>
        <span className={styles.brandLogo}>V</span>
        <p className={styles.brandName}>Visitor Management System</p>
        <button
          className={styles.toggle}
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ToggleIcon />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        <button
          type="button"
          className={`${styles.navItem} ${activePage === 'dashboard' ? styles.navItemActive : ''}`}
          onClick={() => navigate('/')}
          aria-label="Dashboard"
          aria-current={activePage === 'dashboard' ? 'page' : undefined}
          title={sidebarCollapsed ? 'Dashboard' : undefined}
        >
          <span className={styles.navIcon}><Home24Regular /></span>
          <span className={styles.navLabel}>Dashboard</span>
        </button>
        <button
          type="button"
          className={`${styles.navItem} ${activePage === 'visitorform' ? styles.navItemActive : ''}`}
          onClick={() => navigate('/visitorform')}
          aria-label="Add Visitor"
          aria-current={activePage === 'visitorform' ? 'page' : undefined}
          title={sidebarCollapsed ? 'Add Visitor' : undefined}
        >
          <span className={styles.navIcon}><PersonAdd24Regular /></span>
          <span className={styles.navLabel}>Add Visitor</span>
        </button>
        <button
          type="button"
          className={`${styles.navItem} ${activePage === 'visitorlogs' ? styles.navItemActive : ''}`}
          onClick={() => navigate('/visitorlogs')}
          aria-label="View Visitor"
          aria-current={activePage === 'visitorlogs' ? 'page' : undefined}
          title={sidebarCollapsed ? 'View Visitor' : undefined}
        >
          <span className={styles.navIcon}><TextBulletList24Regular /></span>
          <span className={styles.navLabel}>View Visitor</span>
        </button>
        <button
          type="button"
          className={`${styles.navItem} ${activePage === 'reports' ? styles.navItemActive : ''}`}
          onClick={() => navigate('/reports')}
          aria-label="Reports"
          aria-current={activePage === 'reports' ? 'page' : undefined}
          title={sidebarCollapsed ? 'Reports' : undefined}
        >
          <span className={styles.navIcon}><DataBarVertical24Regular /></span>
          <span className={styles.navLabel}>Reports</span>
        </button>
      </nav>

      <div className={styles.sidebarUser}>
        <span className={styles.avatar}>{initial}</span>
        <div className={styles.sidebarUserText}>
          <p className={styles.sidebarUserName}>{userName}</p>
          <p className={styles.sidebarUserRole}>Signed in</p>
        </div>
      </div>
    </aside>
  );
};

export default SharedSidebar;
