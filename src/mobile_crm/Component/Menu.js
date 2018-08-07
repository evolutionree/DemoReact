/**
 * Created by 0291 on 2018/8/6.
 */
import React from 'react';
import { Icon } from 'antd';
import styles from './Menu.less';
import { connect } from 'dva';
import { Link } from 'dva/router';

function Menu({
                menuData
              }) {
  return (
    <ul className={styles.menuWrap}>
      {
        menuData instanceof Array && menuData.map(item => {
          return (
            <li key={item.entityid}>
              <img src={`/api/fileservice/read?fileid=${item.icons}`} />
              <Link to={`entcomm-list/${item.entityid}`}>
                <div className={styles.menuNameWrap}>
                  <span>{item.entryname}</span>
                  <Icon type="right" />
                </div>
              </Link>
            </li>
          );
        })
      }
    </ul>
  );
}

export default connect(
  state => state.app
)(Menu);
