import React from 'react';
import { connect } from 'dva';
import LinkTab from '../../components/LinkTab';
import Page from '../../components/Page';

function WorkflowHome({
    flowName,
    params: { id: flowId },
    children
  }) {
  return (
    <Page
      title={`流程名称-${flowName}`}
      goBackPath="/workflow"
      showGoBack
      fixedTop={(
        <LinkTab.Group>
          <LinkTab to={`/workflow/${flowId}/design`}>流程设置</LinkTab>
          {/*<LinkTab to={`/workflow/${flowId}/content`}>审批内容</LinkTab>*/}
          {/*<LinkTab to={`/workflow/${flowId}/fields`}>状态更新</LinkTab>*/}
        </LinkTab.Group>
      )}
    >
      {children}
    </Page>
  );
}

export default connect(
  state => state.workflowHome
)(WorkflowHome);
