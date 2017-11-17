import React from 'react';
import styles from './styles.less';

const Header = ({ children }) => {
  return (
    <div className={styles.header}>
      {children}
    </div>
  );
};

Header.Right = ({ children }) => {
  return (
    <div className={styles.right}>
      {children}
    </div>
  );
};

export default Header;
