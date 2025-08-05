// components/AppRouter.tsx
import * as React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import VisitorDashboard from './VisitorDashboard';
import VisitorFormPage from './visitorform';
// import ReportsPage from './ReportsPage';

const AppRouter = (props: any) => {
  const navigate = useNavigate(); // ✅ This gives access to the navigation function

  // Pass `navigate` as a prop to each routed component
  return (
    <Routes>
      <Route
        path="/"
        element={<VisitorDashboard {...props} navigateto={navigate} />}
      />
      <Route
        path="/visitorform"
        element={<VisitorFormPage {...props} navigateto={navigate} />}
      />
      {/* <Route
        path="/reports"
        element={<ReportsPage {...props} navigateto={navigate} />}
      /> */}
    </Routes>
  );
};

export default AppRouter;
