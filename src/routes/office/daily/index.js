/**
 * Created by 0291 on 2017/10/30.
 */
import React from 'react';
import { connect } from 'dva';
import Page from '../../../components/Page';
import LinkTab from '../../../components/LinkTab';
import { Button, message } from "antd";
import EntcommAddModal from '../../../components/EntcommAddModal';
import EntcommEditModal from '../../../components/EntcommEditModal';
import EntcommDetailModal from '../../../components/EntcommDetailModal';
import { hashHistory } from 'react-router';
import AdvanceSearchModal from './component/AdvanceSearchModal';


function Daily({ checkFunc, routeChange, location, children, addDaily, showModals, modalCancel, addDailyModalSave, editModalSave, myDailyOrSummaryRecid, route, yearWeekData }) {
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


  if (children.props.route.path === 'mydaily') {
    if (!checkFunc('MyDayReport') && checkFunc('MyDayReport') !== undefined) {
      //跳吧
      routeChange('receivedaily');
    }
  } else if (children.props.route.path === 'receivedaily') {
    if (!checkFunc('ReceiveDayReport') && checkFunc('ReceiveDayReport') !== undefined) {
      //跳吧
      routeChange('alldaily');
    }
  } else if (children.props.route.path === 'alldaily') {
    if (!checkFunc('AllDayReport') && checkFunc('AllDayReport') !== undefined) {
      //跳吧
      if (checkFunc('MyDayReport') && checkFunc('MyDayReport') !== undefined) {
        routeChange('mydaily');
      } else if (checkFunc('ReceiveDayReport') && checkFunc('ReceiveDayReport') !== undefined) {
        routeChange('receivedaily');
      } else if (checkFunc('ReceiveDayReport') !== undefined) {
        message.error('当前用户没有权限查看周计划,自动跳转到首页');
        hashHistory.push('/home');
      }
    }
  }

  return (
    <Page title="日报"
          contentStyle={children.props.route.path === 'alldaily' ? null : { background: '#e7ecef', border: 'none', padding: 0, boxShadow: 'none' }}
          contentStyleFree={false}
          fixedTop={(
            <div>
              <LinkTab.Group>
                <LinkTab to='/daily/mydaily' hide={!checkFunc('MyDayReport')}>我的日报</LinkTab>
                <LinkTab to={ route ? route : '/daily/receivedaily'} hide={!checkFunc('ReceiveDayReport')}>收到的日报</LinkTab>
                <LinkTab to='/daily/alldaily' hide={!checkFunc('AllDayReport')}>全部日报</LinkTab>
              </LinkTab.Group>
            </div>
          )}
    >
      <div style={{ textAlign: 'right', display: children.props.route.path === 'alldaily' ? 'none' : 'block' }}>
        {
          checkFunc('EntityDataAdd') ? <Button type="primary" icon="edit" onClick={addDaily} style={{ marginRight: '20px' }}>写日报</Button> : null
        }
      </div>
      {children}
      <EntcommAddModal
        modalTitle="新增日报"
        visible={showModals === 'addDaily' ? true : false}
        entityId="601cb738-a829-4a7b-a3d9-f8914a5d90f2"
        cancel={modalCancel}
        done={addDailyModalSave.bind(this, children.props.route.path)}

      />
      <EntcommEditModal
        title="编辑日报"
        visible={showModals && showModals === 'editDaily' ? true : false}
        entityId="601cb738-a829-4a7b-a3d9-f8914a5d90f2"
        recordId={myDailyOrSummaryRecid}
        cancel={modalCancel}
        done={editModalSave.bind(this, children.props.route.path, location)}
      />
      <EntcommDetailModal title="查看日报"
                          visible={showModals && showModals === 'viewDailyDetail' ? true : false}
                          entityId="601cb738-a829-4a7b-a3d9-f8914a5d90f2"
                          recordId={myDailyOrSummaryRecid}
                          onCancel={modalCancel} />
      <AdvanceSearchModal visible={showModals} entityId="601cb738-a829-4a7b-a3d9-f8914a5d90f2" />
    </Page>
  );
}

export default connect(
  state => state.daily,
  dispatch => {
    return {
      routeChange(param) {
        hashHistory.push('/daily/' + param);
      },
      addDaily() {
        dispatch({ type: 'daily/showModals', payload: 'addDaily' });
      },
      modalCancel() {
        dispatch({ type: 'daily/showModals', payload: '' });
      },
      addDailyModalSave(reloadPage) {
        dispatch({ type: 'daily/showModals', payload: '' });
        if (reloadPage === 'mydaily' || reloadPage === 'receivedaily' || reloadPage === 'alldaily') {
          dispatch({ type: 'daily/init', payload: reloadPage });
        } else { //收到的日报 详情页  操作 新增日报，不需要做刷新处理

        }
      },
      editModalSave(reloadPage, location) {
        dispatch({ type: 'daily/showModals', payload: '' });
        if (reloadPage === 'mydaily') { //我的周报 页
          dispatch({ type: 'daily/init', payload: 'mydaily' });
        } else { //收到的周报详情页
          const pathReg = /^\/daily\/receivedaily\/([^/]+)/;
          const match = location.pathname.match(pathReg);
          //刷新当前页 数据
          dispatch({ type: 'daily/queryReceiveDailyDetail', payload: match && match[1] });
        }
      }
    };
  }
)(Daily);
