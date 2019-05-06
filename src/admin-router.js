/* eslint-disable import/no-dynamic-require */
import React from 'react';
import { Router, Route, IndexRedirect } from 'dva/router';

import connectPermission from './models/connectPermission';

import App from './routes/App';
import NoFoundPage from './routes/NoFoundPage';
import NoPermission from './routes/NoPermission';

import Structure from './routes/Structure';

import ReportRelation from './routes/ReportRelation';
import ReportRelationMain from './routes/ReportRelation/ReportRelationMain';
import ReportRelationDetail from './routes/ReportRelation/ReportRelationDetail';


import ProductManager from './routes/ProductManager';

import RoleGroups from './routes/RoleGroupList';
import RoleList from './routes/RoleList';
import RoleHome from './routes/RoleHome';
import RoleRule from './routes/RoleHome/views/RoleRule';
import RoleUsers from './routes/RoleHome/views/RoleUsers';

import VocationList from './routes/VocationList';
import VocationHome from './routes/VocationHome';
import VocationRule from './routes/VocationHome/views/VocationRule';
import VocationUsers from './routes/VocationHome/views/VocationUsers';

import OperateLog from './routes/OperateLog';

import LicenseInfo from './routes/LicenseInfo';

import PasswordStrategy from './routes/Configure/passwordStrategy';

const appRoutes = [
  { path: 'structure', comp: Structure, entid: '3d77dfd2-60bb-4552-bb69-1c3e73cf4095', model: require('./models/structure') },
  { path: 'reportrelation', comp: ReportRelationMain, model: require('./models/reportrelation') },
  { path: 'reportrelationdetail/:id', comp: ReportRelationDetail, model: require('./models/reportrelationdetail') },
  { path: 'role-groups', comp: RoleGroups, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/roleGroups') },
  { path: 'roles', comp: RoleList, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/roleList') },
  {
    path: 'role/:id/:type/:name',
    comp: RoleHome,
    entid: '00000000-0000-0000-0000-000000000012',
    children: [
      { path: 'rule', comp: RoleRule, model: require('./models/roleRule') },
      { path: 'users', comp: RoleUsers, model: require('./models/roleUsers') }
    ]
  },
  { path: 'products', comp: ProductManager, entid: '33240d14-a543-4357-b696-c8cc77f82f7c', model: require('./models/productManager') },
  { path: 'vocations', comp: VocationList, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/vocationList') },
  {
    path: 'vocation/:id/:name',
    comp: VocationHome,
    entid: '00000000-0000-0000-0000-000000000012',
    children: [
      { path: 'rule', comp: VocationRule, model: require('./models/vocationRule') },
      { path: 'users', comp: VocationUsers, model: require('./models/vocationUsers') }
    ]
  },
  { path: 'operate-log', comp: OperateLog },
  { path: 'licenseinfo', comp: LicenseInfo, model: require('./models/licenseInfo') },

  { path: 'passwordstrategy', comp: PasswordStrategy, model: require('./models/passwordstrategy') },
  { path: 'nopermission', comp: NoPermission },
  { path: '*', comp: NoFoundPage }
];

const modelCached = {};
function registerModel(app, model) {
  if (!modelCached[model.namespace]) {
    app.model(model);
    modelCached[model.namespace] = 1;
  }
}

function renderRoutes(routes, app) {
  if (!routes.length) return null;
  const resultRoutes = routes.map(route => {
    const { path, comp, children, entid, model } = route;

    const component = entid ? connectPermission(entid, comp) : comp;
    const props = {
      key: path,
      path,
      getComponent: (location, cb) => {
        if (model) {
          registerModel(app, model);
        }
        cb(null, component);
      }
    };
    if (children && children.length) {
      props.children = renderRoutes(children, app);
    }
    return React.createElement(Route, props);
  });
  const indexRedirect = <IndexRedirect to={routes[0].path} key={'redirect-' + routes[0].path} />;
  return [indexRedirect, ...resultRoutes];
}

export default function RouterConfig({ history, app }) {
  return (
    <Router history={history}>
      <Route path="/" component={App}>
        {renderRoutes(appRoutes, app)}
        <Route path="*" component={NoFoundPage} />
      </Route>
    </Router>
  );
}
