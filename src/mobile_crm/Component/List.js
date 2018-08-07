/**
 * Created by 0291 on 2017/9/6.
 */
import React from 'react';
import { Icon } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './List.less';

function List({
                protocol,
                list,
                entityId
              }) {
  const filterProsocol = protocol && protocol instanceof Array && protocol.filter(item => {
    return item.controltype !== 15 && item.controltype !== 1012;
  });
  const InputRecNameProsocol = protocol && protocol instanceof Array && protocol.filter(item => item.controltype === 1012);
  return (
    (list instanceof Array && list.length === 0) ? <div className={styles.noDataInfo}>暂无数据</div> : <ul className={styles.listWrap}>
      {
        list instanceof Array && list.map(item => {
          return (
            <li key={item.recid}>
              <Link to={`entcomm/${entityId}/${item.recid}/detail`}>
                {
                  InputRecNameProsocol instanceof Array && InputRecNameProsocol.map(columnItem => {
                    return <div style={{ color: '#000', fontSize: '16px' }} key={columnItem.fieldname}>{item[columnItem.fieldname + '_name'] || item[columnItem.fieldname]}</div>;
                  })
                }
                {
                  filterProsocol instanceof Array && filterProsocol.map(columnItem => {
                    return <div className={styles.float} key={columnItem.fieldname}>{item[columnItem.fieldname + '_name'] || item[columnItem.fieldname]}</div>;
                  })
                }
              </Link>
            </li>
          );
        })
      }
    </ul>
  );
}

export default connect(
  state => state.entcommList
)(List);
