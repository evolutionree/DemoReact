/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { DatePicker, Checkbox, Select } from 'antd';
import _ from 'lodash';
import Styles from './TimePicker.less';

const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;


class TimePicker extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      data: {
        allDay: false,
        repeat: false
      }
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });
  }

  onChange(value, dateString) {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  }

  onOk(value) {
    console.log('onOk: ', value);
  }

  checkChangeHandler = (checkedList) => {
    console.log(checkedList)
    this.setState({
      checkedList
    });
  }

  endDateChange() {

  }

  render() {
    const options = [
      { label: '全天', value: 'allday' },
      { label: '重复', value: 'repeat' }
    ];
    const allDayChecked = _.indexOf(this.state.checkedList, 'allday') > -1 ? true : false;
    const repeatChecked = _.indexOf(this.state.checkedList, 'repeat') > -1 ? true : false;
    return (
      <div className={Styles.TimePickerWrap}>
        <RangePicker
          showTime={allDayChecked ? false : { format: 'HH:mm' }}
          format={allDayChecked ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
          placeholder={['开始时间', '结束时间']}
          style={{ marginBottom: '4px', width: '100%' }}
          onChange={this.onChange.bind(this)}
          onOk={this.onOk.bind(this)}
        />
        <CheckboxGroup options={options} value={this.state.checkedList} onChange={this.checkChangeHandler} />
        <div className={Styles.repertSetWrap} style={{ display: repeatChecked ? 'block' : 'none' }}>
          <div className={Styles.arrow_area_wrap}><div className={Styles.arrow_area_inside}></div></div>
          <div className={Styles.content}>
              <ul>
                <li>
                  <span>重复类型 :</span>
                  <Select defaultValue="lucy" style={{ width: 120 }}>
                    <Option value="jack">每日重复</Option>
                    <Option value="lucy">每周重复</Option>
                    <Option value="disabled">每月重复</Option>
                  </Select>
                </li>
                <li>
                  <span>结束条件 :</span>
                  <Select defaultValue="lucy" style={{ width: 120, marginRight: '8px' }}>
                    <Option value="jack">永不结束</Option>
                    <Option value="lucy">结束日期</Option>
                  </Select>
                  <DatePicker onChange={this.endDateChange.bind(this)} />
                </li>
              </ul>
          </div>
        </div>
      </div>
    );
  }
}


export default TimePicker;
