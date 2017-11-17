import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import LinkTab from '../../components/LinkTab';

function NoticeHome({
  dispatch,
  params,
  children
}) {
  const noticeId = params.id;
  const noticeTitle = params.title;
  const tabbar = (
    <LinkTab.Group>
      <LinkTab to={`/notice/${noticeId}/${noticeTitle}/detail`}>详情</LinkTab>
      <LinkTab to={`/notice/${noticeId}/${noticeTitle}/records`}>发送记录</LinkTab>
    </LinkTab.Group>
  );
  return (
    <Page title={`${noticeTitle || ''}`} fixedTop={tabbar} showGoBack goBackPath="/notice-list">
      {children}
    </Page>

  );
}

export default connect()(NoticeHome);
