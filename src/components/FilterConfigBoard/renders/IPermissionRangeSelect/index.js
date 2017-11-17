import React, { PropTypes, Component } from 'react';
import { Modal, Input } from 'antd';
import IPermissionRangeSelectModal from './IPermissionRangeSelectModal';
import { getAllUsersInCached } from '../../../../services/structure';

class IPermissionRangeSelect extends Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
    this.fetchAllUser();
  }

  fetchAllUser = () => {
    getAllUsersInCached().then(result => {
      this.setState({ allUsers: result.data });
    });
  };

  handleModalConfirm = ({ dataVal, users, departments }) => {
    this.props.onChange(this.formatToValue({ dataVal, users, departments }));
    this.setState({ modalVisible: false });
  };

  cancelModal = () => {
    this.setState({ modalVisible: false });
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  formatToValue = ({ dataVal, users, departments }) => {
    const userIds = users.map(user => user.id).join(',');
    const userNames = users.map(user => user.name).join(',');
    const deptIds = departments.map(dept => dept.id).join(',');
    const deptNames = departments.map(dept => dept.name).join(',');
    return {
      dataVal,
      users: userIds,
      users_name: userNames,
      deptids: deptIds,
      deptids_name: deptNames
    };
  };

  parseValue = () => {
    const dataValNameMap = {
      '{currentUser}': '本人',
      '{currentDepartment}': '本团队',
      '{subDepartment}': '本团队及下级团队'
    };

    const {
      dataVal = '',
      users = '',
      users_name = '',
      deptids = '',
      deptids_name = ''
    } = this.props.value;

    let arrUsers = [];
    let arrDepartments = [];
    if (users) {
      const arrUserName = users_name.split(',');
      arrUsers = users.split(',').map((id, index) => ({
        id: parseInt(id),
        name: arrUserName[index]
      }));
    }
    if (deptids) {
      const arrDeptName = deptids_name.split(',');
      arrDepartments = deptids.split(',').map((id, index) => ({
        id,
        name: arrDeptName[index]
      }));
    }

    const dataVal_name = dataValNameMap[dataVal] || '';
    const displayName = [dataVal_name, users_name, deptids_name].filter(item => !!item).join(',');

    return {
      displayName,
      dataVal,
      users: arrUsers,
      departments: arrDepartments
    };
  };

  render() {
    const inputStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'pointer'
    };
    const { displayName, users, departments, dataVal } = this.parseValue();
    return (
      <div>
        <div className="ant-input" onClick={this.showModal} style={inputStyle}>
          <span title={displayName}>{displayName}</span>
        </div>
        <IPermissionRangeSelectModal
          visible={this.state.modalVisible}
          dataVal={dataVal}
          users={users}
          departments={departments}
          onConfirm={this.handleModalConfirm}
          cancelModal={this.cancelModal}
        />
      </div>
    );
  }
}

export default IPermissionRangeSelect;
