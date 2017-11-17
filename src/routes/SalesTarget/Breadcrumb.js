/**
 * Created by 0291 on 2017/8/7.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';

import { Button, Select, Table, Modal, message } from 'antd';

const Option = Select.Option;

function Breadcrumb({
                      data,
                      onClick
                     }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <a onClick={() => { onClick('00000000-0000-0000-0000-000000000000') }}>{ `团队>` }</a>
      {
        data.map((item, index) => {
          if(index === data.length - 1) {
            return (
              <span key={index}>
                {item.title}
                <span>{`>`}</span>
              </span>
            )
          } else {
            return (
              <a key={index} onClick={() => { onClick(item.departmentid) }}>
                {item.title}
                <span>{`>`}</span>
              </a>
            )
          }
        })
      }
    </div>
  )
};

export default Breadcrumb;
