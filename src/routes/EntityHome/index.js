import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import LinkTab from '../../components/LinkTab';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import { checkIsDev } from '../../utils';

const tabVisibleMap = {
  0: [1, 2, 3, 4, 5, 6, 7],
  1: [2, 3],
  2: [2, 3, 4, 6],
  3: [0, 2, 3, 6]
};
function EntityConfig({
  dispatch,
  entityName,
  entityInfo,
  params,
  showBtns,
  children
}) {
  const entityId = params.id;
  const entityType = params.type;
  /*<LinkTab key="7" to={`/entity-config/${entityId}/${entityType}/attenceset`}>外勤设置</LinkTab>*/
  const tabs = [
    <LinkTab key="0" to={`/entity-config/${entityId}/${entityType}/dynamic-visible`}>可见规则</LinkTab>,
    <LinkTab key="1" to={`/entity-config/${entityId}/${entityType}/types`}>类型</LinkTab>,
    <LinkTab key="2" to={`/entity-config/${entityId}/${entityType}/fields`}>字段</LinkTab>,
    <LinkTab key="3" to={`/entity-config/${entityId}/${entityType}/rules`}>字段属性设置</LinkTab>,
    <LinkTab key="4" to={`/entity-config/${entityId}/${entityType}/menus`}>常用筛选列表</LinkTab>,
    <LinkTab key="5" to={`/entity-config/${entityId}/${entityType}/tabs`}>页签设置</LinkTab>
  ];
  const tabbar = (
    <LinkTab.Group>
      {tabVisibleMap[entityType].map(tabIndex => tabs[tabIndex])}
      {checkIsDev() && <LinkTab to={`/entity-config/${entityId}/${entityType}/buttons`}>按钮设置</LinkTab>}
      {(entityType == 0 || entityType == 2) && checkIsDev() && <LinkTab to={`/entity-config/${entityId}/${entityType}/func`}>功能设置</LinkTab>}
      {checkIsDev() && <LinkTab to={`/entity-config/${entityId}/${entityType}/pages`}>特别页面</LinkTab>}
      {checkIsDev() && <LinkTab to={`/entity-config/${entityId}/${entityType}/scripts`}>全局JS</LinkTab>}
      {checkIsDev() && <LinkTab to={`/entity-config/${entityId}/${entityType}/extendconfig`}>扩展配置</LinkTab>}
    </LinkTab.Group>
  );
  return (
    <Page title={<span>实体配置 - {getIntlText('entityname', entityInfo)}</span>} fixedTop={tabbar} showGoBack goBackPath="/entity">
      {children}
    </Page>
  );
}

export default connect(state => state.entityHome)(EntityConfig);
