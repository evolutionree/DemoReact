/**
 * Created by 0291 on 2017/9/27.
 */
import React from 'react';
import { connect } from 'dva';
import WeeklyListDetail from './component/WeeklyListDetail.js';
import Styles from './weekly.less';
import { hashHistory } from 'react-router';
import { GetArgsFromHref } from '../../../utils/index.js';


function ReceiveWeeklyDetail({ location, receiveWeeklyDetailList,
                               current_ReceiveWeekly_Detail_WeekLable,
                               routeJump,
                               comment,
                               commentParent,
                               receiveWeeklyDetailWeeklyProtocal,
                               receiveWeeklyDetailSummaryProtocal }) {
  const weeklyData = receiveWeeklyDetailList && receiveWeeklyDetailList.detail[0];
  const summaryData = receiveWeeklyDetailList && receiveWeeklyDetailList.summary[0];

  const listData = [];
  if (weeklyData) { // 周计划
    weeklyData.weektype = 0;
    listData.push(weeklyData);
  }
  if (summaryData) { //周总结
    summaryData.weektype = 1;
    summaryData.viewusers_name = weeklyData.viewusers_name;
    summaryData.copyusers_name = weeklyData.copyusers_name;
    listData.push(summaryData);
  }


  return (
    <div className={Styles.wrapContent}>
      <div onClick={routeJump} style={{ cursor: 'pointer' }}>
        <span><i>{`<`}</i>{current_ReceiveWeekly_Detail_WeekLable}</span>
      </div>
      {
        listData.map((item, index) => {
          const detailFields = item.weektype === 0 ? receiveWeeklyDetailWeeklyProtocal && receiveWeeklyDetailWeeklyProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate') : receiveWeeklyDetailSummaryProtocal && receiveWeeklyDetailSummaryProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate');
          return <WeeklyListDetail dropMenu={summaryData?['详情', '编辑']:['详情', '编辑', '周总结']}
                                   key={index}
                                   data={item}
                                   detailFields={detailFields}
                                   detailValue={item}
                                   onCommentParent={commentParent.bind(this, item.dynamicid, location)}
                                   onComment={comment.bind(this, item.dynamicid, location)} commentList={item.commentlist && item.commentlist.detail} />;
        })
      }
    </div>
  );
}

export default connect(
  state => state.weekly,
  dispatch => {
    return {
      comment(id, location, content) {
        dispatch({ type: 'weekly/comment', payload: { id, content } });

        const pathReg = /^\/weekly\/receiveweekly\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'weekly/queryReceiveWeeklyDetail', payload: match && match[1] });
        dispatch({ type: 'weekly/putState', payload: { current_ReceiveWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
      },
      commentParent(id, location, content, pcommentsid) {
        dispatch({ type: 'weekly/comment', payload: { id, content, pcommentsid } });

        const pathReg = /^\/weekly\/receiveweekly\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'weekly/queryReceiveWeeklyDetail', payload: match && match[1] });
        dispatch({ type: 'weekly/putState', payload: { current_ReceiveWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
      },
      routeJump() {
        dispatch({ type: 'weekly/putState', payload: { route: '' } });
        hashHistory.push('/weekly/receiveweekly');
      }
    };
  }
)(ReceiveWeeklyDetail);
