import React from 'react';
import { Modal, message } from 'antd';
import Search from '../../../../components/Search';
import Toolbar from '../../../../components/Toolbar';
import DepartmentSelect from '../../../../components/DepartmentSelect';
import { queryUsers } from '../../../../services/structure';
import styles from './styles.less';

class DeptSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool.isRequired,
    onOk: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currUser: null,
      userList: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
        currUser: null
      });
      this.fetchUserList();
    }
  }

  onChange = (ids, nodes) => {
    this.setState({
      currUser: nodes.map(node => ({
        name: node.deptname,
        id: node.deptid
      }))
    });
  };

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
        currUser: null
      });
    });
  };

  handleOk = () => {
    if (!this.state.currUser) {
      message.error('请选择用户');
      return;
    }
    this.props.onOk(this.state.currUser);
  };

  onDeptChange = (value) => {
    this.setState({ deptId: value });
  };

  onSearch = (keyword) => {
    this.setState({
      searchName: keyword
    });
    setTimeout(() => {
      this.fetchUserList();
    }, 50);
  };

  select = user => {
    this.setState({
      currUser: {
        name: user.username,
        id: user.userid + ''
      }
    });
  };

  render() {
    const { deptId, searchName, userList, currUser } = this.state;
    const { visible, onCancel } = this.props;
    return (
      <Modal
        title="选择人员"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <Toolbar>
          <DepartmentSelect value={deptId} onChange={this.onDeptChange} width="200px" />
          <Search
            width="200px"
            value={searchName}
            onSearch={this.onSearch}
            placeholder="请输入人员姓名"
          >
            搜索
          </Search>
        </Toolbar>
        <ul className={styles.userlist}>
          {userList.map(user => (
            <li
              key={user.userid}
              onClick={this.select.bind(this, user)}
              className={(currUser && user.userid === +currUser.id) ? styles.active : ''}
            >
              <span title={user.username}>{user.username}</span>
              <span title={user.deptname}>{user.deptname}</span>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }
}

export default DeptSelectModal;
