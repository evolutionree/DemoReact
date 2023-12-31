import React from 'react';
import { Modal, Col, Row, Icon, message, Spin } from 'antd';
import { FixedSizeList as List } from 'react-window';
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
      userList: [],
      userIdObj: {}
    };
  }

  componentWillMount() {
    this.setState({
      loading: true,
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentSelected: this.props.selectedUsers
    }, this.fetchUserList);
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
      const list = result.data.pagedata || [];
      // 遍历去重合并部门名称处理
      const userList = [];
      const userIdObj = Object.create(null);
      list.forEach(u => {
        if (!userIdObj[u.userid]) {
          userList.push(u);
          userIdObj[u.userid] = u.deptname;
        } else {
          const pre = userIdObj[u.userid];
          userIdObj[u.userid] = `${pre}/${u.deptname || '未知部门'}`;
        }
      }); 
      let currentSelected = this.state.currentSelected;
      if (this.props.multiple) {
        currentSelected = currentSelected.concat().map(c => {
          if (userIdObj[c.id]) return { ...c, deptname: userIdObj[c.id] };
          else return c;
        });
      }
      this.setState({
        loading: false,
        userList,
        userIdObj,
        currentSelected
      });
    });
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
    const { currentSelected, deptId, searchName, loading, userIdObj } = this.state;
    let userList = this.state.userList;
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
          <Spin spinning={loading}>
            <List
              height={400}
              width={500}
              itemSize={40}
              itemCount={userList.length}
              className={styles.wrapList}
            >
              {
                ({ index, style }) => {
                  const user = userList[index];
                  const cls = (currentSelected[0] && (currentSelected[0].id === user.userid)) ? styles.highlight : '';
                  return (
                    <div 
                      style={style} 
                      key={user.userid} 
                      onClick={this.selectSingle.bind(this, user)} 
                      className={`${styles.uItem} ${cls}`}
                    >
                      <span title={user.username}>{user.username}</span>
                      <span title={userIdObj[user.userid]}>{userIdObj[user.userid]}</span>
                    </div>
                  );
                }
              }
            </List>
          </Spin>
        )}
      </Modal>
    );
  }
}

export default UserSelectModal;
