/**
 * Created by 0291 on 2018/3/13.
 */
import React, { PropTypes, Component } from 'react';
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

  timeChange = (value) => {
    this.props.onChange && this.props.onChange({
      startworktime: value[0],
      offworktime: value[1]
    });
  }


  render() {
    const { startworktime, offworktime } = this.props.value;
    return (
      <TimePickerRange onChange={this.timeChange} value={[startworktime, offworktime]} />
    );
  }
}

export default ResetTime;
