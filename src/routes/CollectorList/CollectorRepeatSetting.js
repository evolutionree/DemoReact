import React, { PropTypes, Component } from 'react';
import { Input, Radio, Select, Row, Col, DatePicker, TimePicker } from 'antd';
import moment from 'moment';

const Option = Select.Option;

const boxStyle = {
  background: '#f2f2f2',
  padding: '8px',
  borderRadius: '5px'
};

const SelectWeekDay = ({ value, onChange, ...rest }) => (
  <Select value={value} onChange={onChange} placeholder="请选择日期" {...rest}>
    <Option value="1">星期一</Option>
    <Option value="2">星期二</Option>
    <Option value="3">星期三</Option>
    <Option value="4">星期四</Option>
    <Option value="5">星期五</Option>
    <Option value="6">星期六</Option>
    <Option value="0">星期日</Option>
  </Select>
);

const SelectMonthDay = ({ value, onChange, rest }) => {
  const opts = [];
  let i = 1;
  while (i <= 31) {
    opts.push(<Option key={i}>{i + '号'}</Option>);
    i += 1;
  }
  return (
    <Select value={value} onChange={onChange} placeholder="请选择日期" {...rest}>
      {opts}
    </Select>
  );
};

const SelectYearDay = ({ value, onChange }) => {
  function toMomentDate(val) {
    if (!val) return undefined;
    return moment(value, 'YYYY-MM-DD');
  }
  function handleDateChange(date, dateString) {
    onChange(dateString);
  }
  return (
    <DatePicker
      value={toMomentDate(value)}
      onChange={handleDateChange}
      format="YYYY-MM-DD"
      showTime={false}
    />
  );
};

class CollectorRepeatSetting extends Component {
  static propTypes = {
    value: PropTypes.shape({
      repeattype: PropTypes.number,
      cronstring: PropTypes.string
    }),
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  validate = () => {
    const { repeattype } = this.props.value || {};
    const { day, time } = this.parseCronString();
    if (repeattype !== 0 && !day) {
      return '请设置执行日期';
    }
    if (!time) {
      return '请设置执行时间';
    }
    return '';
  };

  handleSelectChange = selectValue => {
    this.props.onChange({
      ...this.props.value,
      repeattype: +selectValue,
      cronstring: ''
    });
  };

  handleDayChange = dayString => {
    const { cronstring } = this.props.value || {};
    const { time } = this.parseCronString(cronstring);
    this.props.onChange({
      ...this.props.value,
      cronstring: dayString + ',' + time
    });
  };

  handleTimeChange = (timeObj, timeString) => {
    const { cronstring } = this.props.value || {};
    const { day } = this.parseCronString(cronstring);
    this.props.onChange({
      ...this.props.value,
      cronstring: day + ',' + timeString
    });
  };

  parseCronString = () => {
    const { cronstring } = this.props.value || {};
    const result = {
      day: '',
      time: ''
    };
    if (cronstring && cronstring) {
      const arr = cronstring.split(',');
      if (arr.length === 2) {
        result.day = arr[0];
        result.time = arr[1];
      }
    }
    return result;
  };

  renderCronstringDay = repeattype => {
    const { day } = this.parseCronString();
    const CronstringDayComponent = [null, SelectWeekDay, SelectMonthDay, SelectYearDay][repeattype];
    return CronstringDayComponent && (
      <Col span={8}>
        <CronstringDayComponent value={day} onChange={this.handleDayChange} />
      </Col>
    );
  };

  renderCronStringTime = () => {
    const { time } = this.parseCronString();
    const timeObj = time ? moment(time, 'HH:mm:ss') : undefined;
    return (
      <Col span={12}>
        <TimePicker value={timeObj} onChange={this.handleTimeChange} format="HH:mm:ss" style={{ width: '100%' }} placeholder="执行回收开始时间" />
      </Col>
    );
  };

  render() {
    const { repeattype } = this.props.value || {};
    return (
      <div>
        <Row gutter={10}>
          <Col span={4}>
            <Select value={repeattype + ''} onChange={this.handleSelectChange}>
              <Option value="0">每日</Option>
              <Option value="1">每周</Option>
              <Option value="2">每月</Option>
              <Option value="3">每年</Option>
            </Select>
          </Col>
          {this.renderCronstringDay(repeattype)}
          {this.renderCronStringTime()}
        </Row>
      </div>
    );
  }
}

export default CollectorRepeatSetting;
