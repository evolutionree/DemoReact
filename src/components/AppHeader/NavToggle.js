import React from 'react';
import { Icon } from 'antd';
import { connect } from 'dva';
import styles from './styles.less';

const NavToggle = ({ dispatch, siderFold }) => {
  function handleClick() {
    dispatch({
      type: 'app/toggleSider',
    });
  }
  return (
    <div className={styles.navToggle} onClick={handleClick}>
      <Icon type={siderFold ? 'menu-fold' : 'menu-unfold'} />
    </div>
  );
};

export default connect(({ app }) => app)(NavToggle);
