import React, { PropTypes, Component } from 'react';
import { InputNumber } from "antd";

const separatorStyle = {
  display: 'inline-block',
  verticalAlign: 'middle',
  textAlign: 'center',
  cursor: 'default',
  width: '10%'
};

class INumberRange extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMinChange = val => {
    const min = val === undefined ? '' : val;
    const max = this.parseValue().max;
    this.props.onChange({
      dataVal: min + ':' + max
    });
  };

  handleMaxChange = val => {
    const min = this.parseValue().min;
    const max = val === undefined ? '' : val;
    this.props.onChange({
      dataVal: min + ':' + max
    });
  };

  parseValue = () => {
    const { dataVal } = this.props.value;
    if (!dataVal) return { min: '', max: '' };
    let [min, max] = dataVal.split(':');
    if (!min) {
      min = '';
    }
    if (!max) {
      max = '';
    }
    return { min, max };
  };

  render() {
    const { min, max } = this.parseValue();
    return (
      <div>
        <InputNumber
          placeholder="最小值"
          style={{ width: '45%' }}
          value={min}
          onChange={this.handleMinChange}
        />
        <span style={separatorStyle}>~</span>
        <InputNumber
          placeholder="最大值"
          style={{ width: '45%' }}
          value={max}
          onChange={this.handleMaxChange}
        />
      </div>
    );
  }
}

export default INumberRange;
