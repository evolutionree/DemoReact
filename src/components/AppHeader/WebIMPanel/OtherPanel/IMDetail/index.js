/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Input, Icon, message } from 'antd';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import MemberList from '../IMPanel/MemberList';
import { flagContact, getuserinfo } from '../../../../../services/structure';
import styles from './index.less';

const MetaValue = ({ children }) => {
  if (!children) {
    return <span style={{ color: '#333' }}>未填写</span>;
  }
  return <span style={{ color: '#333' }}>{children}</span>;
};

class IMDetail extends Component {
  static propTypes = {
    panelInfo: PropTypes.object.isRequired,
    showGoBack: PropTypes.bool
  };
  static defaultProps = {
    showGoBack: false
  };

  constructor(props) {
    super(props);
    this.state = {
      userStar: false,
      userInfo: {},
      edit: false,
      groupName: props.panelInfo.chatname
    };
  }

  componentWillMount() {
    if (this.props.panelInfo.chattype === 0) { //查看个人资料
      this.getUserInfo();
    }
  }

  getUserInfo = () => {
    getuserinfo(this.props.panelInfo.chatid).then(result => {
      const { user } = result.data;
      this.setState({
        userInfo: user[0],
        userStar: user[0].flag
      });
    }).catch(e => {
      message.error(e.message || '获取用户个人信息失败');
    });
  }

  componentWillReceiveProps(nextProps) {

  }

  backHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: {
      showChildrenPanel: '',
      childrenPanelInfo: ''
    } });
  }

  onStarChange = () => {
    const { panelInfo } = this.props;
    const params = {
      userid: panelInfo.chatid,
      flag: !this.state.userStar
    };
    flagContact(params).then(result => {
      this.setState({
        userStar: !this.state.userStar
      });
    }, err => {
      message.error(err.message || '操作失败');
    });
  };

  closePanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel' });
  }

  addMembers = () => {
    const { dispatch, panelInfo } = this.props;
    dispatch({
      type: 'webIM/putState',
      payload: {
        showGrandsonPanel: 'OriginGroup',
        grandsonPanelInfo: {
          type: 'edit',
          groupid: panelInfo.chatid,
          chatname: panelInfo.chatname
        }
      }
    });
  }

  edit = () => {
    this.setState({
      edit: true
    });
  }

  groupNameChange = (e) => {
    this.setState({
      groupName: e.target.value
    });
  }

  updateGroupName = () => {
    this.props.dispatch({ type: 'webIM/updateGroupInfo', payload: this.state.groupName });
    this.setState({
      edit: false
    });
  }

  render() {
    const { userInfo } = this.state;
    const { panelInfo } = this.props;
    return (
      <div className={styles.IMDetailWrap}>
        <div className={styles.header}>
          {
            this.props.showGoBack ? <Icon type="left" onClick={this.backHandler} /> : null
          }
          <h3>查看资料</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          {
            panelInfo.chattype === 0 ?
              <div>
                <div className={styles.fl}>
                  <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={100} />
                  <div className={styles.usernameWrap}>
                    <MetaValue>{userInfo.username}</MetaValue>
                    <Icon type="star" style={{ color: this.state.userStar ? '#E79C20' : '#999' }} onClick={this.onStarChange} />
                  </div>
                  <div className={styles.mobileWrap}>
                    <Icon type="mobile" />
                    <MetaValue>{userInfo.userphone}</MetaValue>
                  </div>
                </div>
                <div className={styles.separateLine}></div>
                <div className={styles.fr}>
                  <ul>
                    <li>部门：<MetaValue>{userInfo.deptname}</MetaValue></li>
                    <li>性别：<MetaValue>{['男', '女'][userInfo.usersex]}</MetaValue></li>
                    <li>职务：<MetaValue>{userInfo.userjob}</MetaValue></li>
                  </ul>
                  <ul>
                    <li>电话：<MetaValue>{userInfo.usertel}</MetaValue></li>
                    <li>邮箱：<MetaValue>{userInfo.useremail}</MetaValue></li>
                  </ul>
                </div>
              </div> :
              <div>
                <div className={styles.groupDetailfl}>
                  <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={100} />
                  {
                    this.state.edit ? <div className={styles.titleWrap}>
                      <Input value={this.state.groupName} onChange={this.groupNameChange} />
                      <Icon type="save" onClick={this.updateGroupName} />
                    </div> : <div className={styles.titleWrap}>
                      <span>{panelInfo.chatname}</span>
                      <Icon type="edit" onClick={this.edit} />
                    </div>
                  }
                  <div className={styles.addMember}>
                    <a onClick={this.addMembers}>添加成员</a>
                  </div>
                </div>
                <div className={styles.separateLine}></div>
                <div className={styles.groupDetailfr}>
                  <MemberList groupId={panelInfo.chatid} />
                </div>
              </div>
          }
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
  })(IMDetail);
