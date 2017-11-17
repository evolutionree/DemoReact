import React from 'react';
import styles from './styles.less';

function FieldContainer({
    children
  }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}

export default FieldContainer;
