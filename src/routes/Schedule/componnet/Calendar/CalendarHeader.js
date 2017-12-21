/**
 * Created by 0291 on 2017/12/20.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import Styles from './index.less';

class CalendarHeader extends Component {
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

  /*
   * 处理月份变化
   *@param {Number} month 月份变化数1或-1
   *@return
   * */
  _dealMonthClick(month) {
    let m = parseInt(this.state.month, 10) + month;
    if (m < 1) {
      this.state.year --;
      m = 12;
    } else if (m > 12) {
      this.state.year ++;
      m = 1;
    }
    this.state.month = m;
    this.setState(this.state);
    this.props.onChange && this.props.onChange(this.state.year, m); // 执行父组件回调函数，改变父组件状态值
  }

  lastMonthChangeHandler() {
    this._dealMonthClick(-1);
  }
  nextMonthChangeHandler() {
    this._dealMonthClick(1);
  }

  render() {
    return (
      <div className={Styles.CalendarHeader}>
        <div className={Styles.header}>
          <Icon type="left" className={Styles.Icon} onClick={this.lastMonthChangeHandler.bind(this)} />
          <span><span>{this.state.year}</span>年<span>{this.state.month}</span>月</span>
          <Icon type="right" className={Styles.Icon} onClick={this.nextMonthChangeHandler.bind(this)} />
        </div>
      </div>
    );
  }
}


export default CalendarHeader;
