import React, { PropTypes } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import UserSelectModal from './UserSelectModal';
import styles from './SelectUser.less';
import { queryUsers } from '../../../services/structure';
import {Icon} from "antd";
import ImgCardList from '../../ImgCardList';

class UserSelect extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onChangeWithName: PropTypes.func,
    dataRange: PropTypes.oneOf([0, 1, 2]),
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string,
    isCommonForm: PropTypes.bool
  };
  static defaultProps = {
    dataRange: 0,
    value_name: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      userNameMap: {},
      allUsers: []
    };
    if (props.value) {
      const users = this.toUserArray(props.value, props.value_name);
      this.state.userNameMap = {
        ...this.toUserMap(users)
      };
    }

    if (this.props.view && this.props.multiple && this.props.isCommonForm) { //查看页（显示头像）
      this.fetchUserList();
    } else if(this.props.view) { //只查看文字

    } else {
      this.fetchUserList();
    }

    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value_name && nextProps.value_name !== this.props.value_name) {
      const users = this.toUserArray(nextProps.value, nextProps.value_name);
      this.setState({
        userNameMap: {
          ...this.state.userNameMap,
          ...this.toUserMap(users)
        }
      });
    }
  }

  fetchUserList = () => {
    const params = {
      userName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      userPhone: '',
      pageSize: 9999,
      pageIndex: 1,
      recStatus: 2
    };
    queryUsers(params).then(result => {
      const allUsers = result.data.pagedata;
      const userNameMap = {};
      allUsers.forEach(u => {
        userNameMap[u.userid] = u.username;
      });
      this.setState({
        allUsers,
        userNameMap: {
          ...this.state.userNameMap,
          ...userNameMap
        }
      }, this.setDataReady);
    });
  };

  setDataReady = () => {
    this._dataReady = true;
    if (this._onDataReady) {
      this._onDataReady.forEach(fn => fn());
      this._onDataReady = [];
    }
  };
  ensureDataReady = callback => {
    return (...args) => {
      if (this._dataReady) return callback(...args);
      if (!this._onDataReady) this._onDataReady = [];
      this._onDataReady.push(callback.bind(this, ...args));
    };
  };

  setValue = val => {
    if (!val && val !== 0) {
      this.props.onChange('', true);
      return;
    }

    const arrVal = (val + '').split(',');
    const matchIds = arrVal.filter(id => {
      return this.state.allUsers.some(user => user.userid + '' === id);
    });
    if (matchIds.length) {
      this.props.onChange(this.props.multiple ? matchIds.join(',') : matchIds[0], true);
    }
  };

  setValueByName = (valueName) => {
    // if (!valueName) return;
    // const user = _.find(this.state.allUsers, ['username', valueName]);
    // if (user) {
    //   this.props.onChange(user.userid);
    // }

    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    const newValue = valueName.split(',').map(item => {
      const user = _.find(this.state.allUsers, ['accountname', item]);
      return user && user.userid;
    }).filter(item => !!item).join(',');
    this.props.onChange(newValue, true);
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  handleOk = (users) => {
    this.hideModal();
    this.setState({
      userNameMap: {
        ...this.state.userNameMap,
        ...this.toUserMap(users)
      }
    });
    const userIds = users.map(u => u.id).join(',');
    this.props.onChange(userIds);
    if (this.props.onChangeWithName) {
      this.props.onChangeWithName({
        value: userIds,
        value_name: users.map(u => u.name).join(',')
      });
    }
  };

  showModal = () => {
    this.props.onFocus && this.props.onFocus();
    if (this.props.isReadOnly === 1) return;
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleRemove = (item) => {
    this.props.onChange(this.props.value.filter(i => i !== item));
  };

  toUserArray = (value, value_name) => {
    if (typeof value === 'number') value += '';
    if (!value) return [];
    const users = [];
    const arrUserId = value.split(',');
    const arrUserName = value_name.split(',');
    arrUserId.forEach((userId, index) => {
      users.push({
        id: +userId,
        name: arrUserName[index]
      });
    });
    return users;
  };

  toUserMap = userArray => {
    const userNameMap = {};
    userArray.forEach(({ id, name }) => {
      userNameMap[id] = name;
    });
    return userNameMap;
  };

  parseValue = () => {
    const users = [];
    const { userNameMap } = this.state;
    let { value } = this.props;
    if (typeof value === 'number') value += '';
    if (value) {
      value.split(',').forEach(userId => {
        users.push({
          id: +userId,
          name: userNameMap[userId] || ''
        });
      });
    }
    return {
      users,
      text: users.map(u => u.name).join(',')
    };
  };

  render() {
    if (this.props.view && this.props.multiple && this.props.isCommonForm) { //查看页
      return <ImgCardList.View
                  dataSouce={this.state.allUsers}
                  value={this.props.value} />;
    } else if (this.props.view) {
      const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
      const text = (this.props.value_name !== undefined && this.props.value_name !== '') ? this.props.value_name : this.props.value;
      return <div style={{ display: 'inline-block' }}>{text ? (text + '') : emptyText}</div>;
    }

    const { text, users } = this.parseValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);
    return (
      <div className={cls} style={{ ...this.props.style }}>
        {
          this.props.isCommonForm && this.props.multiple === 1 ? <ImgCardList
                                                                          dataSouce={this.state.allUsers}
                                                                          value={this.props.value}
                                                                          isReadOnly={this.props.isReadOnly === 1}
                                                                          addClick={this.showModal}
                                                                          delUser={this.handleOk} /> :
            <div className="ant-input" onClick={this.showModal} title={text}>
              {
                text || this.props.placeholder
              }
              <Icon type="close-circle" className={iconCls} onClick={this.iconClearHandler} />
            </div>
        }
        <UserSelectModal
          {...this.props}
          visible={this.state.modalVisible}
          selectedUsers={users}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
        />
      </div>
    );
  }
}

UserSelect.View = (props) => {
  return (
    <UserSelect view={true} {...props} onChange={()=>{}} />
  );
};

export default UserSelect;
