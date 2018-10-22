/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import WeeklyListDetail from './component/WeeklyListDetail.js';
import _ from 'lodash';
import { groupBy } from './component/unit';
import Styles from './weekly.less';


function MyWeekly({ receiveWeeklyDetailWeeklyProtocal, receiveWeeklyDetailSummaryProtocal, myWeeklistData, comment, commentParent, myWeekTotalPage, myWeekCurrentPage, loadMoreHandler }) {
  function renderHtml() {
    let html = [];
    _.forEach(groupBy(myWeeklistData), (value, key) => {
      let pessionSummary = true;
      for (let i = 0; i < value.length; i++) {
        if (value[i].weektype === 1) {
          pessionSummary = false;
          break;
        }
      }
      html.push(
        <div className={Styles.wrapContent} key={key}>
          <div>
            <span>{value[0].weekLabel}</span>
          </div>
          {
            value.map((item, index) => {
              const detailData = item.detail;
              const detailFields = item.weektype === 0 ? receiveWeeklyDetailWeeklyProtocal && receiveWeeklyDetailWeeklyProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate') :
                receiveWeeklyDetailSummaryProtocal && receiveWeeklyDetailSummaryProtocal.filter(field => !!field.fieldname && field.fieldname !== 'reportdate');
              return <WeeklyListDetail dropMenu={pessionSummary ? ['详情', '编辑', '周总结'] : ['详情', '编辑']}
                                       key={index}
                                       data={item}
                                       onCommentParent={commentParent.bind(this, item.detail instanceof Array && item.detail.length > 0 && item.detail[0].dynamicid)}
                                       onComment={comment.bind(this, item.detail instanceof Array && item.detail.length > 0 && item.detail[0].dynamicid)}
                                       detailFields={detailFields}
                                       detailValue={item.tempdata}
                                       commentList={detailData instanceof Array && detailData.length > 0 && detailData[0].commentlist && detailData[0].commentlist.detail} />;
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
        myWeeklistData instanceof Array && myWeeklistData.length > 0 ? renderHtml() : null
      }
      {
        myWeekCurrentPage === myWeekTotalPage ? <div className={Styles.loadInfo}>没有更多数据加载了哦</div> : <div className={Styles.loadMore} onClick={loadMoreHandler.bind(this, myWeekCurrentPage)}>点击加载更多...</div>
      }
    </div>
  );
}

export default connect(
  state => state.weekly,
  dispatch => {
    return {
      comment(id, content) {
        dispatch({ type: 'weekly/comment', payload: { id, content } });
        dispatch({ type: 'weekly/init', payload: 'myweekly' });
      },
      commentParent(id, content, pcommentsid) {
        dispatch({ type: 'weekly/comment', payload: { id, content, pcommentsid } });
        dispatch({ type: 'weekly/init', payload: 'myweekly' });
      },
      loadMoreHandler(myWeekCurrentPage) {
        dispatch({ type: 'weekly/loadMore', payload: { routeType: 'myweekly', pageCount: myWeekCurrentPage + 1 } });
      }
    };
  }
)(MyWeekly);
