/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, Button, message, Spin } from 'antd';
import { connect } from 'dva';
import ButtonGroup from '../../Component/ButtonGroup';
import Avatar from '../../../../Avatar';
import Search from '../../Component/Search';
import DepartmentCrumb from '../../Component/DepartmentCrumb';
import { getlistsub, getuserlist, addgroup, getmembers, updategroup } from '../../../../../services/structure';
import _ from 'lodash';
import styles from './index.less';

class OriginGroup extends Component {
  static propTypes = {
    showGoBack: PropTypes.bool
  };
  static defaultProps = {
    showGoBack: false
  };
  constructor(props) {
    super(props);
    this.state = {
      buttonModel: [{
        name: 'contact',
        title: '联系人',
        active: true
      }, {
        name: 'dept',
        title: '部门',
        active: false
      }],
      searchkey: '',
      userlist: [],
      searchDept: '7f74192d-b937-403f-ac2a-8be34714278b',
      childrenDept: [],

      selectUsers: [],
      selectDepts: [],

      confirmLoading: false
    };
  }

  componentDidMount() {
    this.fetchUserList();
    this.fetchDeptList();
    if (this.props.panelInfo.groupid) {
      this.getGroupMembers(this.props.panelInfo.groupid);
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  getGroupMembers = (groupid) => {
    getmembers(groupid).then(result => {
      this.setState({
        selectUsers: result.data
      });
    }).catch(e => {
      console.error(e.message);
    });
  }

  backHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: {
      showGrandsonPanel: '',
      grandsonPanelInfo: ''
    } });
  }

  closePanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel' });
  }

  btnGroupClickHandler = (btnName) => {
    const newBtnModel = this.state.buttonModel.map(item => {
      item.active = false;
      if (item.name === btnName) {
        item.active = true;
      };
      return item;
    });
    this.setState({
      buttonModel: newBtnModel
    });
  }

  searchKeyChange = (key) => {
   this.setState({
     searchkey: key
   }, this.fetchUserList);
  }

  onDepartmentChange = (deptid) => {
    this.setState({
      searchDept: deptid
    }, this.fetchDeptList);
  }

  onSelectDept = (deptid, dept) => {
    if (_.find(this.state.selectDepts, ['deptid', deptid])) {
      message.error('已选中了该部门');
    } else {
      this.setState({
        selectDepts: [...this.state.selectDepts, dept]
      });
    }
  }

  onSelectUser = (user) => {
    if (_.find(this.state.selectUsers, ['userid', user.userid])) {
      message.error('已选中了该用户');
    } else {
      this.setState({
        selectUsers: [...this.state.selectUsers, user]
      });
    }
  }

  delUser = (user) => {
    const newSelectUser = this.state.selectUsers.filter(item => item.userid !== user.userid);
    this.setState({
      selectUsers: newSelectUser
    });
  }

  delDept = (dept) => {
    const newSelectDepts = this.state.selectDepts.filter(item => item.deptid !== dept.deptid);
    this.setState({
      selectDepts: newSelectDepts
    });
  }

  clearAllSelect = () => {
    this.setState({
      selectUsers: [],
      selectDepts: []
    });
  }

  fetchUserList = () => {
    this.setState({ loading: true });
    getuserlist(this.state.searchkey).then(result => {
      this.setState({ userlist: result.data, loading: false });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取用户列表失败');
    });
  }

  fetchDeptList = () => {
    this.setState({ loading: true });
    getlistsub(this.state.searchDept).then(result => {
      this.setState({ childrenDept: result.data.subdepts, loading: false });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取通讯录列表失败');
    });
  }

  nextStep = () => {
    if (this.state.selectUsers.length === 0 && this.state.selectDepts.length === 0) {
      message.error('请选择成员后再添加群聊！');
      return;
    }

    const { panelInfo } = this.props;

    const groupName = this.state.selectUsers.length > 0 ? this.state.selectUsers.slice(0, 5).map(item => item.username).join(',') : this.state.selectDepts.slice(0, 5).map(item => item.deptname).join(',');
    const groupMemberIds = this.state.selectUsers.map(item => item.userid);
    const groupDeptIds = this.state.selectDepts.map(item => item.deptid);

    if (panelInfo.groupid) { //更新群聊成员
      const params = {
        GroupId: panelInfo.groupid,
        MemberIds: groupMemberIds,
        DeptIds: groupDeptIds
      };
      updategroup(params).then(result => {
        this.props.dispatch({
          type: 'webIM/showPanel',
          payload: {
            showPanel: 'IMPanel',
            panelInfo: {
              chatid: panelInfo.groupid,
              chatname: panelInfo.chatname,
              chattype: 1
            }
          }
        });
        this.props.dispatch({ type: 'webIM/queryGroupList__' })
        this.setState({
          confirmLoading: false
        });
      }).catch(e => {
        console.error(e.message);
        this.setState({
          confirmLoading: false
        });
      });
    } else { //创建群聊
      const params = {
        GroupName: groupName,
        GroupType: 1,
        MemberIds: groupMemberIds,
        DeptIds: groupDeptIds
      };
      this.setState({
        confirmLoading: true
      });
      addgroup(params).then(result => {
        this.props.dispatch({
          type: 'webIM/showPanel',
          payload: {
            showPanel: 'IMPanel',
            panelInfo: {
              chatid: result.data.split('|')[0],
              chatname: params.GroupName,
              chattype: 1
            }
          }
        });
        this.props.dispatch({ type: 'webIM/queryGroupList__' })
        this.setState({
          confirmLoading: false
        });
      }).catch(e => {
        console.error(e.message);
        this.setState({
          confirmLoading: false
        });
      });
    }
  }

  getUserList = () => {
    let { userlist } = this.state;

    let newUserList = {};
    for (let key in userlist) {
      if (key !== '#') {
        newUserList[key] = userlist[key];
      }
    }
    if (userlist['#']) {
      newUserList['#'] = userlist['#'];
    }

    let html = [];
    for (let key in newUserList) {
      html.push(
        <div key={key}>
          <h3>{key.toUpperCase()}</h3>
          <ul>
            {
              newUserList[key] instanceof Array && newUserList[key].map(item => {
                return (
                  <li key={item.userid} onClick={this.onSelectUser.bind(this, item)}>
                    <Avatar image={`/api/fileservice/read?fileid=${item.usericon}`} name={item.username} width={30} />
                    <span>{item.username}</span>
                  </li>
                );
              })
            }
          </ul>
        </div>
      );
    }
    return html;
  }

  render() {
    const { panelInfo } = this.props;
    console.log(panelInfo)
    const textAlignStyle = { position: 'relative', left: '50%', transform: 'translateX(-50%)' };
    const activeBtnObj = _.find(this.state.buttonModel, item => item.active);
    return (
      <div className={styles.OriginGroupWrap}>
        <div className={styles.header}>
          {
            this.props.showGoBack ? <Icon type="left" onClick={this.backHandler} /> : null
          }
          <h3>{panelInfo.groupid ? '修改群聊' : '发起群聊'}</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          <div className={styles.fl}>
            <div className={styles.btnGroupWrap}>
              <ButtonGroup model={this.state.buttonModel} onClick={this.btnGroupClickHandler} />
            </div>

            <div style={{ display: activeBtnObj.name === 'contact' ? 'block' : 'none' }}>
              <Search style={{ ...textAlignStyle }} onChange={this.searchKeyChange} />
              <Spin spinning={this.state.loading}>
                <div className={styles.contactlistWrap}>
                  {
                    this.getUserList()
                  }
                </div>
              </Spin>
            </div>

            <div style={{ display: activeBtnObj.name === 'dept' ? 'block' : 'none', maxHeight: '650px', overflow: 'auto' }}>
              <DepartmentCrumb childrenDept={this.state.childrenDept} onSelect={this.onSelectDept} onChange={this.onDepartmentChange} deepDrillType="onDoubleClick" showRoot={true} />
            </div>
          </div>
          <div className={styles.fr}>
            <div className={styles.frHeader}>
              <h2>已选择</h2>
              {
                (this.state.selectUsers.length + this.state.selectDepts.length) > 0 ? <h3 onClick={this.clearAllSelect}>清空</h3> : null
              }
            </div>
            <div className={styles.categoryList}>
              <h4>联系人（{this.state.selectUsers.length}）</h4>
              <ul style={{ minHeight: '200px' }}>
                {
                  this.state.selectUsers.map(item => {
                    return <li key={item.userid}><span>{item.username}</span><Icon type="close-circle" onClick={this.delUser.bind(this, item)} /></li>;
                  })
                }
              </ul>
              <h4>部门（{this.state.selectDepts.length}）</h4>
              <ul>
                {
                  this.state.selectDepts.map(item => {
                    return <li key={item.deptid}><span>{item.deptname}</span><Icon type="close-circle" onClick={this.delDept.bind(this, item)} /></li>;
                  })
                }
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="default">取消</Button>
          <Button onClick={this.nextStep} loading={this.state.confirmLoading}>下一步</Button>
        </div>
      </div>
    );
  }
}

export default connect(state => {
    return {
      ...state.webIM
    };
  },
  dispatch => {
    return {
      dispatch
    };
  })(OriginGroup);
