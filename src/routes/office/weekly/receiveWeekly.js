/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import Styles from './weekly.less';
import defaultAvatar from '../../../assets/img_default_avatar.png';
import CheckBox from './component/CheckBox';
import classnames from 'classnames';
import { groupBy } from './component/unit';
import { hashHistory } from 'react-router';

function ReceiveWeekly({ receiveWeeklistData, queryReceiveWeeklyDetail, receiveWeekCurrentPage, receiveWeekTotalPage, loadMoreHandler, user }) {
  function renderHtml() {
    const cls = classnames([Styles.wrapContent, Styles.clearfix]);

    let html = [];
    let _this = this;
    _.forEach(groupBy(receiveWeeklistData), (value, key) => {
      html.push(
        <div className={cls} key={key}>
          <div>
            <span>{value[0].weekLabel}</span>
          </div>
          {
            value.map((item, index) => {
              const class_name = classnames([Styles.receiveWeeklyListWrap, Styles.clearfix]);
              const sign_className = classnames([Styles.sign, {
                [Styles.signHide]: item.copyusers && (',' + item.copyusers + ',').indexOf(',' + user.username + ',') > -1 ? false : true
              }]);
              return (
                <div key={key + '-' + index} className={class_name} onClick={queryReceiveWeeklyDetail.bind(_this, item.recid, value[0].weekLabel)}>
                  <div className={Styles.left}>
                    <img
                      src={'/api/fileservice/read?fileid=' + item.usericon + '&filetype=3'}
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
                  <div className={Styles.right}>
                    <CheckBox checked={item.isweekly === 1 ? true : false} title="周计划" />
                    <CheckBox checked={item.issummary === 1 ? true : false} title="周总结" />
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    });
    return html;
  }

  return (
    <div>
      {
        receiveWeeklistData instanceof Array && receiveWeeklistData.length > 0 ? renderHtml() : null
      }
      {
        receiveWeekCurrentPage === receiveWeekTotalPage ? <div className={Styles.loadInfo}>没有更多数据加载了哦</div> : <div className={Styles.loadMore} onClick={loadMoreHandler.bind(this, receiveWeekCurrentPage)}>点击加载更多...</div>
      }
    </div>
  );
}

export default connect(
  state => {
    return { ...state.weekly, ...state.app };
  },
  dispatch => {
    return {
      queryReceiveWeeklyDetail(recid, weekLabel) {
        hashHistory.push(`/weekly/receiveweekly/${recid}?weeklabel=${encodeURI(weekLabel)}`);
        dispatch({ type: 'weekly/putState', payload: { route: `/weekly/receiveweekly/${recid}?weeklabel=${encodeURI(weekLabel)}` } });
      },
      loadMoreHandler(receiveWeekCurrentPage) {
        dispatch({ type: 'weekly/loadMore', payload: { routeType: 'receiveweekly', pageCount: receiveWeekCurrentPage + 1 } });
      }
    };
  }
)(ReceiveWeekly);
