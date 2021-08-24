/**
 * Created by 0291 on 2017/10/30.
 */
import React from 'react';
import { connect } from 'dva';
import WeeklyListDetail from './component/WeeklyListDetail.js';
import Styles from './weekly.less';
import { hashHistory } from 'react-router';
import { GetArgsFromHref } from '../../../utils/index.js';


function AllWeeklyDetail({
                           location,
                           allWeeklyDetailList,
                           allWeeklyDetailWeeklyProtocal,
                           allWeeklyDetailSummaryProtocal,
                           comment,
                           commentParent,
                           current_AllWeekly_Detail_WeekLable,
                           routeJump
                         }) {
  const weeklyData = allWeeklyDetailList && allWeeklyDetailList.detail[0];
  const summaryData = allWeeklyDetailList && allWeeklyDetailList.summary[0];

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
        <span><i>{`<`}</i>{current_AllWeekly_Detail_WeekLable}</span>
      </div>
      {
        listData.map((item, index) => {
          const detailFields = item.weektype === 0 ? allWeeklyDetailWeeklyProtocal && allWeeklyDetailWeeklyProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate') : allWeeklyDetailSummaryProtocal && allWeeklyDetailSummaryProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate');
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

        const pathReg = /^\/allweekly\/detail\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'weekly/queryAllWeeklyDetail', payload: match && match[1] });
        dispatch({ type: 'weekly/putState', payload: { current_AllWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
      },
      commentParent(id, location, content, pcommentsid) {
        dispatch({ type: 'weekly/comment', payload: { id, content, pcommentsid } });

        const pathReg = /^\/allweekly\/detail\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'weekly/queryAllWeeklyDetail', payload: match && match[1] });
        dispatch({ type: 'weekly/putState', payload: { current_AllWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
      },
      routeJump() {
        hashHistory.push('/weekly/allweekly');
      }
    };
  }
)(AllWeeklyDetail);
