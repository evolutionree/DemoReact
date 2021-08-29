/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import Page from '../../../components/Page';
import LinkTab from '../../../components/LinkTab';
import { Button, message } from "antd";
import EntcommAddModal from '../../../components/EntcommAddModal';
import EntcommEditModal from '../../../components/EntcommEditModal';
import EntcommDetailModal from '../../../components/EntcommDetailModal';
import { GetArgsFromHref } from '../../../utils/index.js';
import { hashHistory } from 'react-router';


function Weekly({ checkFunc, routeChange, location, children, addWeekly, showModals, addWeeklyModalCancel, addWeeklyModalSave, editModalSave, myWeeklyOrSummaryRecid, addSummaryModalCancel, addSummaryModalSave, route, yearWeekData }) {
  function getTimeStamp(timeStr) {
    const timeStamp = Date.parse(new Date(timeStr));
    return timeStamp / 1000;
  }

  let currentWeek;
  if (yearWeekData && yearWeekData instanceof Array) {
    for (let i = 0; i < yearWeekData.length; i++) {
      if (getTimeStamp(new Date()) < getTimeStamp(yearWeekData[i].weekEnd)) {
        currentWeek = yearWeekData[i].value;
        break;
      }
    }
  }

  if (children.props.route.path === 'myweekly') {
    if (!checkFunc('MyWeekReport') && checkFunc('MyWeekReport') !== undefined) {
      //跳吧
      routeChange('receiveweekly');
    }
  } else if (children.props.route.path === 'receiveweekly') {
    if (!checkFunc('ReceiveWeekReport') && checkFunc('ReceiveWeekReport') !== undefined) {
      //跳吧
      routeChange('allweekly');
    }
  } else if (children.props.route.path === 'allweekly') {
    if (!checkFunc('AllWeekReport') && checkFunc('AllWeekReport') !== undefined) {
      //跳吧
      if (checkFunc('MyWeekReport') && checkFunc('MyWeekReport') !== undefined) {
        routeChange('myweekly');
      } else if (checkFunc('ReceiveWeekReport') && checkFunc('ReceiveWeekReport') !== undefined) {
        routeChange('receiveweekly');
      } else if (checkFunc('ReceiveWeekReport') !== undefined) {
        message.error('当前用户没有权限查看周计划,自动跳转到首页');
        hashHistory.push('/home');
      }
    }
  }
  return (
    <Page title="周报"
          contentStyle={children.props.route.path === 'allweekly' ? null : { background: '#e7ecef', border: 'none', padding: 0, boxShadow: 'none' }}
          contentStyleFree={false}
          fixedTop={(
            <div>
              <LinkTab.Group>
                <LinkTab to='/weekly/myweekly' hide={!checkFunc('MyWeekReport')}>我的周报</LinkTab>
                <LinkTab to={ route ? route : '/weekly/receiveweekly'} hide={!checkFunc('ReceiveWeekReport')}>收到的周报</LinkTab>
                <LinkTab to='/weekly/allweekly' hide={!checkFunc('AllWeekReport')}>全部周报</LinkTab>
              </LinkTab.Group>
            </div>
          )}
    >
      <div style={{ textAlign: 'right', display: children.props.route.path === 'allweekly' ? 'none' : 'block' }}>
        {
          checkFunc('EntityDataAdd') ? <Button type="primary" icon="edit" onClick={addWeekly} style={{ marginRight: '20px' }}>写周计划</Button> : null
        }
      </div>
      {children}
      <EntcommAddModal
        modalTitle="新增周计划"
        visible={showModals === 'addWeekly' ? true : false}
        entityId="0b81d536-3817-4cbc-b882-bc3e935db845"
        cancel={addWeeklyModalCancel}
        done={addWeeklyModalSave.bind(this, children.props.route.path)}
        initFormData={{ reportdate: currentWeek }} //设置表单初始值
      />
      <EntcommAddModal
        modalTitle="新增周总结"
        visible={showModals === 'addSummary' ? true : false}
        entityId="fcc648ae-8817-48b7-b1d7-49ed4c24316b"
        refRecord={myWeeklyOrSummaryRecid}
        cancel={addSummaryModalCancel}
        done={addSummaryModalSave}
        refEntity="0b81d536-3817-4cbc-b882-bc3e935db845"
      />
      <EntcommEditModal
        title={showModals === 'editWeekly' ? '编辑周计划' : '编辑周总结'}
        visible={showModals && (showModals === 'editSummary' || showModals === 'editWeekly') ? true : false}
        entityId={showModals === 'editWeekly' ? '0b81d536-3817-4cbc-b882-bc3e935db845' : 'fcc648ae-8817-48b7-b1d7-49ed4c24316b'}
        recordId={myWeeklyOrSummaryRecid}
        cancel={addSummaryModalCancel}
        done={editModalSave.bind(this, children.props.route.path, location)}
      />
      <EntcommDetailModal title={showModals === 'viewWeeklyDetail' ? '查看周计划' : '查看周总结'}
                          visible={showModals && (showModals === 'viewWeeklyDetail' || showModals === 'viewSummaryDetail') ? true : false}
                          entityId={showModals === 'viewWeeklyDetail' ? '0b81d536-3817-4cbc-b882-bc3e935db845' : 'fcc648ae-8817-48b7-b1d7-49ed4c24316b'}
                          recordId={myWeeklyOrSummaryRecid}
                          onCancel={addSummaryModalCancel}
                          onOk={addSummaryModalCancel} />
    </Page>
  );
}

export default connect(
  state => state.weekly,
  dispatch => {
    return {
      routeChange(param) {
        hashHistory.push('/weekly/'+ param);
      },
      addWeekly() {
        dispatch({ type: 'weekly/showModals', payload: 'addWeekly' });
      },
      addWeeklyModalCancel() {
        dispatch({ type: 'weekly/showModals', payload: '' });
      },
      addWeeklyModalSave(reloadPage) {
        dispatch({ type: 'weekly/showModals', payload: '' });
        if (reloadPage === 'myweekly' || reloadPage === 'receiveweekly' || reloadPage === 'allweekly') {
          dispatch({ type: 'weekly/init', payload: reloadPage });
        } else { //收到的周报 详情页  操作 新增周报，不需要做刷新处理

        }
      },
      addSummaryModalCancel() {
        dispatch({ type: 'weekly/showModals', payload: '' });
      },
      addSummaryModalSave() {
        dispatch({ type: 'weekly/showModals', payload: '' });
        dispatch({ type: 'weekly/init', payload: 'myweekly' });
      },

      editModalSave(reloadPage, location) {
        dispatch({ type: 'weekly/showModals', payload: '' });
        if (reloadPage === 'myweekly') { //我的周报 页
          dispatch({ type: 'weekly/init', payload: 'myweekly' });
        } else { //收到的周报详情页
          const pathReg = /^\/weekly\/receiveweekly\/([^/]+)/;
          const match = location.pathname.match(pathReg);
          //刷新当前页 数据
          dispatch({ type: 'weekly/queryReceiveWeeklyDetail', payload: match && match[1] });
          dispatch({ type: 'weekly/putState', payload: { current_ReceiveWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
        }
      }
    };
  }
)(Weekly);
