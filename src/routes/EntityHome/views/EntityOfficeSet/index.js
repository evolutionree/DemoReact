/**
 * Created by 0291 on 2018/3/7.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Icon, Button, Menu, Modal, message, Checkbox, Input } from 'antd';
import classnames from 'classnames';

function EntityOfficeSet({
                         createButton
                       }) {

  return (
    <div>
      <Checkbox>启用外勤设置</Checkbox>
      <div>
        <Checkbox />
        <span>设置运行偏差距离<Input addonAfter="米" style={{ width: '30%', paddingLeft: '4px' }} /></span>
      </div>
      <div>
        <div>考勤明细表字段映射关系定义</div>
        <ul>
          <li>
            定位
            <Icon type="retweet" />
            <Select defaultValue="lucy" style={{ width: 120 }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default connect(
  state => state.entityOfficeSet,
  dispatch => {
    return {
      createButton() {

      }
    };
  }
)(EntityOfficeSet);
