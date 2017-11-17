import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import LinkTab from '../../components/LinkTab';

function VocationHome({
  dispatch,
  params,
  children,
  checkFunc
}) {
  const vocationId = params.id;
  const vocationName = params.name;
  const tabbar = (
    <LinkTab.Group>
      <LinkTab to={`/vocation/${vocationId}/${vocationName}/rule`}>功能权限</LinkTab>
      <LinkTab to={`/vocation/${vocationId}/${vocationName}/users`}>已分配人员</LinkTab>
    </LinkTab.Group>
  );
  return (
    <Page title={`职能配置 - ${vocationName || ''}`} fixedTop={tabbar} showGoBack goBackPath="/vocations">
      {React.cloneElement(children, { checkFunc })}
    </Page>
  );
}

export default connect()(VocationHome);
