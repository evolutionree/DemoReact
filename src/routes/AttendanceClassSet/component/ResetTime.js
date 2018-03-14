/**
 * Created by 0291 on 2018/3/13.
 */
import React, { PropTypes, Component } from 'react';
import { Checkbox } from 'antd';
import TimePickerRange from './TimePickerRange';

class ResetTime extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onCheckChange = (e) => {
    this.props.onChange && this.props.onChange({
      hasresttime: e.target.checked ? 1 : 0,
      startresttime: '',
      endresttime: ''
    });
  }

  timeChange = (value) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      startresttime: value[0],
      endresttime: value[1]
    });
  }

  render() {
    const { startresttime, endresttime, hasresttime } = this.props.value;
    return (
      <div>
        <Checkbox onChange={this.onCheckChange} checked={hasresttime === 1}>是否休息</Checkbox>
        <div style={{ display: hasresttime === 1 ? 'inline-block' : 'none' }}>
          <TimePickerRange onChange={this.timeChange} value={[startresttime, endresttime]} />
        </div>
      </div>
    );
  }
}

export default ResetTime;
