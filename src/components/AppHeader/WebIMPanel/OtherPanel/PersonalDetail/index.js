/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon, message } from 'antd';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import { flagContact } from '../../../../../services/structure';
import styles from './index.less';

const MetaValue = ({ children }) => {
  if (!children) {
    return <span style={{ color: '#333' }}>未填写</span>;
  }
  return <span style={{ color: '#333' }}>{children}</span>;
};

class PersonalDetail extends Component {
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
      userStar: props.panelInfo && props.panelInfo.flag
    };
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
      userid: panelInfo.userid,
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

  render() {
    const { panelInfo } = this.props;
    return (
      <div className={styles.PersonalDetailWrap}>
        <div className={styles.header}>
          {
            this.props.showGoBack ? <Icon type="left" onClick={this.backHandler} /> : null
          }
          <h3>查看资料</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          <div className={styles.fl}>
            <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={100} />
            <div className={styles.usernameWrap}>
              <MetaValue>{panelInfo.username}</MetaValue>
              <Icon type="star" style={{ color: this.state.userStar ? '#E79C20' : '#999' }} onClick={this.onStarChange} />
            </div>
            <div className={styles.mobileWrap}>
              <Icon type="mobile" />
              <MetaValue>{panelInfo.userphone}</MetaValue>
            </div>
          </div>
          <div className={styles.separateLine}></div>
          <div className={styles.fr}>
            <ul>
              <li>部门：<MetaValue>{panelInfo.deptname}</MetaValue></li>
              <li>性别：<MetaValue>{['男', '女'][panelInfo.usersex]}</MetaValue></li>
              <li>职务：<MetaValue>{panelInfo.userjob}</MetaValue></li>
            </ul>
            <ul>
              <li>电话：<MetaValue>{panelInfo.usertel}</MetaValue></li>
              <li>邮箱：<MetaValue>{panelInfo.useremail}</MetaValue></li>
            </ul>
          </div>
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
  })(PersonalDetail);
