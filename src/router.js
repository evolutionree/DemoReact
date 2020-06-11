/* eslint-disable import/no-dynamic-require */
import React from 'react';
import { Router, Route, IndexRoute, Redirect, IndexRedirect } from 'dva/router';

import connectPermission from './models/connectPermission';
import createRouterGuard from './router-guard';

import App from './routes/App';
import NoFoundPage from './routes/NoFoundPage';
import NoPermission from './routes/NoPermission';

import Home from './routes/Home/index';

import AttendanceList from './routes/AttendanceList';

import NoticeList from './routes/NoticeList';
import NoticeHome from './routes/NoticeHome';
import NoticeDetail from './routes/NoticeHome/views/NoticeDetail';
import NoticeRecords from './routes/NoticeHome/views/NoticeRecords';
import SalesTarget from './routes/SalesTarget/index';

import Knowledge from './routes/Knowledge';

import EntcommList from './routes/EntcommList';
import EntcommApplication from './routes/EntcommApplication';
import EntcommDynamic from './routes/EntcommDynamic';
import EntcommHome from './routes/EntcommHome';
import EntcommActivities from './routes/EntcommHome/views/EntcommActivities';
import EntcommInfo from './routes/EntcommHome/views/EntcommInfo';
import EntcommDocs from './routes/EntcommHome/views/EntcommDocs';
import EntcommRel from './routes/EntcommHome/views/EntcommRel';
import EntcommAffair from './routes/EntcommHome/views/EntcommAffair';
import RelationSchema from './routes/EntcommHome/views/RelationSchema';
import CommerceQueries from './routes/EntcommHome/views/CommerceQueries';
import OutCommerceQueries from './routes/EntcommHome/views/CommerceQueries/out.js';
import Wjxcallback from './routes/EntcommHome/views/Wjxcallback';

import ContractReceivePay from './routes/ContractHome/ReceivePay';

import CustomerRelationTree from './routes/CustomerHome/RelationTree';


import ProductManager from './routes/ProductManager';

import AffairList from './routes/AffairList';
import AffairDetail from './routes/AffairDetail';

import ReportForm from './routes/ReportForm/index';

import DynamicChart from './routes/ReportForm/dynaimcChart';

import Weekly from './routes/office/weekly/index';
import MyWeekly from './routes/office/weekly/myWeekly';
import ReceiveWeekly from './routes/office/weekly/receiveWeekly';
import AllWeekly from './routes/office/weekly/allWeekly';
import ReceiveWeeklyDetail from './routes/office/weekly/ReceiveWeeklyDetail';
import AllWeeklyDetail from './routes/office/weekly/AllWeeklyDetail';

import Daily from './routes/office/daily/index';
import myDaily from './routes/office/daily/myDaily';
import ReceiveDaily from './routes/office/daily/receiveDaily';
import AllDaily from './routes/office/daily/allDaily';
import ReceiveDailyDetail from './routes/office/daily/ReceiveDailyDetail';
import AllDailyDetail from './routes/office/daily/AllDailyDetail';

import Mails from './routes/Mails';

import MailRecovery from './routes/MailRecovery';

import DbManager from './routes/DbManager/index';
import UkqrtzManager from './routes/UkqrtzManager/index';

import Schedule from './routes/Schedule/index';

import AttendanceClassSet from './routes/AttendanceClassSet';

import AttendanceGroupSet from './routes/AttendanceGroupSet';
import AttendanceGroupDetail from './routes/AttendanceGroupSet/Detail';

import Desk from './routes/Desk';
import Demo from './routes/Demo';
import BusinessQuery from './routes/BusinessInquire/BusinessQuery';

