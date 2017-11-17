import React, { PropTypes, Component } from 'react';
import { InputNumber } from 'antd';

class IInputDayNumber extends Component {
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
    return (
      <InputNumber style={{ width: '100%' }} value={dataVal} onChange={this.handleChange} placeholder={this.props.placeholder} />
    );
  }
}

export default IInputDayNumber;

