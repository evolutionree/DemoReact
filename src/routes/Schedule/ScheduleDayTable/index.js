/**
 * Created by 0291 on 2017/12/25.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import CalendarHeader from '../componnet/Calendar/CalendarHeader';
import DragSelectList from '../componnet/DragSelectList/index';
import Styles from './index.less';

const timeArray = ['0:00', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30']
const otherHeight = 60 + 48 + 10; //60：系统logo栏  48：页标栏  10： padding
class ScheduleDayTable extends Component {
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
      month: this.props.month,
      height: document.body.clientHeight - otherHeight
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month
    });
  }

  onWindowResize = () => {
    this.setState({
      height: document.body.clientHeight - otherHeight
    });
  }

  componentWillMount() {
    window.removeEventListener('resize', this.onWindowResize);
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
      <div className={Styles.ScheduleDayTable}>
        <div>
          <CalendarHeader
            year={this.state.year}
            month={this.state.month}
            onChange={this.updateYearAndMonth.bind(this)}
          />
          <ul className={Styles.headerTable}>
            <li>本天日程内容</li>
            <li>
              <div>全天</div>
              <div></div>
            </li>
          </ul>
        </div>
        <div className={Styles.tableWrap} style={{ height: this.state.height - 50 - 100 }}>
          <div className={Styles.left}>
            <ul>
              {
                timeArray.map((item, index) => {
                  return <li key={index}>{item}</li>;
                })
              }
            </ul>
          </div>
          <DragSelectList />
        </div>
      </div>
    );
  }
}


export default ScheduleDayTable;
