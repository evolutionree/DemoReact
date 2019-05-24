import React from 'react';
import { Modal, Col, Row, Icon, message } from 'antd';
import { is } from 'immutable';
import _ from 'lodash';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import DepartmentSelect from '../../../components/DepartmentSelect';
import { queryUsers } from '../../../services/structure';
import styles from './SelectUser.less';

class UserSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedUsers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.number
    })),
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    multiple: React.PropTypes.bool,
    title: React.PropTypes.string,
    modalPending: React.PropTypes.bool,
    isRequiredSelect: React.PropTypes.bool //必须选择用户
  };
  static defaultProps = {
    visible: false,
    selectedUsers: [],
    multiple: true,
    title: '选择人员',
    modalPending: false,
    isRequiredSelect: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentSelected: props.selectedUsers,
      userList: []
    };
  }

  componentWillMount() {
    this.setState({
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentSelected: this.props.selectedUsers
    }, this.fetchUserList);
  }

  componentWillReceiveProps(nextProps) {
    const { cpusers } = nextProps;
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
        currentSelected: nextProps.selectedUsers
      }, this.fetchUserList);
    }

    if (cpusers && Array.isArray(cpusers) && cpusers.length) {
      this.setState({ userList: cpusers });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  // onChange = (ids, nodes) => {
  //   this.setState({
  //     currentSelected: nodes.map(node => ({
  //       name: node.deptname,
  //       id: node.deptid
  //     }))
  //   });
  // };

  fetchUserList = () => {
    const { cpusers } = this.props;
    if (cpusers && Array.isArray(cpusers) && cpusers.length) { // 使用抄送数据
      this.setState({
        userList: cpusers,
        currentSelected: this.props.multiple ? addDeptName(this.state.currentSelected, cpusers) : []
      });
      return;
    }

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
      // this.setState({
      //   userList,
      //   currentSelected: this.props.multiple ? addDeptName(this.state.currentSelected, userList) : []
      // });
    });
    function addDeptName(currSelected, userList) {
      return currSelected.map(item => {
        const matched = userList.filter(user => user.userid === item.id)[0];
        if (matched) return { ...item, deptname: matched.deptname };
        return item;
      });
    }
  };

  handleOk = () => {
    if (this.props.isRequiredSelect && !this.state.currentSelected.length) {
      return message.error('请选择人员');
    }
    this.props.onOk(this.state.currentSelected);
  };

  onDeptChange = (value) => {
    this.setState({ deptId: value });
  };

  onSearch = (keyword) => {
    this.setState({
      searchName: keyword
      //currentSelected: []
    }, this.fetchUserList);
  };

  selectAll = () => {
    const newSelected = this.state.userList.filter(opt => {
      return this.filterOption(opt.userid);
    }).filter(user => {
      return !this.state.currentSelected.some(item => item.id === user.userid);
    }).map(user => ({
      name: user.username,
      id: user.userid,
      deptname: user.deptname || ''
    }));
    this.setState({
      currentSelected: [
        ...this.state.currentSelected,
        ...newSelected
      ]
    });
  };

  select = user => {
    const currSelected = this.state.currentSelected;
    const hasSelected = currSelected.some(item => item.id === user.userid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [
          ...currSelected,
          {
            name: user.username,
            id: user.userid,
            deptname: user.deptname
          }
        ]
      });
    }
  };

  selectSingle = user => {
    this.setState({
      currentSelected: [{
        name: user.username,
        id: user.userid,
        deptname: user.deptname
      }]
    });
  };

  remove = user => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(item => item !== user)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  filterOption = value => {
    const option = _.find(this.state.userList, ['userid', value]);
    const {
      designateDataSource,
      designateDataSourceByName,
      designateFilterDataSource,
      designateFilterDataSourceByName,
      multiple
    } = this.props;
    const { currentSelected } = this.state;
    let flag = true;
    let tempArray = [];
    if (designateDataSource) {
      tempArray = designateDataSource.split(',');
      flag = _.includes(tempArray, value + '');
    } else if (designateDataSourceByName) {
      tempArray = designateDataSourceByName.split(',');
      flag = _.includes(tempArray, option.accountname);
    }
    if (designateFilterDataSource) {
      tempArray = designateFilterDataSource.split(',');
      flag = flag && !_.includes(tempArray, value + '');
    }
    if (designateFilterDataSourceByName) {
      tempArray = designateFilterDataSourceByName.split(',');
      flag = flag && !_.includes(tempArray, option.accountname);
    }
    if (multiple && currentSelected.some(item => item.id === value)) flag = false;
    return flag;
  };

  render() {
    const { visible, onCancel, multiple, title, modalPending } = this.props;
    let { currentSelected, deptId, searchName, userList } = this.state;
    userList = userList.filter(opt => {
      return this.filterOption(opt.userid);
    });
    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
        confirmLoading={modalPending}
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
        {multiple ? (
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
                {currentSelected.map(item => (
                  <li key={item.id}>
                    <span title={item.name}>{item.name}</span>
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
              const cls = (currentSelected[0] && (currentSelected[0].id === user.userid)) ? styles.highlight : '';
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
