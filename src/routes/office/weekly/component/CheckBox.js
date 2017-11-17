/**
 * Created by 0291 on 2017/9/26.
 */
import React from 'react';
import Styles from './CheckBox.less';
import classnames from 'classnames';

function CheckBox({ checked, title }) {

  const cls = classnames([Styles.checkbox, {
    [Styles.active]: checked
  }]);

  return (
    <div className={Styles.wrap}>
      <div className={cls}></div>
      <span>{title}</span>
    </div>
  );
}

export default CheckBox;
