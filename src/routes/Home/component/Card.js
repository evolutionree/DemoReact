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

  const columnNum = component.styletype && component.styletype.split('normal')[1];
  function getRenderColumn() {
    let html = [];
    for (let i = 1; i <= columnNum; i++) {
      html.push(
        <li key={i} style={{ width: 100 / columnNum + '%' }}>
          <div>{getValue(component[`item${i}valuescheme`])}</div>
          <div>{getValue(component[`item${i}labelscheme`])}</div>
          {
            i === parseInt(columnNum) ? null : <span></span>
          }
        </li>
      );
    }
    return html;
  }

  return (
    <div className={Styles.Card}>
      <ul>
        {
          getRenderColumn()
        }
      </ul>
    </div>
  );
}

export default Card;
