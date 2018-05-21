/* eslint-disable import/no-dynamic-require */
import React from 'react';
import { Router, Route, IndexRoute, Redirect, IndexRedirect } from 'dva/router';

import connectPermission from './models/connectPermission';

import App from './routes/App';
import NoFoundPage from './routes/NoFoundPage';
import NoPermission from './routes/NoPermission';

import Structure from './routes/Structure';

import EntityList from './routes/EntityList';
import EntityHome from './routes/EntityHome';
import EntityTypes from './routes/EntityHome/views/EntityTypes';
import EntityFields from './routes/EntityHome/views/EntityFields';
import EntityRules from './routes/EntityHome/views/EntityRules';
import ExtendConfig from './routes/EntityHome/views/ExtendConfig';
import EntityAttenceSet from './routes/EntityHome/views/EntityAttenceSet';
import EntityMenus from './routes/EntityHome/views/EntityMenus';
import EntityTabs from './routes/EntityHome/views/EntityTabs';
import EntityFunc from './routes/EntityHome/views/EntityFunc';
import EntityDynamicVisible from './routes/EntityHome/views/EntityDynamicVisible';
import EntityButtons from './routes/EntityHome/views/EntityButtons';
import EntityPages from './routes/EntityHome/views/EntityPages';
import EntityScripts from './routes/EntityHome/views/EntityScripts';

import RoleGroups from './routes/RoleGroupList';
import RoleList from './routes/RoleList';
import RoleHome from './routes/RoleHome';
import RoleRule from './routes/RoleHome/views/RoleRule';
import RoleUsers from './routes/RoleHome/views/RoleUsers';

import VocationList from './routes/VocationList';
import VocationHome from './routes/VocationHome';
import VocationRule from './routes/VocationHome/views/VocationRule';
import VocationUsers from './routes/VocationHome/views/VocationUsers';

import DSourceList from './routes/DataSourceList';
import DataSourceHome from './routes/DataSourceHome';

import OperateLog from './routes/OperateLog';

import DicPage from './routes/Dic';
import DicTypePage from './routes/DicType';
import LicenseInfo from './routes/LicenseInfo';

import WorkflowList from './routes/WorkflowList';
import WorkflowHome from './routes/WorkflowHome';
import WorkflowDesign from './routes/WorkflowHome/views/WorkflowDesign';

import ProductManager from './routes/ProductManager';

import SystemNotifications from './routes/SystemNotifications';

import SaleStage from './routes/ServiceParams/SaleStage/index';
import SaleStageDetailSet from './routes/ServiceParams/SaleStage/detailSet';

import TargetSet from './routes/ServiceParams/TargetSetting/index';
import TargetSetDetailSet from './routes/ServiceParams/TargetSetting/detailSet';

import ReminderList from './routes/ReminderList';
import ReminderDetail from './routes/ReminderDetail';

import CollectorList from './routes/CollectorList';
import CollectorDetail from './routes/CollectorDetail';

import EntcommList from './routes/EntcommList';
import EntcommApplication from './routes/EntcommApplication';
import EntcommHome from './routes/EntcommHome';
import EntcommActivities from './routes/EntcommHome/views/EntcommActivities';
import EntcommInfo from './routes/EntcommHome/views/EntcommInfo';
import EntcommDocs from './routes/EntcommHome/views/EntcommDocs';
import EntcommRel from './routes/EntcommHome/views/EntcommRel';

import ContractReceivePay from './routes/ContractHome/ReceivePay';

import CustomerRelationTree from './routes/CustomerHome/RelationTree';

import DbManager from './routes/DbManager/index';
import UkqrtzManager from './routes/UkqrtzManager/index';
import PrintTemplate from './routes/PrintTemplate';
import MailRecovery from './routes/MailRecovery';

import PasswordStrategy from './routes/Configure/passwordStrategy';

import TransferScheme from './routes/Configure/transferScheme';

