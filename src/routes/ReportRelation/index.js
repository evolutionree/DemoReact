import React from 'react';
import Page from '../../components/Page';

const ReportRelation = (props) => {
  const { children } = props;
  return (
    <Page title="汇报关系">
      {children}
    </Page>
  );
};

export default ReportRelation;
