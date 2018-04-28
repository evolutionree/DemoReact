/**
 * Created by 0291 on 2018/4/27.
 */
import React from 'react';
import { Table, Input, Button, Select } from 'antd';
import { connect } from 'dva';
import Styles from './SelectCombine.less';

const Option = Select.Option;
class SelectCombine extends React.Component {

  static propTypes = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    console.log(JSON.stringify(this.props.entityList))
    return (
      <div>
        <Select className={Styles.select}>
          <Option value="rmb">RMB</Option>
          <Option value="dollar">Dollar</Option>
        </Select>
        <Select className={Styles.select}>
          <Option value="rmb">RMB</Option>
          <Option value="dollar">Dollar</Option>
        </Select>
        <Select className={Styles.select}>
          <Option value="rmb">RMB</Option>
          <Option value="dollar">Dollar</Option>
        </Select>
      </div>
    );
  }
}

export default SelectCombine;
