import React from 'react';
import PropTypes from 'prop-types';
import {
  MemoryRouter as Router, Route, NavLink, Switch,
} from 'react-router-dom';

import Chart from './Chart';
import Tree from './Tree';

// eslint-disable-next-line react/prop-types
const StateRoute = ({ snapshot, hierarchy }) => (
  <Router>
    <div className="navbar">
      <NavLink className="router-link" activeClassName="is-active" exact to="/">
        Tree
      </NavLink>
      <NavLink className="router-link" activeClassName="is-active" to="/chart">
        Chart
      </NavLink>
    </div>
    <Switch>
      <Route path="/chart" render={() => <Chart hierarchy={hierarchy} />} />
      <Route path="/" render={() => <Tree snapshot={snapshot} />} />
    </Switch>
  </Router>
);

StateRoute.propTypes = {
  snapshot: PropTypes.shape({
    state: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default StateRoute;
