/**
 * Created by 0291 on 2017/10/26.
 */
import React from 'react';
import Styles from './Card.less';


function Card({
                component,
                dataSource
              }) {
if (!dataSource) {
  return null;
}

function getValue(param) {
  let returnValue = param;
  const keys = returnValue && returnValue.match(/#.*?#/g, '');
  if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
    if (keys && keys instanceof Array) {
      for (let i = 0; i < keys.length; i++) {
        returnValue = returnValue.replace(keys[i], dataSource[0][keys[i].replace(/#/g, '')]);
      }
    }
  }

  return returnValue;
}

  switch (component.styletype) {
    case 'normal3':
      return (
        <div className={Styles.Card}>
          <ul>
            <li>
              <div>{getValue(component.item1valuescheme)}</div>
              <div>{getValue(component.item1labelscheme)}</div>
              <span></span>
            </li>
            <li>
              <div>{getValue(component.item2valuescheme)}</div>
              <div>{getValue(component.item2labelscheme)}</div>
              <span></span>
            </li>
            <li>
              <div>{getValue(component.item3valuescheme)}</div>
              <div>{getValue(component.item3labelscheme)}</div>
            </li>
          </ul>
        </div>
      );
    case 'normal4':
      return (
        <div className={Styles.Card}>
          <ul>
            <li>
              <div>{getValue(component.item1valuescheme)}</div>
              <div>{getValue(component.item1labelscheme)}</div>
              <span></span>
            </li>
            <li>
              <div>{getValue(component.item2valuescheme)}</div>
              <div>{getValue(component.item2labelscheme)}</div>
              <span></span>
            </li>
            <li>
              <div>{getValue(component.item3valuescheme)}</div>
              <div>{getValue(component.item3labelscheme)}</div>
              <span></span>
            </li>
            <li>
              <div>{getValue(component.item4valuescheme)}</div>
              <div>{getValue(component.item4labelscheme)}</div>
            </li>
          </ul>
        </div>
      );
    default:
      return null;
  }
}

export default Card;
