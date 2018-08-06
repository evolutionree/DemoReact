/**
 * Created by 0291 on 2017/9/6.
 */
import React from 'react';
import { Icon } from 'antd';
import styles from './List.less';

function List({
                tableInfo,
                data,
                style
              }) {
  return (
    <ul className={styles.listWrap}>
      <li>
        <img src="/img_img_card.png" />
        <div className={styles.left}>
          <div>山东沙发里看见快乐发神经</div>
          <div>2018232393444</div>
        </div>
        <div className={styles.right}>
          <div>系统管理员</div>
          <div>核准客户</div>
        </div>
      </li>
    </ul>
  );
}

export default List;
