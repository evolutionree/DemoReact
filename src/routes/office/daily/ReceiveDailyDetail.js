/**
 * Created by 0291 on 2017/10/31.
 */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import DailyListDetail from './component/DailyListDetail.js';
import Styles from '../weekly/weekly.less';
import { hashHistory } from 'react-router';


function ReceiveDailyDetail({ location, receiveDailyDetailList,
                               routeJump,
                               comment,
                               commentParent,
                              receiveDailyDetailListProtocal }) {
  const dailyDetailData = receiveDailyDetailList && receiveDailyDetailList.detail;
  const detailFields = receiveDailyDetailListProtocal && receiveDailyDetailListProtocal instanceof Array && receiveDailyDetailListProtocal.filter(field => !!field.fieldname);
  return (
    dailyDetailData ? <div className={Styles.wrapContent}>
      <div onClick={routeJump} style={{ cursor: 'pointer' }}>
        <span><i>{`<`}</i>{moment(dailyDetailData.reportdate).format('YYYY年MM月DD日')}</span>
      </div>
      <DailyListDetail dropMenu={[]}
                       data={dailyDetailData}
                       detailFields={detailFields}
                       detailValue={dailyDetailData}
                       onCommentParent={commentParent.bind(this, dailyDetailData.dynamicid, location)}
                       onComment={comment.bind(this, dailyDetailData.dynamicid, location)} commentList={dailyDetailData.commentlist && dailyDetailData.commentlist.detail} />
    </div> : null
  );
}

export default connect(
  state => state.daily,
  dispatch => {
    return {
      comment(id, location, content) {
        dispatch({ type: 'daily/comment', payload: { id, content } });

        const pathReg = /^\/daily\/receivedaily\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'daily/queryReceiveDailyDetail', payload: match && match[1] });
      },
      commentParent(id, location, content, pcommentsid) {
        dispatch({ type: 'daily/comment', payload: { id, content, pcommentsid } });

        const pathReg = /^\/daily\/receivedaily\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        //刷新当前页 数据
        dispatch({ type: 'daily/queryReceiveDailyDetail', payload: match && match[1] });
      },
      routeJump() {
        dispatch({ type: 'daily/putState', payload: { route: '' } });
        hashHistory.push('/daily/receivedaily');
      }
    };
  }
)(ReceiveDailyDetail);
