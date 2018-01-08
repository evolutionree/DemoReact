import React, { Component } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import DateTimeRange from "./DateTimeRange";

function toMomentFormat(format) {
  const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  if (!format) return defaultFormat;
  return format.replace(/y/g, 'Y')
    .replace(/d/g, 'D')
    .replace(/h/g, 'H');
}

class DateTime extends Component {
  setValue = val => {
    this.props.onChange(val, true);
  };
  onDateChange = (date, dateString) => {
    // this.props.onChange(dateString);
    this.props.onChange(date.format('YYYY-MM-DD HH:mm:ss'));
  };
  render() {
    const { value, isReadOnly, format } = this.props;
    const mFormat = toMomentFormat(format);
    // const date = value ? moment(value, mFormat) : undefined;
    const date = value ? moment(moment(value, 'YYYY-MM-DD HH:mm:ss').format(mFormat), mFormat) : undefined;
    return (
      <DatePicker
        showTime
        style={{ width: '100%' }}
        value={date}
        onChange={this.onDateChange}
        disabled={isReadOnly === 1}
        format={mFormat}
      />
    );
  }
}

DateTime.AdvanceSearch = DateTimeRange;

export default DateTime;
