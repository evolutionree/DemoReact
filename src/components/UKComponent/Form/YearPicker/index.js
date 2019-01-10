/**
 * TODO: 项目使用的antd 版本无 选择年的控件
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import { is } from 'immutable';
import styles from './index.less';//这个文件自己选择一个温暖的地方放

class YearPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      selectedyear: '',
      years: []
    };
  }

  componentWillMount() {
    let { value } = this.props;
    this.setState({ selectedyear: value });
  }

  componentDidMount() {
    document.addEventListener('click', this.documentClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.documentClick);
  }

  componentWillReceiveProps(nextProps) {
    let { value } = nextProps;
    this.setState({ selectedyear: value });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  documentClick = (e) => {
    const { isShow } = this.state;
    let clsName = e.target.className;
    if (clsName.indexOf('calendar') === -1 && e.target.tagName !== 'BUTTON' && isShow) {
      this.hide();
    }
  }

  //初始化数据处理
  initData = (operand, defaultValue) => {
    let currentValue = defaultValue * 1;
    if (!defaultValue) {
      currentValue = new Date().getFullYear();
    }
    operand = operand ? operand : 12;
    let year = currentValue - 1970;
    let curr = year % operand;
    let start = currentValue - curr;
    let end = currentValue + operand - 1 - curr;
    this.getYearsArr(start, end);
  };

  //   获取年份范围数组
  getYearsArr = (start, end) => {
    let arr = [];
    for (let i = start; i <= end; i++) {
      arr.push(Number(i));
    }
    this.setState({
      years: arr
    });
  };

  // 显示日历年组件
  show = () => {
    const { selectedyear } = this.state;
    let { operand } = this.props;
    operand = operand ? operand : 12;
    this.initData(operand, selectedyear);
    this.setState({ isShow: true });
  };

  // 隐藏日期年组件
  hide = () => {
    this.setState({ isShow: false });
  };

  // 向前的年份
  prev = () => {
    const { years } = this.state;
    if (years[0] <= 1970) {
      return;
    }
    this.getNewYearRangestartAndEnd('prev');
  };

  // 向后的年份
  next = () => {
    this.getNewYearRangestartAndEnd('next');
  };

  //   获取新的年份
  getNewYearRangestartAndEnd = type => {
    const { selectedyear, years } = this.state;
    let operand = Number(this.props.operand);
    operand = operand ? operand : 12;
    let start = Number(years[0]);
    let end = Number(years[years.length - 1]);
    let newstart;
    let newend;
    if (type === 'prev') {
      newstart = parseInt(start - operand);
      newend = parseInt(end - operand);
    }
    if (type === 'next') {
      newstart = parseInt(start + operand);
      newend = parseInt(end + operand);
    }
    this.getYearsArr(newstart, newend);
  };

  // 选中某一年
  selects = e => {
    let val = Number(e.target.value);
    this.hide();
    this.setState({ selectedyear: val });
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  };

  render() {
    const { isShow, years, selectedyear } = this.state;
    return (
      <div className={styles['calendar-wrap']}>
        <div className={styles['calendar-input']}>
          <input
            className={styles['calendar-value']}
            placeholder="请选择年份"
            onFocus={this.show}
            value={selectedyear}
            readOnly
          />
          <Icon type="calendar" className={styles['calendar-icon']} />
        </div>
        {isShow ? (
          <List
            data={years}
            value={selectedyear}
            prev={this.prev}
            next={this.next}
            onSelect={this.selects}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}
const List = props => {
  const { data, value, prev, next, onSelect } = props;
  return (
    <div className={styles['calendar-container']}>
      <div className={styles['calendar-head-year']}>
        <Icon
          type="double-left"
          className={classnames([styles['calendar-btn'], styles['prev-btn']])}
          title=""
          onClick={prev}
        />
        <span className={styles['calendar-year-range']}>{`${data[0]} - ${data[data.length - 1]}`}</span>
        <Icon
          type="double-right"
          className={classnames([styles['calendar-btn'], styles['next-btn']])}
          title=""
          onClick={next}
        />
      </div>
      <div className={styles['calendar-body-year']}>
        <ul className={styles['calendar-year-ul']}>
          {data.map((item, index) => (
            <li
              key={index}
              title={item}
              className={
                classnames(styles['calendar-year-li'],
                { [styles['calendar-year-selected']]: item * 1 === value * 1 })
              }
            >
              <button onClick={onSelect} value={item}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default YearPicker;
