import React from 'react';
import { Modal, Col, Row, Icon, message } from 'antd';
import Search from '../Search';
import Toolbar from '../Toolbar';
import DepartmentSelect from '../DepartmentSelect';
import { queryUsers } from '../../services/structure';
import styles from './styles.less';

class UserSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedUsers: React.PropTypes.arrayOf(React.PropTypes.number),
    allUsers: React.PropTypes.array,
    limit: React.PropTypes.number,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    filterUsers: React.PropTypes.array,
    isSearchLocal: React.PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selectedUsers: [],
    allUsers: [],
    limit: 1,
    filterUsers: [],
    isSearchLocal: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentSelected: props.selectedUsers,
      userList: props.allUsers
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
        currentSelected: nextProps.selectedUsers,
        userList: nextProps.allUsers
      });
    }
  }

  fetchUserList = () => {
    const params = {
      userName: this.state.searchName,
      deptId: this.state.deptId,
      userPhone: '',
      pageSize: 9999,
      pageIndex: 1,
      recStatus: 1
    };
    queryUsers(params).then(result => {
      const userList = result.data.pagedata;
      this.setState({
        userList
      });
    });
  };

  handleOk = () => {
    // if (!this.state.currentSelected.length) {
    //   return message.error('请选择人员');
    // }
    this.props.onOk(this.state.currentSelected);
  };

  onDeptChange = (value) => {
    this.setState({ deptId: value });
  };

  onSearch = (keyword) => {
    console.log(this.props.allUsers);
    if (this.props.isSearchLocal) {
      // 这里执行本地搜索
      const retList = this.props.allUsers.filter(item => item.username.indexOf(keyword) >= 0);
      this.setState({ searchName: keyword, userList: retList });
    } else {
      this.setState({
        searchName: keyword,
        currentSelected: []
      }, this.fetchUserList);
    }

  };

  selectAll = () => {
    this.setState({
      currentSelected: mergeIds(this.state.currentSelected, this.state.userList.map(u => u.userid))
    });
    function mergeIds(targetIds, sourceIds) {
      const newIds = sourceIds.filter(id => targetIds.every(tid => tid !== id));
      return [...targetIds, ...newIds];
    }
  };

  select = user => {
    const currSelected = this.state.currentSelected;
    const hasSelected = currSelected.some(id => id === user.userid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [
          ...currSelected,
          user.userid
        ]
      });
    }
  };

  selectSingle = user => {
    this.setState({
      currentSelected: [user.userid]
    });
  };

  remove = user => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(id => id !== user.userid)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  render() {
    const { visible, onCancel, limit, allUsers, filterUsers, isSearchLocal } = this.props;
    let { currentSelected, userList } = this.state;
    userList = userList.filter(u => {
      return filterUsers.indexOf(u.userid) === -1;
    });
    const currentSelectedUsers = currentSelected.map(id => _.find(allUsers, ['userid', id]));
    return (
      <Modal
        title="选择人员"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={limit !== 1 ? 'ant-modal-custom-large' : ''}
      >
        <Toolbar>
          {!isSearchLocal && <DepartmentSelect value={this.state.deptId} onChange={this.onDeptChange} width="200px" />}
          <Search
            width="200px"
            value={this.state.searchName}
            onSearch={this.onSearch}
            placeholder="请输入人员姓名"
          >
            搜索
          </Search>
        </Toolbar>
        {limit !== 1 ? (
          <Row gutter={20}>
            <Col span={11}>
              <ul className={styles.userlist}>
                {userList.map(user => (
                  <li key={user.userid} onClick={this.select.bind(this, user)}>
                    <span title={user.username}>{user.username}</span>
                    <span title={user.deptname}>{user.deptname}</span>
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={2}>
              <div style={{ height: '400px' }} className={styles.midcontrol}>
                <Icon type="right" onClick={this.selectAll} />
                <Icon type="left" onClick={this.removeAll} />
              </div>
            </Col>
            <Col span={11}>
              <ul className={styles.userlist}>
                {currentSelectedUsers.map(item => (
                  <li key={item.userid}>
                    <span title={item.username}>{item.username}</span>
                    <span title={item.deptname}>{item.deptname || ''}</span>
                    <Icon type="close" onClick={this.remove.bind(this, item)} />
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        ) : (
          <ul className={styles.userlist}>
            {userList.map(user => {
              const cls = (currentSelected[0] === user.userid) ? styles.highlight : '';
              return (
                <li key={user.userid} onClick={this.selectSingle.bind(this, user)} className={cls}>
                  <span title={user.username}>{user.username}</span>
                  <span title={user.deptname}>{user.deptname}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    );
  }
}

export default UserSelectModal;
