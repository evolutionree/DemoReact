/**
 * Created by 0291 on 2017/12/20.
 */
import React, { Component } from 'react';
import Styles from './index.less';
import classnames from 'classnames';

class TableBody extends Component {
  static propTypes = {
    year: React.PropTypes.number, //年
    month: React.PropTypes.number, //月
    day: React.PropTypes.number, //日
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
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month
    });
  }

  componentWillMount() {
    document.removeEventListener('mousedown', this.onDocumentMouseDown.bind(this));
  }

  onDocumentMouseDown(e) {
    let selList = this.refs.dayUl.children;
    let isSelect = true;

    let evt = window.event || e;
    let startX = (evt.x || evt.clientX);
    let startY = (evt.y || evt.clientY);

    let firstSelectDivIndex = '';
    for (let i = 0; i < selList.length; i++) {
      let clientLeft = selList[i].getBoundingClientRect().left;
      let clientRight = selList[i].getBoundingClientRect().right;
      let clientTop = selList[i].getBoundingClientRect().top;
      let clientBottom = selList[i].getBoundingClientRect().bottom;

      if (startX > clientLeft && startX < clientRight && startY > clientTop && startY < clientBottom) {
        firstSelectDivIndex = i;
      }

      // if (Math.max(_x, startX) > clientLeft && Math.max(_y, startY) > clientTop && dl > (Math.max(_x, startX) - _w) && dt > (Math.max(_y, startY) - _h)) {
      //   if (selList[i].className.indexOf('seled') === -1) {
      //     selList[i].className = selList[i].className + ' seled';
      //   }
      // } else {
      //   if (selList[i].className.indexOf('seled') !== -1) {
      //     selList[i].className = 'fileDiv';
      //   }
      // }
    }

    let _x = null;
    let _y = null;

    this.clearEventBubble(evt);

    const _this = this;

    document.onmousemove = function(moveE) {
      evt = window.event || moveE;
      if (isSelect) {
        _x = (evt.x || evt.clientX);
        _y = (evt.y || evt.clientY);

        let finalSelectDivIndex = '';
        for (let i = 0; i < selList.length; i++) {
          let clientLeft = selList[i].getBoundingClientRect().left;
          let clientRight = selList[i].getBoundingClientRect().right;
          let clientTop = selList[i].getBoundingClientRect().top;
          let clientBottom = selList[i].getBoundingClientRect().bottom;

          if (_x > clientLeft && _x < clientRight && _y > clientTop && _y < clientBottom) {
            finalSelectDivIndex = i;
          }
        }

        for (let i = 0; i < selList.length; i++) {
          if (firstSelectDivIndex !== '' && finalSelectDivIndex !== '' && i >= Math.min(firstSelectDivIndex, finalSelectDivIndex) && i <= Math.max(firstSelectDivIndex, finalSelectDivIndex)) {
            if (selList[i].className.indexOf('seled') === -1) {
              selList[i].className = selList[i].className + ' seled';
            }
          } else {
            if (selList[i].className.indexOf('seled') !== -1) {
              selList[i].className = '';
            }
          }
        }
      }
      _this.clearEventBubble(evt);
    }

    document.onmouseup = () => {
      isSelect = false;
      this.showSelDiv(selList);
      selList = null, _x = null, _y = null, startX = null, startY = null, evt = null;
    };
  }

  clearEventBubble(evt) {
    if (evt.stopPropagation)
      evt.stopPropagation();
    else
      evt.cancelBubble = true;
    if (evt.preventDefault)
      evt.preventDefault();
    else
      evt.returnValue = false;
  }

  showSelDiv(arr) {
    let count = 0;
    let selInfo = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].className.indexOf('seled') !== -1) {
        count++;
        selInfo += arr[i].innerHTML + '\n';
      }
    }
    //alert("共选择 " + count + " 个文件，分别是：\n" + selInfo);
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

    let node1 = arry1.map(function(item, i) {
      return <li key={'li1' + i} className={Styles.otherMonthDay}><div>{item}</div></li>;
    })

    let node2 = arry2.map((item, i) => {
      const today_year = new window.Date().getFullYear();
      const today_month = new window.Date().getMonth() + 1
      const today_day = new window.Date().getDate();

      const liClassName = classnames([{
        [Styles.active]: item === 13,
        [Styles.today]: item === today_day && parseInt(this.state.year) === today_year && parseInt(this.state.month) === today_month,
        [Styles.hasScheduleOrTask]: item === 11
      }]);
      return <li key={'li1' + i} className={liClassName}><div>{item}</div></li>;
    })

    let node3 = arry3.map(function(item, i) {
      return <li key={'li3' + i} className={Styles.otherMonthDay}><div>{item}</div></li>;
    })

    return (
      <div className={Styles.CalendarBody}>
        <ul className={Styles.dayTitleList}>
          <li>日</li>
          <li>一</li>
          <li>二</li>
          <li>三</li>
          <li>四</li>
          <li>五</li>
          <li>六</li>
        </ul>
        <div className={Styles.body}>
          <ul className={Styles.dayList} ref="dayUl">
            {node1} {node2} {node3}
          </ul>
        </div>
      </div>
    );
  }
}


export default TableBody;
