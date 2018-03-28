/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Row, Col } from 'antd';
import SelectBar from './SelectBar';
import { connect } from 'dva';
import _ from 'lodash';
import Styles from './WorkDaySet.less';

class WorkDaySet extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      mainClass: ''
    };
  }

  componentWillReceiveProps(nextProps) {

  }


  handleOk = () => {

  };

  changeMainRadio = (value) => {
    let newWeekClass = {};
    for (let i in this.props.value) {
      newWeekClass[i] = value;
    }
    this.setState({
      mainClass: value
    });
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  changeWeekRadio(weekName, value) {
    let newWeekClass = _.cloneDeep(this.props.value);
    newWeekClass[weekName] = value;
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
                    <Col span={12}><span style={{ paddingLeft: '8px' }}>{item.text}</span></Col>
                    <Col span={12}><SelectBar dataSource={dataSource} value={value[item.value].id} onChange={this.changeWeekRadio.bind(this, item.value)} /></Col>
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
