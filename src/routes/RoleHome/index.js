import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import LinkTab from '../../components/LinkTab';

function RoleHome({
  dispatch,
  params,
  children,
  checkFunc
}) {
  const roleId = params.id;
  const roleType = params.type;
  const roleName = params.name;
  const tabbar = (
    <LinkTab.Group>
      <LinkTab to={`/role/${roleId}/${roleType}/${roleName}/rule`}>数据权限</LinkTab>
      <LinkTab to={`/role/${roleId}/${roleType}/${roleName}/users`}>已分配人员</LinkTab>
    </LinkTab.Group>
  );
  return (
    <Page title={`角色配置 - ${roleName || ''}`} fixedTop={tabbar} showGoBack goBackPath="/roles">
      {React.cloneElement(children, { checkFunc })}
    </Page>
  );
}

export default connect()(RoleHome);
