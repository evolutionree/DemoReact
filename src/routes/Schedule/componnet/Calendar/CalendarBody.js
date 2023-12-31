/**
 * Created by 0291 on 2017/12/20.
 */
import React, { Component } from 'react';
import Styles from './index.less';
import classnames from 'classnames';

class CalendarBody extends Component {
  static propTypes = {
    year: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]), //年
    month: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]), //月
    day: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]) //日
  };
  static defaultProps = {
    year: new window.Date().getFullYear(),
    month: new window.Date().getMonth() + 1
  };

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year,
      month: this.props.month,
      activeDay: -1
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

  dayHandler(day) {
    this.setState({
      activeDay: day
    })
    this.props.dayHandler && this.props.dayHandler(day); // 执行父组件回调函数，改变父组件状态值
  }

  render() {
    let arry1 = []; let arry2 = []; let arry3 = [];
    let getDays = this.getMonthDays();
    let FirstDayWeek = this.getFirstDayWeek();
    let getLastMonthDays = this.getLastMonthDays();
    for (let i = (getLastMonthDays - FirstDayWeek + 1); i <= getLastMonthDays; i++) {
      arry1.push(i);
    }
    for (let i = 0; i < getDays; i++) {
      arry2[i] = (i + 1);
    }

    for (let i = 0; i < 42 - FirstDayWeek - getDays; i++) {
      arry3[i] = (i + 1);
    }

    let node1 = arry1.map((item, i) => {
      return <li key={'li1' + i} className={Styles.otherMonthDay} onClick={this.dayHandler.bind(this, item)}><div>{item}</div></li>;
    })

    let node2 = arry2.map((item, i) => {
      const today_year = new window.Date().getFullYear();
      const today_month = new window.Date().getMonth() + 1
      const today_day = new window.Date().getDate();

      const liClassName = classnames([{
        [Styles.active]: item === parseInt(this.state.activeDay),
        [Styles.today]: item === today_day && parseInt(this.state.year) === today_year && parseInt(this.state.month) === today_month,
        [Styles.hasScheduleOrTask]: item === 11
      }]);
      return <li key={'li1' + i} className={liClassName} onClick={this.dayHandler.bind(this, item)}><div>{item}</div></li>;
    })

    let node3 = arry3.map((item, i) => {
      return <li key={'li3' + i} className={Styles.otherMonthDay} onClick={this.dayHandler.bind(this, item)}><div>{item}</div></li>;
    })

    return (
      <div className={Styles.CalendarBody}>
        <ul className={Styles.dayList}>
          <li>日</li>
          <li>一</li>
          <li>二</li>
          <li>三</li>
          <li>四</li>
          <li>五</li>
          <li>六</li>
        </ul>
        <div className={Styles.body}>
          <ul className={Styles.dayList}>
            {node1} {node2} {node3}
          </ul>
        </div>
      </div>
    );
  }
}


export default CalendarBody;
