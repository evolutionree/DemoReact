import React from 'react';
import { Link } from 'dva/router';
import styles from './LinkTab.less';

const Tab = ({ children, to, ...linkProp, hide }) => {
  return hide ? null : (
    <Link to={to} className={styles.tab}
          activeClassName={styles.active}>
      {children}
    </Link>
  );
};

Tab.Group = ({ children }) => {
  return (
    <div className={styles.group}>{children}</div>
  );
};

export default Tab;
