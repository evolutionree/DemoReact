/**
 * Created by 0291 on 2017/9/6.
 */
import React from 'react';
import styles from './css/list.less';
import { Icon } from 'antd';
import UKBridge from "../lib/uk-bridge";

function List({
                tableInfo,
                data,
                style
              }) {
  const linkToPage = () => {
    if (tableInfo && tableInfo.entityid) {
      try {
        UKBridge.linkToPage(tableInfo.entityid, data.recid);
      } catch (e) {

      }
    }
  };
  const subtitle = tableInfo && tableInfo.subtitlefieldname && data[tableInfo.subtitlefieldname];
  return (
    <div className={styles.list} style={style}>
      <div className={styles.header} onClick={linkToPage}>
        <span className={styles.mainTitle} style={{ maxWidth: 'calc(100% - 2rem)' }}>{tableInfo && tableInfo.maintitlefieldname && data[tableInfo.maintitlefieldname]}</span>
        <span className={styles.miniTitleWrap} style={{ display: subtitle ? 'inline-block' : 'none' }}>
          <span className={styles.miniTitle}>{subtitle}</span>
        </span>
        <img src='/arrow.png' className={styles.icon} />
      </div>
      <ul>
        {
          tableInfo && tableInfo.detailcolumns && tableInfo.detailcolumns.map((item, index) => {
            return <li key={index}>{item.fieldlabel} : {data[item.fieldname]}</li>;
          })
        }
      </ul>
    </div>
  );
}

export default List;
