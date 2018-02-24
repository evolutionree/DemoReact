/**
 * Created by 0291 on 2017/12/26.
 */
import React from 'react';
import classnames from 'classnames';
import Styles from './index.less';

function Radio({
                     data,
                     onChange
                   }) {
  return (
    <ul className={Styles.RadioWrap}>
      {
        data && data instanceof Array && data.map((item, index) => {
          const width = 100 / data.length + '%';
          const cls = classnames([{
            [Styles.active]: item.active
          }]);
          return <li className={cls} key={index} onClick={() => { onChange(item.name) }} style={{ width: width }}>{item.title}</li>;
        })
      }
    </ul>
  );
}

export default Radio;
