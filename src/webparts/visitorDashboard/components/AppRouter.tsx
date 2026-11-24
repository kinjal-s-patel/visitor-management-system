// components/AppRouter.tsx
import * as React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import VisitorDashboard from './VisitorDashboard';
import VisitorFormPage from './visitorform';
import ViewVisitors from './visitorlogs';
import VisitorReportPage from './reports';
import { IAppLayoutProps } from './SharedSidebar';

const AppRouter = (props: any) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const layoutProps: IAppLayoutProps = {
    sidebarCollapsed,
    onToggleSidebar: () => setSidebarCollapsed((collapsed) => !collapsed),
  };

  // Pass `navigate` as a prop to each routed component
  return (
<Routes>
  <Route path="/" element={<VisitorDashboard {...props} {...layoutProps} navigateto={navigate} />} />
  <Route
    path="/visitorform"
    element={<VisitorFormPage {...props} {...layoutProps} navigateto={navigate} />}
  />
  <Route
    path="/visitorlogs"
    element={<ViewVisitors {...props} {...layoutProps} navigateto={navigate} />}
  />
  <Route
    path="/reports"
    element={<VisitorReportPage {...props} {...layoutProps} navigateto={navigate} />}
  />
</Routes>

  );
};

export default AppRouter;
