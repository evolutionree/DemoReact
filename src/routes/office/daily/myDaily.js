/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import DailyListDetail from './component/DailyListDetail.js';
import _ from 'lodash';
import { groupBy } from '../weekly/component/unit';
import Styles from '../weekly/weekly.less';


function MyDaily({ allDailyDetailListProtocal, myDailylistData, comment, commentParent, myDailyTotalPage, myDailyCurrentPage, loadMoreHandler }) {
  const detailFields = allDailyDetailListProtocal && allDailyDetailListProtocal instanceof Array && allDailyDetailListProtocal.filter(field => !!field.fieldname);
  function renderHtml() {
    let html = [];
    _.forEach(groupBy(myDailylistData), (value, key) => {
      html.push(
        <div className={Styles.wrapContent} key={key}>
          <div>
            <span>{value[0].weekLabel}</span>
          </div>
          {
            value.map((item, index) => {
              const detailData = item.detail;
              return (
                <DailyListDetail dropMenu={['详情', '编辑']}
                                 key={index}
                                 data={item}
                                 onCommentParent={commentParent.bind(this, detailData.dynamicid)}
                                 onComment={comment.bind(this, detailData.dynamicid)}
                                 detailFields={detailFields}
                                 detailValue={item.tempdata}
                                 commentList={detailData.commentlist && detailData.commentlist.detail} />
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
        myDailylistData instanceof Array && myDailylistData.length > 0 ? renderHtml() : null
      }
      {
        myDailyCurrentPage === myDailyTotalPage ? <div className={Styles.loadInfo}>没有更多数据加载了哦</div> : <div className={Styles.loadMore} onClick={loadMoreHandler.bind(this, myDailyCurrentPage)}>点击加载更多...</div>
      }
    </div>
  );
}

export default connect(
  state => state.daily,
  dispatch => {
    return {
      comment(id, content) {
        dispatch({ type: 'daily/comment', payload: { id, content } });
        dispatch({ type: 'daily/init', payload: 'mydaily' });
      },
      commentParent(id, content, pcommentsid) {
        dispatch({ type: 'daily/comment', payload: { id, content, pcommentsid } });
        dispatch({ type: 'daily/init', payload: 'mydaily' });
      },
      loadMoreHandler(myDailyCurrentPage) {
        dispatch({ type: 'daily/loadMore', payload: { routeType: 'mydaily', pageCount: myDailyCurrentPage + 1 } });
      }
    };
  }
)(MyDaily);