const appRoutes = [
  { path: 'NoFoundPage', comp: NoFoundPage }, //进入系统会做菜单权限判断 Router的原因 首次让其先进入一个无任何Ajax的页面
  { path: 'structure', comp: Structure, entid: '3d77dfd2-60bb-4552-bb69-1c3e73cf4095', model: require('./models/structure') },
  { path: 'entity', comp: EntityList, entid: '00000000-0000-0000-0000-000000000010', model: require('./models/entityList') },
  { path: 'entity-config/:id/:type',
    comp: EntityHome,
    entid: '00000000-0000-0000-0000-000000000010',
    model: require('./models/entityHome'),
    children: [
      { path: 'fields', comp: EntityFields, model: require('./models/entityFields') },
      { path: 'types', comp: EntityTypes, model: require('./models/entityTypes') },
      { path: 'rules', comp: EntityRules, model: require('./models/entityRules') },
      { path: 'extendconfig', comp: ExtendConfig, model: require('./models/extendconfig') },
      { path: 'attenceset', comp: EntityAttenceSet, model: require('./models/entityAttenceSet') },
      { path: 'menus', comp: EntityMenus, model: require('./models/entityMenus') },
      { path: 'tabs', comp: EntityTabs, model: require('./models/entityTabs') },
      { path: 'func', comp: EntityFunc, model: require('./models/entityFunc') },
      { path: 'dynamic-visible', comp: EntityDynamicVisible, model: require('./models/entityDynamicVisible') },
      { path: 'buttons', comp: EntityButtons, model: require('./models/entityButtons') },
      { path: 'pages', comp: EntityPages, model: require('./models/entityPages') },
      { path: 'scripts', comp: EntityScripts, model: require('./models/entityScripts') }
    ] },
  { path: 'role-groups', comp: RoleGroups, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/roleGroups') },
  { path: 'roles', comp: RoleList, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/roleList') },
  { path: 'role/:id/:type/:name',
    comp: RoleHome,
    entid: '00000000-0000-0000-0000-000000000012',
    children: [
      { path: 'rule', comp: RoleRule, model: require('./models/roleRule') },
      { path: 'users', comp: RoleUsers, model: require('./models/roleUsers') }
    ] },
  { path: 'vocations', comp: VocationList, entid: '00000000-0000-0000-0000-000000000012', model: require('./models/vocationList') },
  { path: 'vocation/:id/:name',
    comp: VocationHome,
    entid: '00000000-0000-0000-0000-000000000012',
    children: [
      { path: 'rule', comp: VocationRule, model: require('./models/vocationRule') },
      { path: 'users', comp: VocationUsers, model: require('./models/vocationUsers') }
    ] },
  { path: 'data-source', comp: DSourceList, entid: '00000000-0000-0000-0000-000000000011', model: require('./models/dSourceList') },
  { path: 'dsource/:id', comp: DataSourceHome, entid: '00000000-0000-0000-0000-000000000011', model: require('./models/dSourceHome') },
  { path: 'operate-log', comp: OperateLog },
  { path: 'dic', comp: DicPage, entid: '00000000-0000-0000-0000-000000000015' },
  { path: 'dictype', comp: DicTypePage, entid: '00000000-0000-0000-0000-000000000012' },
  { path: 'licenseinfo', comp: LicenseInfo, model: require('./models/licenseInfo') },
  { path: 'workflow', comp: WorkflowList, model: require('./models/workflowList') },
  { path: 'workflow/:id',
    comp: WorkflowHome,
    model: require('./models/workflowHome'),
    children: [
      { path: 'design', comp: WorkflowDesign, model: require('./models/workflowDesign') }
    ] },
  { path: 'products', comp: ProductManager, entid: '33240d14-a543-4357-b696-c8cc77f82f7c', model: require('./models/productManager') },
  { path: 'systemnotifications', comp: SystemNotifications, model: require('./models/systemNotifications') },
  { path: 'salestage', comp: SaleStage, entid: '00000000-0000-0000-0000-000000000017', model: require('./models/saleStage') },
  { path: 'salestage/detail', comp: SaleStageDetailSet, entid: '00000000-0000-0000-0000-000000000017', model: require('./models/saleStageDetailSet') },
  { path: 'targetsetting', comp: TargetSet, entid: '00000000-0000-0000-0000-000000000018', model: require('./models/targetSetting') },
  { path: 'targetsetting/:normtypeid', comp: TargetSetDetailSet, entid: '00000000-0000-0000-0000-000000000018', model: require('./models/targetSettingDetailSet') },
  { path: 'reminder-list', comp: ReminderList, model: require('./models/reminderList') },
  { path: 'reminder/:id/:name', comp: ReminderDetail, model: require('./models/reminderDetail') },
  { path: 'collector-list', comp: CollectorList, model: require('./models/collectorList') },
  { path: 'collector/:id/:name', comp: CollectorDetail, model: require('./models/collectorDetail') },
  { path: 'entcomm-list/:id', comp: EntcommList, model: require('./models/entcommList') },
  { path: 'entcomm-application/:id', comp: EntcommApplication, model: require('./models/entcommApplication') },
  { path: 'entcomm/:entityId/:recordId',
    comp: EntcommHome,
    model: require('./models/entcommHome'),
    children: [
      { path: 'activities', comp: EntcommActivities, model: require('./models/entcommActivities') },
      { path: 'info', comp: EntcommInfo, model: require('./models/entcommInfo') },
      { path: 'docs', comp: EntcommDocs, model: require('./models/entcommDocs') },
      { path: 'receivepay', comp: ContractReceivePay, model: require('./models/contractReceivePay') },
      { path: 'relationtree', comp: CustomerRelationTree, model: require('./models/customerRelationTree') },
      { path: 'rel/:relId/:relEntityId', comp: EntcommRel, model: require('./models/entcommRel') }
    ] },
  { path: 'dbmanager', comp: DbManager, model: require('./models/dbmanager') },
  { path: 'mailrecovery', comp: MailRecovery, model: require('./models/mailRecovery') },
  { path: 'ukqrtzmanager', comp: UkqrtzManager, model: require('./models/ukqrtzmanager') },
  { path: 'print-template', comp: PrintTemplate, model: require('./models/printTemplate') },
  { path: 'passwordstrategy', comp: PasswordStrategy, model: require('./models/passwordstrategy') },
  { path: 'transferscheme', comp: TransferScheme, model: require('./models/transferscheme') },
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