const appRoutes = [
  { path: 'home', comp: Home },
  { path: 'attendance', comp: AttendanceList, entid: '969d32b6-d81c-43a3-bc0d-124ffc26855c' },
  { path: 'notice-list', comp: NoticeList, entid: '00000000-0000-0000-0000-000000000002' },
  {
    path: 'notice/:id/:title',
    comp: NoticeHome,
    routes: [
      { path: 'detail', comp: NoticeDetail },
      { path: 'records', comp: NoticeRecords }
    ]
  },
  { path: 'salestarget', comp: SalesTarget, entid: '8e45e238-df0e-44e0-80d6-14445269f6de', model: require('./models/salesTarget') },
  { path: 'knowledge', comp: Knowledge, entid: 'a3500e78-fe1c-11e6-aee4-005056ae7f49', model: require('./models/knowledge') },
  { path: 'entcomm-list/:id', comp: EntcommList, model: require('./models/entcommList') },
  { path: 'entcomm-application/:id', comp: EntcommApplication, model: require('./models/entcommApplication') },
  { path: 'entcomm-dynamic/:id', comp: EntcommDynamic, model: require('./models/entcommDynamic') },
  {
    path: 'entcomm/:entityId/:recordId',
    comp: EntcommHome,
    model: require('./models/entcommHome'),
    routes: [
      { path: 'activities', comp: EntcommActivities, model: require('./models/entcommActivities') },
      { path: 'info', comp: EntcommInfo, model: require('./models/entcommInfo') },
      { path: 'docs', comp: EntcommDocs, model: require('./models/entcommDocs') },
      { path: 'receivepay', comp: ContractReceivePay, model: require('./models/contractReceivePay') },
      { path: 'relationtree', comp: CustomerRelationTree, model: require('./models/customerRelationTree') },
      { path: 'affairlist', comp: EntcommAffair, model: require('./models/entcommAffair') },
      { path: 'rel/:relId/:relEntityId', comp: EntcommRel, model: require('./models/entcommRel') },
      { path: 'relationschema', comp: RelationSchema, model: require('./models/relationschema') },
      { path: 'foreignlaw/:country', comp: OutCommerceQueries },
      { path: 'lawcallback', comp: CommerceQueries },
      { path: 'wjxcallback/:custcode', comp: Wjxcallback }
    ]
  },
  { path: 'products', comp: ProductManager, entid: '33240d14-a543-4357-b696-c8cc77f82f7c', model: require('./models/productManager') },
  { path: 'affair-list', comp: AffairList, entid: '00000000-0000-0000-0000-000000000001', model: require('./models/affairList') },
  { path: 'affair/:id', comp: AffairDetail, model: require('./models/affairDetail') },
  { path: 'reportform/:id', comp: ReportForm, model: require('./models/reportForm') },
  { path: 'dynamicchart/:reportId', comp: DynamicChart },
  {
    path: 'weekly', comp: Weekly, entid: '0b81d536-3817-4cbc-b882-bc3e935db845', model: require('./models/weekly'),
    routes: [
      { path: 'myweekly', comp: MyWeekly, model: require('./models/weekly') },
      { path: 'receiveweekly', comp: ReceiveWeekly, model: require('./models/weekly') },
      { path: 'allweekly', comp: AllWeekly, entid: '0b81d536-3817-4cbc-b882-bc3e935db845', model: require('./models/weekly') },
      { path: 'receiveweekly/:recid', comp: ReceiveWeeklyDetail, model: require('./models/weekly') }
    ]
  },
  { path: 'allweekly/detail/:recid', comp: AllWeeklyDetail, model: require('./models/weekly') },
  {
    path: 'daily', comp: Daily, entid: '601cb738-a829-4a7b-a3d9-f8914a5d90f2', model: require('./models/daily'),
    routes: [
      { path: 'mydaily', comp: myDaily, model: require('./models/daily') },
      { path: 'receivedaily', comp: ReceiveDaily, model: require('./models/daily') },
      { path: 'alldaily', comp: AllDaily, entid: '601cb738-a829-4a7b-a3d9-f8914a5d90f2', model: require('./models/daily') },
      { path: 'receivedaily/:recid', comp: ReceiveDailyDetail, model: require('./models/daily') }
    ]
  },
  { path: 'alldaily/detail/:recid', comp: AllDailyDetail, model: require('./models/daily') },
  { path: 'mails', comp: Mails, model: require('./models/mails') },
  { path: 'mailrecovery', comp: MailRecovery, model: require('./models/mailRecovery') },
  { path: 'dbmanager', comp: DbManager, model: require('./models/dbmanager') },
  { path: 'ukqrtzmanager', comp: UkqrtzManager, model: require('./models/ukqrtzmanager') },
  { path: 'nopermission', comp: NoPermission },
  { path: 'schedule', comp: Schedule, model: require('./models/schedule') },
  { path: 'attendanceclassset', comp: AttendanceClassSet, model: require('./models/attendanceClassSet') },
  { path: 'attendancegroupset', comp: AttendanceGroupSet, model: require('./models/attendanceGroupSet') },
  { path: 'attendancegroupset/detail', comp: AttendanceGroupDetail, model: require('./models/attendanceGroupSet') },
  { path: 'desk', comp: Desk, model: require('./models/desk') },
  { path: 'querybusiness', comp: BusinessQuery },
  { path: 'demo', comp: Demo },
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
