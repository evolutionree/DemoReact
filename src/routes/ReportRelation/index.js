import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import ReportRelationMain from './ReportRelationMain';
import ReportRelationDetail from './ReportRelationDetail';
import styles from './index.less';

function ReportRelation(props) {
  return (
    <Page title="统计函数定义">
      <ReportRelationMain {...props} />
      <ReportRelationDetail {...props} />
    </Page>
  );
}

export default connect(state => state.reportrelation)(ReportRelation);

