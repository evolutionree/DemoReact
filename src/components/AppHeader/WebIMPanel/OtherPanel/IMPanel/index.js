/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Input, Icon } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import FileUpload from '../../Component/FileUpload';
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
    const sendData = {
      Cmd: 3,
      data: {
        ctype: 0, // chattype      0为私聊，1为群聊
        gid: '00000000-0000-0000-0000-000000000000', //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
        ct: 1, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
        fid: '', //发送的文件fileid
        cont: this.state.sendMessage, //发送的文本内容
        rec: this.props.panelInfo.userid //收消息用户id
      }
    };
    this.sendWebSocker(sendData);
    this.setState({
      sendMessage: ''
    });
  }

  imgUpload = (fileId) => {
    const sendData = {
      Cmd: 3,
      data: {
        ctype: 0, // chattype      0为私聊，1为群聊
        gid: '00000000-0000-0000-0000-000000000000', //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
        ct: 2, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
        fid: fileId, //发送的文件fileid
        cont: '', //发送的文本内容
        rec: this.props.panelInfo.userid //收消息用户id
      }
    };
    this.sendWebSocker(sendData);
  }

  fileUpload = (fileId) => {
    const sendData = {
      Cmd: 3,
      data: {
        ctype: 0, // chattype      0为私聊，1为群聊
        gid: '00000000-0000-0000-0000-000000000000', //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
        ct: 5, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
        fid: fileId, //发送的文件fileid
        cont: '', //发送的文本内容
        rec: this.props.panelInfo.userid //收消息用户id
      }
    };
    this.sendWebSocker(sendData);
  }

  sendWebSocker = (sendData) => {
    const { webIMSocket } = this.props;
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
  }

  imgStartUpload = (file) => { //开始上传图片 就拿到文件数据 loading显示正在发送
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const imgFile = e.target.result;
      const nowTime = new Date().getTime();
      const sendData = {
        data: {
          ct: 2, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
          fid: imgFile, //发送的文件fileid
          rec: this.props.panelInfo.userid,
          loading: true
        },
        time: nowTime,
        type: 'sendMessage'
      };
    };
  }

  renderMessage = (data) => {
    const { userInfo } = this.props;
    if (data.type === 'sendMessage') {
      if (data.data.ct === 1) {
        return (
          <div className={classnames(styles.chatItem, styles.itemRight)} key={data.time}>
            <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
            <div className={styles.message}>{data.data.cont}</div>
          </div>
        );
      } else if (data.data.ct === 2) {
        const imgSrc = data.data.loading ? data.data.fid : `/api/fileservice/read?fileid=${data.data.fid}`;
        return (
          <div className={classnames(styles.chatItem, styles.itemRight)} key={data.time}>
            <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
            <div className={classnames(styles.message, styles.picture)}><img src={imgSrc} key={data.time} /></div>
          </div>
        );
      } else if (data.data.ct === 5) {
        return (
          <div className={classnames(styles.chatItem, styles.itemRight)} key={data.time}>
            <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
            <div className={classnames(styles.message, styles.picture)}>文件</div>
          </div>
        );
      }
    } else {
      return (
        <div className={classnames(styles.chatItem, styles.itemLeft)} key={data.time}>
          <Avatar image={`/api/fileservice/read?fileid=${data.CustomContent.ud.UserIcon}`} width={30} />
          <div className={styles.message}>{data.Message}</div>
        </div>
      );
    }
  }

  render() {
    const { panelInfo, messagelist, userInfo } = this.props;
    const currentUserIMData = messagelist instanceof Array && messagelist.filter(item => { //当前聊天窗口的 所有消息
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
              return this.renderMessage(item);
            })
          }
        </div>
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            <FileUpload onUpload={this.imgUpload} startUpload={this.imgStartUpload} type="img"><Icon type="picture" /></FileUpload>
            <FileUpload onUpload={this.fileUpload} startUpload={this.imgStartUpload}><Icon type="folder-open" /></FileUpload>
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
