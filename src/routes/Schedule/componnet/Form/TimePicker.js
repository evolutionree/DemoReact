/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { DatePicker, Checkbox, Select } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import SelectSingle from '../../../../components/DynamicForm/controls/SelectSingle';
import Styles from './TimePicker.less';

const { RangePicker } = DatePicker;


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
        repeat: false,
        repeatCheckedVisible: false,
        repeatEndTimeVisible: false
      }
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });
  }

  setValue(value, length, fieldname) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: value
    }, fieldname, true);
  }

  dateTimeChange(value, dateString) {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
    //starttime  endtime

    this.props.onChange && this.props.onChange({
      ...this.props.value,
      starttime: dateString[0]
    }, 'starttime', false);
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      endtime: dateString[1]
    }, 'endtime', false);
  }

  onOk(value) {
    console.log('onOk: ', value);
  }

  alldayCheckHandler = (fieldname, e) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      allday: e.target.checked ? 1 : 0
    }, fieldname, false);
  }

  repeatCheckHandler = (e) => {
    this.setState({
      repeatCheckedVisible: e.target.checked
    });
  }


  onFieldControlRef = (fieldname, ref) => {
    this[`SelectInput${fieldname}`] = ref;
  };

  repeatSelectChange(fieldname, value, isFromApi = false) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: value
    }, fieldname, isFromApi);
  }


  repeatEndSelectChange(fieldname, value, isFromApi = false) {
    let repeatEndTimeVisible = false
    if (value === 2) {
      repeatEndTimeVisible = true;
    }
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: {
        endtype: value,
        enddate: ''
      }
    }, fieldname, isFromApi);

    this.setState({
      repeatEndTimeVisible: repeatEndTimeVisible
    });
  }

  endDateChange(fieldname, value, dateString) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: {
        ...this.props.value && this.props.value[fieldname],
        enddate: dateString
      }
    });
  }

  getFieldProcol(fieldname) {
    return _.find(this.props.fields, item => item.fieldname === fieldname);
  }

  render() {
    if (!this.props.fields) {
      return null;
    }
    const value = this.props.value;

    const starttimeField = this.getFieldProcol('starttime');
    const starttimeValue = starttimeField && value && value[starttimeField.fieldname] || starttimeField.fieldconfig.defaultValue;

    const endtimeField = this.getFieldProcol('endtime');
    const endtimeValue = endtimeField && value && value[endtimeField.fieldname] || endtimeField.fieldconfig.defaultValue;

    const alldayField = this.getFieldProcol('allday');
    const alldayValue = alldayField && value && value[alldayField.fieldname] || alldayField.fieldconfig.defaultValue;

    const repeatTypeField = this.getFieldProcol('repeatType');
    const repeatTypeValue = repeatTypeField && value && value[repeatTypeField.fieldname] || repeatTypeField.fieldconfig.defaultValue;

    const repeatEndField = this.getFieldProcol('repeatEnd');
    const repeatEndValue = repeatEndField && value && value[repeatEndField.fieldname] && value[repeatEndField.fieldname].endtype || repeatEndField.fieldconfig.defaultValue;

    const repeatEnddateValue = value && value[repeatEndField.fieldname] && value[repeatEndField.fieldname].enddate;

    const format = alldayValue === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';

    return (
      <div className={Styles.TimePickerWrap}>
        <RangePicker
          showTime={alldayValue === 1 ? false : { format: 'HH:mm' }}
          format={format}
          value={(starttimeValue && endtimeValue) ? [moment(starttimeValue, format), moment(endtimeValue, format)] : null}
          placeholder={['开始时间', '结束时间']}
          style={{ marginBottom: '4px', width: '100%' }}
          onChange={this.dateTimeChange.bind(this)}
          onOk={this.onOk.bind(this)}
        />
        <Checkbox onChange={this.alldayCheckHandler.bind(this, alldayField && alldayField.fieldname)} disabled={0 === 1} checked={alldayValue === 1}>全天</Checkbox>
        <Checkbox onChange={this.repeatCheckHandler}>重复</Checkbox>
        <div className={Styles.repertSetWrap} style={{ display: this.state.repeatCheckedVisible ? 'block' : 'none' }}>
          <div className={Styles.arrow_area_wrap}><div className={Styles.arrow_area_inside}></div></div>
          <div className={Styles.content}>
              <ul>
                <li>
                  <span>重复类型 :</span>
                  <div style={{ width: 120, display: 'inline-block' }}>
                    <SelectSingle ref={this.onFieldControlRef.bind(this, repeatTypeField && repeatTypeField.fieldname)} onChange={this.repeatSelectChange.bind(this, repeatTypeField && repeatTypeField.fieldname)} value={repeatTypeValue} {...repeatTypeField.fieldconfig} />
                  </div>
                </li>
                <li style={{ display: (repeatTypeValue && repeatTypeValue != 1) ? 'block' : 'none' }}>
                  <span>结束条件 :</span>
                  <div style={{ width: 120, display: 'inline-block', marginRight: '8px' }}>
                    <SelectSingle ref={this.onFieldControlRef.bind(this, repeatEndField && repeatEndField.fieldname)} onChange={this.repeatEndSelectChange.bind(this, repeatEndField && repeatEndField.fieldname)} value={repeatEndValue} {...repeatEndField.fieldconfig} />
                  </div>
                  <span style={{ display: this.state.repeatEndTimeVisible ? 'inline-block' : 'none' }}>
                    <DatePicker onChange={this.endDateChange.bind(this, repeatEndField.fieldname)} value={repeatEnddateValue ? moment(repeatEnddateValue, 'YYYY/MM/DD') : null} format="YYYY/MM/DD" />
                  </span>
                </li>
              </ul>
          </div>
        </div>
      </div>
    );
  }
}


export default TimePicker;
