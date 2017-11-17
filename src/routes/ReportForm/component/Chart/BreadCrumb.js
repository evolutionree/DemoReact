/**
 * Created by 0291 on 2017/8/31.
 */
import React from 'react';

function Breadcrumb({
                      data,
                      onClick
                    }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <a onClick={() => { onClick('全国') }}>{ `全国>` }</a>
      {
        data.map((item, index) => {
          if (index === data.length - 1) {
            return (
              <span key={index}>
                {item}
                <span>{ `>` }</span>
              </span>
            );
          } else {
            return (
              <a key={index} onClick={() => { onClick(item) }}>
                {item}
                <span>{`>`}</span>
              </a>
            );
          }
        })
      }
    </div>
  );
}

export default Breadcrumb;
