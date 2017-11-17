import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';

const Option = Select.Option;

class ISelectRecordStatus extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (value) => {
    this.props.onChange({
      dataVal: +value
    });
  };

  render() {
    const { dataVal } = this.props.value;
    const value = dataVal + '';
    return (
      <Select value={value} onChange={this.handleChange}>
        <Option key="1">启用</Option>
        <Option key="0">停用</Option>
      </Select>
    );
  }
}

export default ISelectRecordStatus;
