import React, { Component, PropTypes } from 'react';
import { Row, Col, InputNumber } from 'antd';

class InputNumberRange extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMinChange = val => {
    const min = val === undefined ? '' : val;
    const max = this.parseValue().max;
    const newVal = min + ',' + max;
    if (newVal === ',') {
      this.props.onChange();
      return;
    }
    this.props.onChange(newVal);
  };

  handleMaxChange = val => {
    const min = this.parseValue().min;
    const max = val === undefined ? '' : val;
    const newVal = min + ',' + max;
    if (newVal === ',') {
      this.props.onChange();
      return;
    }
    this.props.onChange(newVal);
  };

  parseValue = () => {
    const { value } = this.props;
    if (!value) return { min: '', max: '' };
    let [min, max] = value.split(',');
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
      <Row>
        <Col span={11}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder="最小值"
            value={min}
            onChange={this.handleMinChange}
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}><span>~</span></Col>
        <Col span={11}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder="最大值"
            value={max}
            onChange={this.handleMaxChange}
          />
        </Col>
      </Row>
    );
  }
}

export default InputNumberRange;
