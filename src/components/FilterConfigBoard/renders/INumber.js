import React, { PropTypes, Component } from 'react';
import { InputNumber } from 'antd';

class INumber extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  parseValue = () => {
    return this.props.value.dataVal;
  };

  handleChange = val => {
    this.props.onChange({ dataVal: val });
  };

  render() {
    return (
      <InputNumber
        placeholder="请输入数值"
        style={{ width: '100%' }}
        value={this.parseValue()}
        onChange={this.handleChange}
      />
    );
  }
}

export default INumber;
