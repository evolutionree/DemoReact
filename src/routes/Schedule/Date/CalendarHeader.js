/**
 * Created by 0291 on 2017/12/18.
 */
import React from 'react';
import Lang  from './Lang/language';
require("./index.less");

class CalendarHeader extends React.Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year,
      month: this.props.month,
      day: this.props.day
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month,
      day: nextProps.day
    });
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
    this.props.updateFilter(this.state.year, m);// 执行父组件回调函数，改变父组件状态值
  }

  handleLeftClick() {
    console.log('lastYeaer')
    this._dealMonthClick(-1);
  }
  handleRightClick() {
    this._dealMonthClick(1);
  }

  changeYear () {
    if (this.props.changeYear) {
      this.props.changeYear();
    }
  }

  changeMonth () {
    if (this.props.changeMonth) {
      this.props.changeMonth();
    }
  }


  render () {
    return (
      <div className="wasabi-datetime-header">
        <div className="header-text" >
          <a href="javascript:void(0);" style={{ marginRight: 8 }} onClick={this.changeYear.bind(this)}>
            <span>{this.state.year + '年'}</span>
            <i style={{ fontSize: 12, marginTop: 2 }} className="icon-down"></i>
          </a>
          <a href="javascript:void(0);" onClick={this.changeMonth.bind(this)}>
            <span>{Lang.cn.Month[this.state.month - 1] + '月' }</span>
            <i style={{ fontSize: 12, marginTop: 2 }} className="icon-down"></i>
          </a>
        </div>
        <a href="javascript:void(0);" className="triangle-left" onClick={this.handleLeftClick.bind(this)}></a>
        <a href="javascript:void(0);" className="triangle-right" onClick={this.handleRightClick.bind(this)}></a>
      </div>
    );
  }
}
export default CalendarHeader;
