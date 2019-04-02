import React from 'react';
import { Badge, Icon } from 'antd';
import classnames from 'classnames';
import styles from './styles.less';

const BadgeIcon = (props) => {
  const { onClick, IconType = 'bell', IconSize = 24, title = 'title', count = 0, textBool = true, className = {} } = props;
  const wrapClass = classnames(
    { [styles.badgeStyle]: textBool },
    { [styles.badgeStyle1]: !textBool },
    className
  );
  const Icons = (
    <Icon
      type={IconType}
      style={{ fontSize: IconSize, marginBottom: 3 }}
    />
  );

  return (
    <div title={title} className={wrapClass} onClick={onClick}>
      <Badge count={count}>
        {
          textBool ? (
            <div className={styles.iconStyle}>
              <div>{Icons}</div>
              <div>{title}</div>
            </div>
          ) : <div>{Icons}</div>
        }
      </Badge>
    </div>
  );
};

export default BadgeIcon;
