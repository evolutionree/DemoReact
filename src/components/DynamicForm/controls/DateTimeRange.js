import React, { Component, PropTypes } from 'react';
import { Row, Col, DatePicker } from 'antd';
import moment from 'moment';

function toMomentFormat(format) {
  const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  if (!format) return defaultFormat;
  return format.replace(/y/g, 'Y')
    .replace(/d/g, 'D')
    .replace(/h/g, 'H');
}

class DateTimeRange extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMinChange = (date, dateString) => {
    const min = date ? date.format('YYYY-MM-DD HH:mm:ss') : '';
    const max = this.parseValue().max;
    const newVal = min + ',' + max;
    if (newVal === ',') {
      this.props.onChange();
      return;
    }
    this.props.onChange(newVal);
  };

  handleMaxChange = (date, dateString) => {
    const min = this.parseValue().min;
    const max = date ? date.format('YYYY-MM-DD HH:mm:ss') : '';
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
    const mFormat = toMomentFormat(this.props.format);
    // const mFormat = 'YYYY-MM-DD HH:mm:ss';
    const minDate = min ? moment(moment(min, 'YYYY-MM-DD HH:mm:ss').format(mFormat), mFormat) : undefined;
    const maxDate = max ? moment(moment(max, 'YYYY-MM-DD HH:mm:ss').format(mFormat), mFormat) : undefined;
    return (
      <Row>
        <Col span={11}>
          <DatePicker
            showTime
            style={{ width: '100%' }}
            value={minDate}
            onChange={this.handleMinChange}
            format={mFormat}
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}><span>~</span></Col>
        <Col span={11}>
          <DatePicker
            showTime
            style={{ width: '100%' }}
            value={maxDate}
            onChange={this.handleMaxChange}
            format={mFormat}
          />
        </Col>
      </Row>
    );
  }
}

export default DateTimeRange;
