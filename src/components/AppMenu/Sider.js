import React from 'react';
import classnames from 'classnames';
import styles from './styles.less';

const Sider = ({ children, fold, fixBottom, fixBottomHeight, style }) => {
  const cls = classnames([styles.sider, { [styles.fold]: fold, [styles.hasBottom]: !!fixBottom }]);
  return (
    <div className={cls} style={style}>
      <div className={styles.siderInner} style={fixBottom ? { paddingBottom: fixBottomHeight + 'px' } : null}>
        {children}
        <div className={styles.siderBottom}>
          {fixBottom}
        </div>
      </div>
    </div>
  );
};
Sider.propTypes = {
  children: React.PropTypes.node,
  fold: React.PropTypes.bool,
  fixBottom: React.PropTypes.node,
  fixBottomHeight: React.PropTypes.number
};
Sider.defaultProps = {
  fold: false,
  fixBottom: null,
  fixBottomHeight: 42
};

export default Sider;
