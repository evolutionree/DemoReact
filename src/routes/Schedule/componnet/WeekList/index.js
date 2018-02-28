/**
 * Created by 0291 on 2017/12/20.
 */
import React, { Component } from 'react';
import _ from 'lodash';
import CalendarHeader from '../Calendar/CalendarHeader';
import Styles from './index.less';
import classnames from 'classnames';

class WeekList extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year ? this.props.year : new window.Date().getFullYear(),
      month: this.props.month ? this.props.month : new window.Date().getMonth() + 1
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }

  getMonthDays() {
    //根据月份获取当月总天数
    return new window.Date(this.state.year, this.state.month, 0).getDate();
  }
  getLastMonthDays() {
    //根据月份获取上个月月总天数
    const lastMonth = (this.state.month - 1) === 0 ? 12 : (this.state.month - 1);
    return new window.Date(this.state.year, lastMonth, 0).getDate();
  }
  getFirstDayWeek() {
    //获取当月第一天是星期几
    return new window.Date(this.state.year, this.state.month - 1, 1).getDay();
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
    let arry1 = []; let arry2 = []; let arry3 = [];
    let getDays = this.getMonthDays();
    let FirstDayWeek = this.getFirstDayWeek();
    let getLastMonthDays = this.getLastMonthDays();
    const lastMonth = (this.state.month - 1) === 0 ? 12 : (this.state.month - 1);
    for (let i = (getLastMonthDays - FirstDayWeek + 1); i <= getLastMonthDays; i++) {
      arry1.push(lastMonth + '-' + i);
    }

    for (let i = 0; i < getDays; i++) {
      arry2[i] = this.state.month + '-' + (i + 1);
    }

    for (let i = 0; i < 42 - FirstDayWeek - getDays; i++) {
      const nextMonth = (this.state.month + 1) === 13 ? 1 : (this.state.month + 1);
      arry3[i] = nextMonth + '-' + (i + 1);
    }

    let totalDay = _.chunk([
      ...arry1,
      ...arry2,
      ...arry3
    ], 7);

    totalDay = totalDay.filter((item) => {
      const day1 = item[0].split('-');
      return day1[0] <= this.state.month;
    });


    const typeClassName = classnames([Styles.info, {
      [Styles.active]: false
    }]);

    return (
      <div className={Styles.WeekList}>
        <CalendarHeader
          year={this.state.year}
          month={this.state.month}
          onChange={this.updateYearAndMonth.bind(this)}
        />
        <ul>
          {
            totalDay.map((item, index) => {
              const day1 = item[0].split('-');
              const day2 = item[6].split('-');
              return (
                <li key={index}>
                  <span className={typeClassName}></span>
                  <span>{`${day1[0]}月${day1[1]}日`} - {`${day2[0]}月${day2[1]}日`}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}


export default WeekList;
