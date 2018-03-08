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
      valueObj: {
        mainClass: '1',
        weekClass: {
          1: {
            checkbox: true,
            class: '1'
          },
          2: {
            checkbox: true,
            class: '1'
          },
          3: {
            checkbox: true,
            class: '1'
          },
          4: {
            checkbox: true,
            class: '1'
          },
          5: {
            checkbox: true,
            class: '1'
          },
          6: {
            checkbox: true,
            class: '1'
          },
          7: {
            checkbox: true,
            class: '1'
          }
        }
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {

    } else if (isClosing) {

    }
  }


  handleOk = () => {

  };

  changeMainRadio = (value) => {
    let newWeekClass = {};
    for (let i in this.state.valueObj.weekClass) {
      newWeekClass[i] = {
        ...this.state.valueObj.weekClass,
        class: value
      };
    }
    this.setState({
      valueObj: {
        mainClass: value,
        weekClass: newWeekClass
      }
    });
  }

  render() {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dataSource = [{ text: 'A班次', value: '1' }, { text: 'B班次', value: '2' }, { text: 'C班次', value: '3' }, { text: 'D班次', value: '4' }];
    const showObj = _.find(dataSource, item => item.value === this.state.valueObj.mainClass);
    return (
      <div className={Styles.WorkDaySetWrap}>
        <div>
          <span>快捷设置班次</span>
          <div className={Styles.header}>
            <span>{showObj && showObj.text}</span>
            <SelectBar defaultText="更改班次" dataSource={dataSource} value={this.state.valueObj.mainClass} onChange={this.changeMainRadio} />
          </div>
        </div>
        <div>
          <Row>
            <Col span={12}>工作日</Col>
            <Col span={12}>班次</Col>
          </Row>
        </div>
        <ul>
          {
            days.map((item, index) => {
              return (
                <li>
                  <Row>
                    <Col span={12}><Checkbox /><span style={{ paddingLeft: '8px' }}>{item}</span></Col>
                    <Col span={12}><SelectBar dataSource={dataSource} value={this.state.valueObj.weekClass[index + 1].class} /></Col>
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
