/**
 * Created by 0291 on 2017/12/21.
 */
import React, { Component } from 'react';
import CalendarHeader from '../Calendar/CalendarHeader';
import TableBody from './TableBody';
import Styles from './index.less';

class ScheduleCalendarTable extends Component {
  static propTypes = {
    name: React.PropTypes.string, //字段名称，对应于表单
    year: React.PropTypes.number, //年
    month: React.PropTypes.number, //月
    day: React.PropTypes.number, //日
    isRange: React.PropTypes.bool, //是否为范围选择
    min: React.PropTypes.number, //最小值，用于日期范围选择
    max: React.PropTypes.number, //最大值,用于日期范围选择
    onSelect: React.PropTypes.func, //选择后的事件
    attachTime: React.PropTypes.bool //j是否附加时间格式
  }

  static defaultProps = {
    year: null,
    month: null,
    day: null,
    isRange: false, ///默认否
    min: null, //默认为空，不属于日期范围选择
    max: null, //默认为空，不属于日期范围选择
    attachTime: true,
    renderBody: null
  }

  constructor(props) {
    super(props);
    this.state = {
      year: this.props.year ? this.props.year : this.formatDate(new window.Date(), 'yyyy'),
      month: this.props.month ? this.props.month : this.formatDate(new window.Date(), 'MM'),
      day: this.props.day,
      isRange: this.props.isRange,
      min: this.props.min,
      max: this.props.max,
      changeYear: false, //选择年份
      changeMonth: false //选择月份
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRange === true) { //是日期范围选择，要更新最大值与最小值
      this.setState({
        year: nextProps.year ? nextProps.year : this.state.year,
        month: nextProps.month ? nextProps.month : this.state.month,
        day: nextProps.day,
        isRange: nextProps.isRange,
        min: nextProps.min,
        max: nextProps.max
      });
    } else {
      this.setState({
        year: nextProps.year ? nextProps.year : this.state.year,
        month: nextProps.month ? nextProps.month : this.state.month,
        day: nextProps.day,
        isRange: nextProps.isRange
      });
    }
  }

  formatDate(date, format) {
    /**
     * 对Date的扩展，将 Date 转化为指定格式的String
     * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * eg:
     * Utils.formatDate(new Date(),'yyyy-MM-dd') ==> 2014-03-02
     * Utils.formatDate(new Date(),'yyyy-MM-dd hh:mm') ==> 2014-03-02 05:04
     * Utils.formatDate(new Date(),'yyyy-MM-dd HH:mm') ==> 2014-03-02 17:04
     * Utils.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
     * Utils.formatDate(new Date(),'yyyy-MM-dd E HH:mm:ss') ==> 2009-03-10 二 20:09:04
     * Utils.formatDate(new Date(),'yyyy-MM-dd EE hh:mm:ss') ==> 2009-03-10 周二 08:09:04
     * Utils.formatDate(new Date(),'yyyy-MM-dd EEE hh:mm:ss') ==> 2009-03-10 星期二 08:09:04
     * Utils.formatDate(new Date(),'yyyy-M-d h:m:s.S') ==> 2006-7-2 8:9:4.18
     */
    if (!date) return;
    const o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12), //小时
      "H+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
    };
    const week = {
      "0": '\u65e5',
      "1": '\u4e00',
      "2": '\u4e8c',
      "3": '\u4e09',
      "4": '\u56db',
      "5": '\u4e94',
      "6": '\u516d'
    };

    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    if (/(E+)/.test(format)) {
      format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[date.getDay() + '']);
    }

    for (let k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return format;
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
      <div className={Styles.Calendar}>
        <CalendarHeader
          year={this.state.year}
          month={this.state.month}
          onChange={this.updateYearAndMonth.bind(this)}
        />
        <TableBody
          render={this.props.renderBody}
          year={this.state.year}
          month={this.state.month}
        />
      </div>
    );
  }
}


export default ScheduleCalendarTable;
