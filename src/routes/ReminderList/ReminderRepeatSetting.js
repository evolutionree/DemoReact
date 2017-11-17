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

const SelectExecuteDate = ({ day, time, onChange }) => {
  function toMomentDate() {
    if (!day) return undefined;
    const _time = time || '00:00:00';
    return moment(day + ' ' + _time, 'YYYY-MM-DD HH:mm:ss');
  }
  function handleDateChange(date, dateString) {
    onChange(dateString.replace(' ', ','));
  }
  return (
    <DatePicker
      value={toMomentDate()}
      onChange={handleDateChange}
      format="YYYY-MM-DD HH:mm:ss"
      showTime
      style={{ width: '100%' }}
    />
  );
};

class ReminderRepeatSetting extends Component {
  static propTypes = {
    value: PropTypes.shape({
      isrepeat: PropTypes.bool,
      repeattype: PropTypes.number,
      cronstring: PropTypes.string
    }),
    onChange: PropTypes.func
  };
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleRadioChange = e => {
    const isrepeat = e.target.value;
    this.props.onChange({
      repeattype: 0,
      ...this.props.value,
      isrepeat
    });
  };

  validate = () => {
    const { isrepeat, repeattype } = this.props.value || {};
    const { day, time } = this.parseCronString();
    if (isrepeat) {
      if (repeattype !== 0 && !day) {
        return '请设置提醒日期';
      }
      if (!time) {
        return '请设置提醒时间';
      }
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

  handleCronStringChange = value => {
    this.props.onChange({
      ...this.props.value,
      cronstring: value
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
      <Col span={7}>
        <CronstringDayComponent value={day} onChange={this.handleDayChange} />
      </Col>
    );
  };

  renderCronStringTime = () => {
    const { time } = this.parseCronString();
    const timeObj = time ? moment(time, 'HH:mm:ss') : undefined;
    return (
      <Col span={7}>
        <TimePicker value={timeObj} onChange={this.handleTimeChange} format="HH:mm:ss" style={{ width: '100%' }} />
      </Col>
    );
  };

  render() {
    const { isrepeat, repeattype, cronstring } = this.props.value || {};
    const { day, time } = this.parseCronString();
    return (
      <div>
        <Radio.Group value={isrepeat} onChange={this.handleRadioChange}>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
        {isrepeat === true && (
          <Row gutter={10} style={boxStyle}>
            <Col span={5}>重复提醒频次: </Col>
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
        )}
        {isrepeat === false && (
          <Row gutter={10} style={boxStyle}>
            <Col span={5}>执行时间设置: </Col>
            <Col span={10}>
              <SelectExecuteDate day={day} time={time} onChange={this.handleCronStringChange} />
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default ReminderRepeatSetting;
