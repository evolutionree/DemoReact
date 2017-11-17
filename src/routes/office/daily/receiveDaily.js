/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Styles from '../weekly/weekly.less';
import defaultAvatar from '../../../assets/img_default_avatar.png';
import classnames from 'classnames';
import { hashHistory } from 'react-router';

function ReceiveDaily({ receiveDailylistData, queryReceiveDailyDetail, receiveDailyCurrentPage, receiveDailyTotalPage, loadMoreHandler, user }) {
  return (
    <div>
      {
        receiveDailylistData && receiveDailylistData.map((item, index) => {
          const cls = classnames([Styles.wrapContent, Styles.clearfix]);
          const class_name = classnames([Styles.receiveWeeklyListWrap, Styles.clearfix]);
          const sign_className = classnames([Styles.sign, {
            [Styles.signHide]: item.copyusers && (',' + item.copyusers + ',').indexOf(',' + user.username + ',') > -1 ? false : true
          }]);
          return (
              <div className={cls} key={index}>
                <div>
                  <span>{moment(item.reportdate).format('YYYY年MM月DD日')}</span>
                </div>
                <div className={class_name} onClick={queryReceiveDailyDetail.bind(this, item.recid)}>
                  <div className={Styles.left}>
                    <img
                      src={'/api/fileservice/read?fileid=' + item.usericon}
                      onError={(e) => { e.target.src = defaultAvatar; }} //eslint-disable-line
                     />
                    <div className={Styles.receiveWeeklyUserInfoWrap}>
                      <div>
                        {item.reccreator_name}
                        <span className={sign_className}>{item.copyusers && (',' + item.copyusers + ',').indexOf(',' + user.username + ',') > -1 ? '抄送' : null}</span>
                      </div>
                      <div>{item.deptname}</div>
                    </div>
                  </div>
                  <div className={Styles.right}>{item.reccreated}</div>
                </div>
              </div>
          );
        })
      }
      {
        receiveDailyCurrentPage === receiveDailyTotalPage ? <div className={Styles.loadInfo}>没有更多数据加载了哦</div> : <div className={Styles.loadMore} onClick={loadMoreHandler.bind(this, receiveDailyCurrentPage)}>点击加载更多...</div>
      }
    </div>
  );
}

export default connect(
  state => {
    return { ...state.daily, ...state.app };
  },
  dispatch => {
    return {
      queryReceiveDailyDetail(recid) {
        hashHistory.push(`/daily/receivedaily/${recid}`);
        dispatch({ type: 'daily/putState', payload: { route: `/daily/receivedaily/${recid}` } });
      },
      loadMoreHandler(receiveDailyCurrentPage) {
        dispatch({ type: 'daily/loadMore', payload: { routeType: 'receivedaily', pageCount: receiveDailyCurrentPage + 1 } });
      }
    };
  }
)(ReceiveDaily);
