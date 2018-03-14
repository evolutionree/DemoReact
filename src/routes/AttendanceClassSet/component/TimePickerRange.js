/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { TimePicker, message } from 'antd';
import moment from 'moment';
const format = 'HH:mm';

class TimePickerRange extends Component {
  static propTypes = {
    value: React.PropTypes.array.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onChange = (type, time, timeString) => {
    console.log(moment(timeString, format).unix() , moment(this.props.value[0], format).unix())
    if (type === 'endTime' && moment(timeString, format).unix() < moment(this.props.value[0], format).unix()) {
      message.warning('结束时间不能小于开始时间');
      return;
    }

    if (type === 'startTime') {
      this.props.onChange && this.props.onChange([timeString, '']);
    } else {
      this.props.onChange && this.props.onChange([this.props.value[0], timeString]);
    }
  }

  render() {
    const [startTime, endTime] = this.props.value;
    return (
      <div>
        <TimePicker style={{ width: 110 }} value={startTime ? moment(startTime, format) : null} format={format} onChange={this.onChange.bind(this, 'startTime')} />
        <span style={{ display: 'inline-block', width: '20px', height: '1px', background: 'rgb(226, 226, 226)', position: 'relative', top: '-4px' }}></span>
        <TimePicker style={{ width: 110 }} value={endTime ? moment(endTime, format) : null} format={format} onChange={this.onChange.bind(this, 'endTime')} />
      </div>
    );
  }
}

export default TimePickerRange;
