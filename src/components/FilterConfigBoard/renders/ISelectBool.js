import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import connectBasicData from '../../../models/connectBasicData';

class ISelectBool extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = val => {
    this.props.onChange({
      dataVal: +val
    });
  };

  render() {
    const { dataVal } = this.props.value;
    const selectVal = dataVal === 1 ? '1' : (dataVal === 0 ? '0' : dataVal);
    return (
      <Select value={selectVal} onChange={this.handleChange}>
        <Select.Option key="1">是</Select.Option>
        <Select.Option key="0">否</Select.Option>
      </Select>
    );
  }
}

export default ISelectBool;
