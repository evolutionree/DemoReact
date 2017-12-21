/**
 * Created by 0291 on 2017/10/26.
 */
import React from 'react';
import classnames from 'classnames';
import Styles from './index.less';

function List({
                data
              }) {

  if (!data) {
    return null;
  }

  return (
    <ul className={Styles.List}>
      {
        data && data instanceof Array && data.map((item, index) => {
          const typeClassName = classnames([{
            [Styles.info]: index === 0,
            [Styles.warning]: index === 1,
            [Styles.task]: index === 2
          }]);

          return (
            <li key={index}>
              <span className={typeClassName}></span>
              <span>{item.time}</span>
              <span title={item.title}>{item.title}</span>
            </li>
          );
        })
      }
    </ul>
  );
}

export default List;
