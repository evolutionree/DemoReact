import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';

const Option = Select.Option;

class ISelectNull extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (value) => {
    this.props.onChange({
      dataVal: value
    });
  };

  render() {
    const { dataVal } = this.props.value;
    const value = dataVal + '';
    return (
      <Select value={value} onChange={this.handleChange}>
        <Option key="NULL">NULL</Option>
        <Option key="NOT NULL">NOT NULL</Option>
      </Select>
    );
  }
}

export default ISelectNull;
