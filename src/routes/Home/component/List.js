/**
 * Created by 0291 on 2017/10/26.
 */
import React from 'react';
import Styles from './List.less';
import Avatar from '../../../components/Avatar';


function List({
                component,
                dataSource,
                totalHeight
              }) {
  if (!dataSource) {
    return null;
  }

  function getValue(param, data) {
    let returnValue = param;
    const keys = returnValue && returnValue.match(/#.*?#/g, '');
    if (keys && keys instanceof Array) {
      for (let i = 0; i < keys.length; i++) {
        returnValue = returnValue.replace(keys[i], data[keys[i].replace(/#/g, '')]);
      }
    }
    return returnValue;
  }

  switch (component.stypename) {
    case 'IconAndTitle':
      const num = (totalHeight - 8) / 56;
      return (
        <ul className={Styles.List}>
          {
            dataSource && dataSource instanceof Array && dataSource.map((item, index) => {
              if (index < num) {
                return (
                  <li key={index}>
                    <Avatar
                      style={{ width: '36px', height: '36px', position: 'absolute', left: '10px', top: '50%', marginTop: '-18px' }}
                      image={`/api/fileservice/read?fileid=${getValue(component.item1valuescheme, item)}`}
                    />
                    <span>{getValue(component.item2valuescheme, item)}</span>
                  </li>
                );
              } else {
                return null;
              }
            })
          }
        </ul>
      );
    default:
      return null;
  }
}

export default List;
