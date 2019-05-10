import React from 'react';
import styles from './index.less';

const MobilePreview = (props) => {
  const { style } = props;
  return (
    <div className={styles.bgImages} style={{ ...style }}>
      <div className={styles.wrapCanvas}>
        <div className={styles.canvas}>
          <div style={{ height: 100 }}>
            第三方的快速减肥但是
            第三方的快速减肥但是
            第三方的快速减肥但是
            第三方的快速减肥但是
        </div>
        </div>
      </div>

    </div>
  );
};

export default MobilePreview;
