import React, { PropTypes } from 'react';
import classnames from 'classnames';
import styles from './Toolbar.less';

const Toolbar = ({
    children,
    selectedCount,
    actions,
    onAction,
    style
}) => {
  function bindAction(actionName) {
    return function boundAction() {
      onAction && onAction(actionName);
    };
  }
  const toolbarCls = classnames([styles.toolbar, {
    [styles.active]: selectedCount && selectedCount > 0
  }]);
  return (
    <div className={toolbarCls} style={{ ...style }}>
      <div className={styles.toolbarContent}>{children}</div>
      {actions ? (
        <div className={styles.toolbarToggle}>
          <span className={styles.count}>已选中{selectedCount}项</span>
          {actions.map(action => {
            let show = true;
            if (action.single) show = show && selectedCount === 1;
            if (action.multiple) show = show && selectedCount > 1;
            if (action.show !== undefined) {
              if (typeof action.show === 'boolean') {
                show = show && action.show;
              } else {
                show = show && action.show();
              }
            }
            return show ? (
              <a
                key={action.label}
                onClick={action.handler || bindAction(action.name)}
                className={styles.action}
              >
                {action.label}
              </a>
            ) : '';
          })}
        </div>
      ) : ''}
    </div>
  );
};
Toolbar.propTypes = {
  children: PropTypes.node.isRequired,
  selectedCount: PropTypes.number,
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    show: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.bool
    ]),
    handler: PropTypes.func
  }))
};

Toolbar.Right = ({ children }) => {
  return (
    <div className={styles.toolbarRight}>
      {children}
    </div>
  );
};

export default Toolbar;
