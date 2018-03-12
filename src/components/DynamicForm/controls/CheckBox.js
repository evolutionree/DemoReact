/**
 * Created by 0291 on 2018/3/12.
 */
import React, { Component, PropTypes } from 'react';
import { Checkbox } from 'antd';

class CheckBox extends Component {
  setValue = val => {
    this.props.onChange(val, true);
  };

  onCheckChange = (e) => {
    this.props.onChange(e.target.checked);
  };

  render() {
    const { value, isReadOnly, label } = this.props;

    return (
      <Checkbox onChange={this.onCheckChange} disabled={isReadOnly === 1} checked={value}>{label}</Checkbox>
    );
  }
}


export default CheckBox;
