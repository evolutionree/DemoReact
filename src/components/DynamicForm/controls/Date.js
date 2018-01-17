import React, { Component, PropTypes } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import DateTimeRange from "./DateTimeRange";
import { DefaultTextView } from '../DynamicFieldView';

function toMomentFormat(format) {
  const defaultFormat = 'YYYY-MM-DD';
  if (!format) return defaultFormat;
  return format.replace(/y/g, 'Y')
    .replace(/d/g, 'D');
}

class Date extends Component {
  setValue = val => {
    this.props.onChange(val, true);
  };

  onDateChange = (date, dateString) => {
    // this.props.onChange(dateString);
    this.props.onChange(date.format('YYYY-MM-DD'));
  };

  render() {
    const { value, isReadOnly, format } = this.props;

    const mFormat = toMomentFormat(format);
    const date = value ? moment(moment(value, 'YYYY-MM-DD').format(mFormat), mFormat) : undefined;

    return (
      <DatePicker
        style={{ width: '100%' }}
        value={date}
        onChange={this.onDateChange}
        disabled={isReadOnly === 1}
        format={mFormat}
      />
    );
  }
}

Date.View = (props) => {
  const { value, format } = props;
  if (value) {
    const mFormat = toMomentFormat(format);
    const text = moment(value, 'YYYY-MM-DD').format(mFormat);
    return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</div>;
  } else {
    return <DefaultTextView {...props} />;
  }
};

Date.AdvanceSearch = DateTimeRange;

export default Date;
