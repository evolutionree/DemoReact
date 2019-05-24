import React, { PropTypes } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { is } from 'immutable';
import { Icon, Select } from 'antd';
import UserSelectModal from './UserSelectModal';
import { queryUsers } from '../../../services/structure';
import ImgCardList from '../../ImgCardList';
import connectBasicData from '../../../models/connectBasicData';
import styles from './SelectUser.less';

const Option = Select.Option;

class UserSelect extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func,
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
      allUsers: this.props.allUsers,
      options: [],
      searchKey: ''
    };
  }

  componentDidMount() {
    this.setUserNameMap(this.props);

    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
  }

  componentWillReceiveProps(nextProps) {
    if (!Object.keys(this.state.userNameMap).length) {
      this.setUserNameMap(nextProps);
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

  setUserNameMap = (props) => {
    const allUsers = props.allUsers || [];
    const userNameMap = {};
    allUsers.forEach(u => {
      userNameMap[u.userid] = u.username;
    });
    this.setState({
      allUsers,
      userNameMap
    }, this.setDataReady);
  }

  fetchUserList = () => {
    //TODO: 改用从基础数据获取
    // const params = {
    //   userName: '',
    //   deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
    //   userPhone: '',
    //   pageSize: 9999,
    //   pageIndex: 1,
    //   recStatus: 2
    // };
    // queryUsers(params).then(result => {
    //   const allUsers = result.data.pagedata;
    //   const userNameMap = {};
    //   allUsers.forEach(u => {
    //     userNameMap[u.userid] = u.username;
    //   });
    //   this.setState({
    //     allUsers,
    //     userNameMap: {
    //       ...this.state.userNameMap,
    //       ...userNameMap
    //     }
    //   }, this.setDataReady);
    // });
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
    const newValue = valueName && valueName.split(',').map(item => {
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

  selectChange = (options, value) => {
    const selectData = options instanceof Array && options.filter(item => value && value.indexOf(item.id + '') > -1);
    const id = selectData.map(obj => obj.id).join(',');
    const name = selectData.map(obj => obj.name).join(',');
    this.props.onChange(id);
    if (this.props.onChangeWithName) {
      this.props.onChangeWithName({
        value: id,
        value_name: name
      });
    }
    this.setState({
      searchKey: ''
    });
  }

  queryOptions = (userName) => {
    const params = {
      userName: userName,
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      userPhone: '',
      pageSize: 10,
      pageIndex: 1,
      recStatus: 2
    };
    queryUsers(params).then(result => {
      let options = result.data.pagedata;
      options = options.map(item => {
        return {
          ...item,
          id: item.userid,
          name: item.username
        };
      });
      const { text, users } = this.parseValue();
      options = _.uniqBy(_.concat(users, options), 'id');
      this.setState({
        options: options.filter(opt => {
          return this.filterOption(opt);
        })
      });
    });
    this.setState({
      searchKey: userName
    });
  }

  filterOption = (option) => {
    const value = option.userid;
    const {
      designateDataSource,
      designateDataSourceByName,
      designateFilterDataSource,
      designateFilterDataSourceByName
    } = this.props;
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
    return flag;
  };

  selectFocus = () => {
    this.props.onFocus && this.props.onFocus();
  }

  render() {
    let { options, searchKey } = this.state;
    const { text, users } = this.parseValue();
    const value = users.map(item => item.id + '');
    options = _.uniqBy(_.concat(users, options), 'id');
    if (searchKey === '' && users.length) {
      options = options.filter(item => {
        return value.indexOf(item.id + '') > -1;
      });
    } else if (searchKey === '' && !users.length) {
      options = [];
    }

    if (this.props.view && this.props.multiple && this.props.isCommonForm) { //查看页
      return (
        <ImgCardList.View
          dataSouce={this.state.allUsers}
          value={this.props.value}
        />
      );
    } else if (this.props.view) {
      const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
      const _text = (this.props.value_name !== undefined && this.props.value_name !== '') ? this.props.value_name : this.props.value;
      return <div style={{ display: 'inline-block' }}>{_text ? (_text + '') : emptyText}</div>;
    }

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
          this.props.isCommonForm && this.props.multiple === 1 ?
            <ImgCardList
              dataSouce={this.state.allUsers}
              value={this.props.value}
              isReadOnly={this.props.isReadOnly === 1}
              addClick={this.showModal}
              delUser={this.handleOk}
            /> :
            <div className={styles.inputSelectWrap}>
              <Select onChange={this.selectChange.bind(this, options)}
                onSearch={this.queryOptions}
                placeholder={this.props.placeholder}
                disabled={this.props.isReadOnly === 1}
                mode={this.props.multiple === 1 ? 'multiple' : null}
                value={value}
                onFocus={this.selectFocus}
                allowClear
              >
                {options instanceof Array && options.map(item => <Option key={item.id}>{item.name}</Option>)}
              </Select>
              <div className={classnames(styles.openModal, { [styles.openModalDisabled]: this.props.isReadOnly === 1 })} onClick={this.showModal}>
                <Icon type="plus-square" />
              </div>
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

UserSelect.View = props => <UserSelect view {...props} onChange={() => { }} />;

export default connectBasicData('allUsers', UserSelect);
