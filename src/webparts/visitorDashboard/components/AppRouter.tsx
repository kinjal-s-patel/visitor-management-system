// components/AppRouter.tsx
import * as React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import VisitorDashboard from './VisitorDashboard';
import VisitorFormPage from './visitorform';
import ViewVisitors from './visitorlogs';
import VisitorReportPage from './reports';

const AppRouter = (props: any) => {
  const navigate = useNavigate();
  // Pass `navigate` as a prop to each routed component
  return (
<Routes>
  <Route path="/" element={<VisitorDashboard {...props} navigateto={navigate} />} />
  <Route
    path="/visitorform"
    element={<VisitorFormPage {...props} navigateto={navigate} />}
  />
  <Route
    path="/visitorlogs"
    element={<ViewVisitors {...props} navigateto={navigate} />}
  />
  <Route
    path="/reports"
    element={<VisitorReportPage {...props} navigateto={navigate} />}
  />
</Routes>

  );
};

export default AppRouter;
