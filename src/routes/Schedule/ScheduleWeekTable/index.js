/**
 * Created by 0291 on 2017/12/26.
 */
import React, { Component } from 'react';


class ScheduleWeekTable extends Component {
  static propTypes = {
    year: React.PropTypes.number, //年
    month: React.PropTypes.number //月
  };
  static defaultProps = {
    year: new window.Date().getFullYear(),
    month: new window.Date().getMonth() + 1
  };

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year,
      month: this.props.month
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month
    });
  }

  componentWillMount() {

  }

  updateYearAndMonth(currentYear, currentMonth) {
    this.setState({
      year: currentYear,
      month: currentMonth
    })

    if (this.props.updateYearAndMonth != null) {
      this.props.onChange(currentYear, currentMonth);
    }
  }

  render() {
    return (
      <div>
        周日程
      </div>
    );
  }
}


export default ScheduleWeekTable;
