/**
 * Created by 0291 on 2017/11/3.
 */
import React from 'react';
import { Icon } from 'antd';
import styles from './LabelList.less';

const propTypes = {
  labels: React.PropTypes.array,
  onRemove: React.PropTypes.func,
  textKey: React.PropTypes.string
};
const defaultProps = {
  labels: [],
  textKey: 'text'
};

function LabelList({
                     labels,
                     onRemove,
                     textKey
                   }) {
  if (!labels || !labels.length) return null;
  return (
    <ul className={styles.labellist}>
      {labels.map((item, index) => (
        <li className={styles.label} key={textKey ? item[textKey] : index}>
          <Icon type="team" />
          <span className={styles.labeltext} title={item[textKey]}>
            {item[textKey]}
          </span>
          <Icon type="close" onClick={onRemove.bind(null, item)} />
        </li>
      ))}
    </ul>
  );
}
LabelList.propTypes = propTypes;
LabelList.defaultProps = defaultProps;

export default LabelList;
