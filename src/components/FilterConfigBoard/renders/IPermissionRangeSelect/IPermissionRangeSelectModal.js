import React, { PropTypes, Component } from 'react';
import { Modal, Radio, Checkbox, Button } from 'antd';
import _ from 'lodash';
import DeptSelect from './DeptSelect';
import UserSelect from './UserSelect';

class IPermissionRangeSelectModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dataVal: PropTypes.oneOf(['{currentUser}', '{currentDepartment}', '{subDepartment}', '']),
    users: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })),
    departments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    onConfirm: PropTypes.func.isRequired,
    cancelModal: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      dataVal: '{currentUser}',
      users: [],
      usersChecked: false,
      departments: [],
      departmentsChecked: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        dataVal: nextProps.dataVal || '{currentUser}',
        users: nextProps.users || [],
        usersChecked: nextProps.users && nextProps.users.length,
        departments: nextProps.departments || [],
        departmentsChecked: nextProps.departments && nextProps.departments.length
      });
    }
  }

  handleDatavalChange = (dataVal, event) => {
    if (event.target.checked === false) {
      this.setState({ dataVal: '{}' });
    } else {
      this.setState({ dataVal });
    }
  };

  handleUsersChange = users => {
    this.setState({
      users,
      usersChecked: !!users.length
    });
  };

  handleDeptsChange = departments => {
    this.setState({
      departments,
      departmentsChecked: !!departments.length
    });
  };

  handleOk = () => {
    const { dataVal, users, departments, usersChecked, departmentsChecked } = this.state;
    this.props.onConfirm({
      dataVal,
      users: usersChecked ? users : [],
      departments: departmentsChecked ? departments : []
    });
  };

  render() {
    const { dataVal, users, departments, usersChecked, departmentsChecked } = this.state;
    return (
      <Modal
        title="数据权限范围"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.cancelModal}
      >
        <div>
          {/*<Radio.Group value={dataVal} onChange={this.handleDatavalChange}>*/}
            {/*<Radio value="{currentUser}">本人</Radio>*/}
            {/*<Radio value="{currentDepartment}">本团队</Radio>*/}
            {/*<Radio value="{subDepartment}">本团队及下级团队</Radio>*/}
          {/*</Radio.Group>*/}
          <Checkbox checked={dataVal === '{currentUser}'} onChange={this.handleDatavalChange.bind(this, '{currentUser}')}>本人</Checkbox>
          <Checkbox checked={dataVal === '{currentDepartment}'} onChange={this.handleDatavalChange.bind(this, '{currentDepartment}')}>本团队</Checkbox>
          <Checkbox checked={dataVal === '{subDepartment}'} onChange={this.handleDatavalChange.bind(this, '{subDepartment}')}>本团队及下级团队</Checkbox>
          <Checkbox checked={dataVal === '{noLeaderDepartment}'} onChange={this.handleDatavalChange.bind(this, '{noLeaderDepartment}')}>无领导的团队</Checkbox>
        </div>
        <div style={{ margin: '10px 0' }}>
          <Checkbox
            style={{ marginBottom: '10px' }}
            checked={usersChecked}
            onChange={e => this.setState({ usersChecked: e.target.checked })}
          >
            特定人（多选）
          </Checkbox>
          <UserSelect value={users} onChange={this.handleUsersChange} />
        </div>
        <div style={{ margin: '10px 0' }}>
          <Checkbox
            style={{ marginBottom: '10px' }}
            checked={departmentsChecked}
            onChange={e => this.setState({ departmentsChecked: e.target.checked })}
          >
            特定团队（多选）
          </Checkbox>
          <DeptSelect value={departments} onChange={this.handleDeptsChange} />
        </div>
      </Modal>
    );
  }
}

export default IPermissionRangeSelectModal;
