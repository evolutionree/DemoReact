/**
 * Created by 0291 on 2017/8/22.
 */
import React, { Component } from 'react';
import SelectUser from '../../../../components/DynamicForm/controls/SelectUser';
import SelectDepartment from '../../../../components/DynamicForm/controls/SelectDepartment';
import { message, Input } from 'antd';
import { connect } from 'dva';


class ModalSelect extends Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    const userInfo = this.props.user;
    if (nextProps.modalType !== this.props.modalType) {
      this.setState({
        value: nextProps.modalType === '1' ? userInfo.deptid : userInfo.userid
      });
      this.props.onChange && this.props.onChange(nextProps.modalType === '1' ? userInfo.deptid : userInfo.userid);
    } else {
      this.setState({
        value: nextProps.value
      });
    }
  }

  showInfo() {
    message.info('请先选择类型,确定按部门/人员选择');
  }

  render() {
    switch (this.props.modalType) {
      case '1': // 按团队
        return (
          <div style={{ width: 200 }}>
            <SelectDepartment onChange={(userIds) => { this.props.onChange(userIds) }} value={this.state.value} multiple={this.props.multiple} />
          </div>
        );
      case '2': // 按个人
        return (
          <div style={{ width: 150 }}>
            <SelectUser onChange={(userIds) => { this.props.onChange(userIds) }} placeholder="请选择人员" value={this.state.value} multiple={this.props.multiple} />
          </div>
        );
      default:
        return (
          <Input value={this.props.value_name} placeholder='部门/人员选择' onClick={this.showInfo.bind(this)} style={{ width: 150, color: '#999' }} />
        );
    }
  }
}

export default connect(state => state.app)(ModalSelect);
