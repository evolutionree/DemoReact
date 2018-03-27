/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col, Checkbox } from 'antd';
import SelectBar from './SelectBar';
import { connect } from 'dva';
import _ from 'lodash';
import Styles from './WorkDaySet.less';

class WorkDaySet extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      mainClass: this.props.classDataSource instanceof Array && this.props.classDataSource.length > 0 && this.props.classDataSource[0].id
    };
  }

  componentWillReceiveProps(nextProps) {

  }


  handleOk = () => {

  };

  changeMainRadio = (value) => {
    let newWeekClass = {};
    for (let i in this.props.value) {
      newWeekClass[i] = {
        ...this.props.value[i],
        class: value
      };
    }
    this.setState({
      mainClass: value
    });
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  changeWeekRadio(weekName, value) {
    let newWeekClass = _.cloneDeep(this.props.value);
    newWeekClass[weekName] = {
      ...this.props.value[weekName],
      class: value
    };
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  checkChange(weekName, e) {
    let newWeekClass = _.cloneDeep(this.props.value);
    newWeekClass[weekName] = {
      ...this.props.value[weekName],
      checkbox: e.target.checked ? 1 : 0
    };
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  render() {
    const value = this.props.value;
    const days = [{ value: 'monschedule', text: '周一' }, { value: 'tuesschedule', text: '周二' }, { value: 'wednesschedule', text: '周三' }, { value: 'thursschedule', text: '周四' },
      { value: 'frischedule', text: '周五' }, { value: 'saturschedule', text: '周六' }, { value: 'sunschedule', text: '周日' }];
    const dataSource = this.props.classDataSource;
    return (
      <div className={Styles.WorkDaySetWrap}>
        <div>
          <span>快捷设置班次</span>
          <div className={Styles.header}>
            <SelectBar defaultText="更改班次" dataSource={dataSource} value={this.state.mainClass} onChange={this.changeMainRadio} />
          </div>
        </div>
        <div>
          <Row>
            <Col span={12} style={{ color: '#767f8b' }}>工作日</Col>
            <Col span={12} style={{ color: '#767f8b' }}>班次</Col>
          </Row>
        </div>
        <ul>
          {
            days.map((item, index) => {
              return (
                <li key={index}>
                  <Row>
                    <Col span={12}><Checkbox checked={value[item.value].checkbox === 1} onChange={this.checkChange.bind(this, item.value)} /><span style={{ paddingLeft: '8px' }}>{item.text}</span></Col>
                    <Col span={12}><SelectBar dataSource={dataSource} value={value[item.value].class} onChange={this.changeWeekRadio.bind(this, item.value)} /></Col>
                  </Row>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default connect(
  state => {
    const { classDataSource } = state.attendanceGroupSet;
    return {
      classDataSource: classDataSource
    };
  })(WorkDaySet);
