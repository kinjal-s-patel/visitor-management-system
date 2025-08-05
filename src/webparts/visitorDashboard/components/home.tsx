import * as React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRouter from './/AppRouter';
import { IVisitorDashboardProps } from './/IVisitorDashboardProps';

const Home: React.FC<IVisitorDashboardProps> = (props) => {
  return (
    <Router>
      <AppRouter {...props} />
    </Router>
  );
};

export default Home;