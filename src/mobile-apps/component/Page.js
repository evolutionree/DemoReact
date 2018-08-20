/**
 * Created by 0291 on 2017/9/6.
 */
import React from 'react';
import styles from './css/page.less';


function Page(props) {
  //设置id 是滚动的时候监听
  return (
    <div className={styles.page} id="page">
      {props.children}
    </div>
  );
}

export default Page;
