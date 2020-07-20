import React from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import Search from '../../../../components/Search';
import Toolbar from '../../../../components/Toolbar';
import DepartmentSelect from '../../../../components/DepartmentSelect';
import { queryUsers } from '../../../../services/structure';
import styles from './SelectUser.less';

class TransferModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    modalPending: React.PropTypes.bool
  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentSelected: '',
      userList: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
        currentSelected: nextProps.selectedUsers
      });
      this.fetchUserList();
    }
  }

  fetchUserList = () => {
    const params = {
      userName: this.state.searchName,
      deptId: this.state.deptId,
      userPhone: '',
      pageSize: 9999,
      pageIndex: 1,
      recStatus: 1,
      iscrmuser: -1,
      iscontrol: 1
    };
    queryUsers(params).then(result => {
      const userList = result.data.pagedata;
      this.setState({
        userList,
        currentSelected: ''
      });
    });
  };

  handleOk = () => {
    if (!this.state.currentSelected) {
      return message.error('请选择人员');
    }
    this.props.onOk(this.state.currentSelected);
  };

  onDeptChange = (value) => {
    this.setState({ deptId: value });
  };

  onSearch = (keyword) => {
    this.setState({
      searchName: keyword,
      currentSelected: ''
    }, this.fetchUserList);
  };

  select = user => {
    this.setState({
      currentSelected: user.userid
    });
  };

  render() {
    const { visible, onCancel, modalPending } = this.props;
    const { currentSelected } = this.state;
    return (
      <Modal
        title="选择人员"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={modalPending}
      >
        <Toolbar>
          <DepartmentSelect value={this.state.deptId} onChange={this.onDeptChange} width="200px" />
          <Search
            width="200px"
            value={this.state.searchName}
            onSearch={this.onSearch}
            placeholder="请输入人员姓名"
          >
            搜索
          </Search>
        </Toolbar>
        <ul className={styles.userlist}>
          {this.state.userList.map(user => {
            const cls = currentSelected === user.userid ? styles.highlight : '';
            return (
              <li key={user.userid} onClick={this.select.bind(this, user)} className={cls}>
                <span title={user.username}>{user.username}</span>
                <span title={user.deptname}>{user.deptname}</span>
              </li>
            );
          })}
        </ul>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending } = state.entcommRel;
    return {
      visible: /transfer/.test(showModals),
      modalPending
    };
  },
  dispatch => {
    return {
      onOk(userId) {
        dispatch({ type: 'entcommRel/transfer', payload: userId });
      },
      onCancel() {
        dispatch({ type: 'entcommRel/showModals', payload: '' });
      }
    };
  }
)(TransferModal);
