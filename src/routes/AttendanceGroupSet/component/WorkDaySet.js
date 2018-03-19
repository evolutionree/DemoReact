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
      mainClass: '1'
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

  changeWeekRadio(weekNum, value) {
    let newWeekClass = _.cloneDeep(this.props.value);
    newWeekClass[weekNum + 1] = {
      ...this.props.value[weekNum + 1],
      class: value
    };
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  checkChange(weekNum, e) {
    let newWeekClass = _.cloneDeep(this.props.value);
    newWeekClass[weekNum + 1] = {
      ...this.props.value[weekNum + 1],
      checkbox: e.target.checked ? 1 : 0
    };
    this.props.onChange && this.props.onChange(newWeekClass);
  }

  render() {
    const value = this.props.value;
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dataSource = [{ text: 'A班次', value: '1' }, { text: 'B班次', value: '2' }, { text: 'C班次', value: '3' }, { text: 'D班次', value: '4' }];
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
                    <Col span={12}><Checkbox checked={value[index + 1].checkbox === 1} onChange={this.checkChange.bind(this, index)} /><span style={{ paddingLeft: '8px' }}>{item}</span></Col>
                    <Col span={12}><SelectBar dataSource={dataSource} value={value[index + 1].class} onChange={this.changeWeekRadio.bind(this, index)} /></Col>
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

export default WorkDaySet;
