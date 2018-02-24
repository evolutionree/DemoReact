/**
 * Created by 0291 on 2017/10/26.
 */
import React from 'react';
import classnames from 'classnames';
import Styles from './index.less';

function List({
                data,
                className,
                firstKey,
                secondKey
              }) {

  if (!data) {
    return null;
  }

  const wrapClassName = classnames(Styles.List, className);

  return (
    <ul className={wrapClassName}>
      {
        data && data instanceof Array && data.map((item, index) => {
          // item  { type: 'default or info or waring or task', time: '', title: '' }
          const typeClassName = classnames(Styles[item.type]);

          if (firstKey && secondKey) {
            return (
              <li key={index}>
                <span className={typeClassName}></span>
                <span style={{ width: '75px', marginRight: '20px' }}>{item[firstKey]}</span>
                <span title={item.title} style={{ width: 'calc(100% - 95px)' }}>{item[secondKey]}</span>
              </li>
            );
          } else if (firstKey) {
            return (
              <li key={index}>
                <span className={typeClassName}></span>
                <span style={{ width: '100%' }}>{item[firstKey]}</span>
              </li>
            );
          } else {
            console.log('组件List需传入属性[firstKey]');
          }
        })
      }
    </ul>
  );
}

export default List;
