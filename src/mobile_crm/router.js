/* eslint-disable import/no-dynamic-require */
import React from 'react';
import { Router, Route, IndexRoute, Redirect, IndexRedirect } from 'dva/router';

import connectPermission from './models/connectPermission';
import createRouterGuard from '../router-guard';

import App from './routes/App';
import Home from './routes/page/Home';
import entcommList from './routes/page/entcommList';
import entcommDetail from './routes/page/entcommDetail';
import NoFoundPage from './routes/NoFoundPage';

const appRoutes = [
  { path: 'home', comp: Home },
  { path: 'entcomm-list/:id', comp: entcommList, model: require('./models/entcommList') },
  { path: 'entcomm/:entityId/:recordId/detail', comp: entcommDetail, model: require('./models/entcommDetail') },
  { path: '*', comp: NoFoundPage }
];

const modelCached = {};
function registerModel(app, model) {
  if (!modelCached[model.namespace]) {
    app.model(model);
    modelCached[model.namespace] = 1;
  }
}

function renderRoutes(routes, app, routerGuard) {
  if (!routes.length) return null;
  const resultRoutes = routes.map(route => {
    const { path, comp, routes: childRoutes, entid, model } = route;

    const component = entid ? connectPermission(entid, comp) : comp;
    const props = {
      key: path,
      path,
      getComponent: (location, cb) => {
        if (model) {
          registerModel(app, model);
        }
        cb(null, component);
      },
      onEnter: routerGuard
    };
    if (childRoutes && childRoutes.length) {
      props.children = renderRoutes(childRoutes, app, routerGuard);
    }
    return React.createElement(Route, props);
  });
  const indexRedirect = <IndexRedirect to={routes[0].path} key={'redirect-' + routes[0].path} />;
  return [indexRedirect, ...resultRoutes];
}

export default function RouterConfig({ history, app }) {
  const routerGuard = createRouterGuard(appRoutes);
  return (
    <Router history={history}>
      <Route path="/" component={App}>
        {renderRoutes(appRoutes, app, routerGuard)}
        <Route path="*" component={NoFoundPage} />
      </Route>
    </Router>
  );
}
