/**
 * Created by 0291 on 2017/12/20.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import CalendarHeader from '../Calendar/CalendarHeader';
import Styles from './index.less';
import classnames from 'classnames';

const month = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
class MonthList extends Component {
  static propTypes = {

  };
  static defaultProps = {
    year: new window.Date().getFullYear()
  };

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }


  lastYearChangeHandler() {
    this._dealMonthClick(-1);
  }
  nextYearChangeHandler() {
    this._dealMonthClick(1);
  }

  _dealMonthClick(year) {
    let y = parseInt(this.state.year, 10) + year;
    this.setState({
      year: y
    });
    this.props.onChange && this.props.onChange(y); // 执行父组件回调函数，改变父组件状态值
  }


  render() {
    return (
      <div className={Styles.MonthList}>
        <div className={Styles.CalendarHeader}>
          <div className={Styles.header}>
            <Icon type="left" className={Styles.Icon} onClick={this.lastYearChangeHandler.bind(this)} />
            <span><span>{this.state.year}</span>年</span>
            <Icon type="right" className={Styles.Icon} onClick={this.nextYearChangeHandler.bind(this)} />
          </div>
        </div>
        <ul>
          {
            month.map((item, index) => {
              const typeClassName = classnames([Styles.info, {
                [Styles.active]: false
              }]);
              return (
                <li key={index}>
                  <span className={typeClassName}></span>
                  <span>{item}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}


export default MonthList;
