/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Input, Icon } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import _ from 'lodash';
import styles from './index.less';

class IMPanel extends Component {
  static propTypes = {
    panelInfo: PropTypes.object
  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {
      sendMessage: ''
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  closePanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel', payload: '' });
  }

  usernameClickHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: { showChildrenPanel: 'PersonalDetail', childrenPanelInfo: this.props.panelInfo } });
  }

  sendMessageChangeHandler = (e) => {
    this.setState({
      sendMessage: e.target.value
    });
  }

  sendMessage = () => {
    const { webIMSocket } = this.props;
    const sendData = {
      Cmd: 3,
      data: {
        ctype: 0,
        gid: '00000000-0000-0000-0000-000000000000',
        ct: 1,
        cont: this.state.sendMessage,
        rec: this.props.panelInfo.userid
      }
    };
    webIMSocket.send(JSON.stringify(sendData));
    const nowTime = new Date().getTime();
    this.props.dispatch({
      type: 'webIM/receivemessage',
      payload: {
        ...sendData,
        time: nowTime,
        type: 'sendMessage'
      }
    });
    this.setState({
      sendMessage: ''
    });
  }

  render() {
    const { panelInfo, messagelist, userInfo } = this.props;
    const currentUserIMData = messagelist instanceof Array && messagelist.filter(item => {
      if (item.type === 'sendMessage') {
        return item.data.rec === panelInfo.userid;
      } else if (item.type === 'receiveMessage') {
        return item.CustomContent.s = panelInfo.userid;
      }
    });

    const currentUserIMData_sortBy = _.sortBy(currentUserIMData, item => item.time);

    return (
      <div className={styles.IMPanelWrap}>
        <div className={styles.header}>
          <h3 onClick={this.usernameClickHandler}>{panelInfo.username}</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          {
            currentUserIMData_sortBy && currentUserIMData_sortBy instanceof Array && currentUserIMData_sortBy.map(item => {
              console.log(item);
              console.log(item.ud)
              return (
                item.type === 'sendMessage' ?
                  <div className={classnames(styles.chatItem, styles.itemRight)} key={item.time}>
                    <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
                    <div className={styles.message}>{item.data.cont}</div>
                  </div> :
                  <div className={classnames(styles.chatItem, styles.itemLeft)} key={item.time}>
                    <Avatar image={`/api/fileservice/read?fileid=${item.CustomContent.ud.UserIcon}`} width={30} />
                    <div className={styles.message}>{item.Message}</div>
                  </div>
              );
            })
          }
        </div>
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            <Icon type="picture" />
            <Icon type="folder-open" />
            <Icon type="smile-o" />
          </div>
          <div className={styles.inputWrap}>
            <textarea onChange={this.sendMessageChangeHandler} value={this.state.sendMessage} />
          </div>
          <div className={styles.submitWrap}>
            <div className={styles.buttonWrap}>
              <div onClick={this.sendMessage}>发送</div>
              <div>
                <i></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      userInfo: state.app.user,
      ...state.webIM
    };
  },
  dispatch => {
    return {
      dispatch
    };
  }
)(IMPanel);
