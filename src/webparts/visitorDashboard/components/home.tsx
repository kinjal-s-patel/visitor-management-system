import * as React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import { IVisitorDashboardProps } from './IVisitorDashboardProps';

import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

const Home: React.FC<IVisitorDashboardProps> = (props) => {
  const sp = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  return (
    <Router>
      <AppRouter {...props} sp={sp} />
    </Router>
  );
};

export default Home;
