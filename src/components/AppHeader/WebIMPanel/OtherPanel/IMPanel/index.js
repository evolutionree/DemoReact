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
import { uuid } from '../../../../../utils/index';
import { getchatlist } from '../../../../../services/structure';
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
      sendMessage: '',
      chatList: []
    };
  }

  componentDidMount() {
    this.getChatList(this.props.panelInfo.userid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.panelInfo.userid !== this.props.panelInfo.userid) {
      this.getChatList(nextProps.panelInfo.userid);
    }
  }

  getChatList = (userid) => {
    const params = {
      groupid: '00000000-0000-0000-0000-000000000000',
      friendid: userid,
      ishistory: 0,
      recversion: 0
    };

    getchatlist(params).then(result => {
      this.setState({
        chatList: result.data instanceof Array && result.data.map(item => {
          return {
            data: {
              mid: item.chatmsgid,
              ctype: item.msgtype, // chattype      0为私聊，1为群聊
              gid: item.groupid, //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
              ct: item.contype, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
              fid: item.chatcon, //发送的文件fileid
              cont: item.chatcon //发送的文本内容
            },
            ud: {
              userid: item.ud.userid,
              username: item.ud.username,
              usericon: item.ud.usericon
            },
            time: new Date(item.reccreated).getTime(),
            type: item.receivers === this.props.userInfo.userid ? 'receiveMessage' : 'sendMessage'
          };
        })
      });
    }, err => {

    });
  }

  closePanel = () => {
    this.props.close && this.props.close();
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
        mid: uuid(),
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
        mid: uuid(),
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
        mid: uuid(),
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
    const { webIMSocket, userInfo } = this.props;
    webIMSocket.send(JSON.stringify(sendData));
    const nowTime = new Date().getTime();
    this.props.dispatch({
      type: 'webIM/receivemessage',
      payload: {
        ...sendData,
        ud: {
          userid: userInfo.userid,
          username: userInfo.username,
          usericon: userInfo.usericon
        },
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

    let itemLayout = 'itemLeft';
    if (data.type === 'sendMessage') {
      itemLayout = 'itemRight';
    }

    if (data.data.ct === 1) { //文字
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.time}>
          <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
          <div className={styles.message}>{data.data.cont}</div>
        </div>
      );
    } else if (data.data.ct === 2) { //图片
      const imgSrc = data.data.loading ? data.data.fid : `/api/fileservice/read?fileid=${data.data.fid}`;
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.time}>
          <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
          <div className={classnames(styles.message, styles.pictureMessage)}><img src={imgSrc} key={data.time} /></div>
        </div>
      );
    } else if (data.data.ct === 5) { //文件
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.time}>
          <Avatar image={`/api/fileservice/read?fileid=${userInfo.usericon}`} width={30} />
          <div className={classnames(styles.message, styles.fileMessage)}>
            <div className={classnames(styles.file)}></div>
            <div className={styles.fileInfo}>
              <div>文件名</div>
              <div>126.7kb</div>
            </div>
            <div className={styles.download}>
              <Icon type="arrow-down" />
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    const { panelInfo, messagelist, userInfo } = this.props;
    let allChatList = [];
    if (messagelist instanceof Array) {
      allChatList = [...messagelist, ...this.state.chatList];
    }
    const currentUserIMData = allChatList.filter(item => { //当前聊天窗口的 所有消息
      if (item.type === 'sendMessage') {
        return item.ud.userid === panelInfo.userid;
      } else if (item.type === 'receiveMessage') {
        return item.ud.userid = panelInfo.userid;
      }
    });
    const currentUserIMData_sortBy = _.sortBy(currentUserIMData, item => item.time);
    const chartData = _.uniqBy(currentUserIMData_sortBy, 'data.mid'); //去重
    return (
      <div className={classnames(styles.IMPanelContent, { [styles.GroupIMPanel]: panelInfo.chattype === 1 })}>
        <div className={styles.header}>
          <h3 onClick={this.usernameClickHandler}>{panelInfo.username}</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.IMBody}>
          <div className={styles.IMPanelWrap}>
            <div className={styles.messageList}>
              {
                chartData && chartData instanceof Array && chartData.map(item => {
                  return this.renderMessage(item);
                })
              }
            </div>
            <div className={styles.IMInputWrap}>
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

          <div className={styles.contactList}>
            <h3>
              群聊成员(10/10)
            </h3>
            <ul>
              <li>
                <img src="./img_demo_avatar.png" />
                <span>余萍</span>
              </li>
              <li>
                <img src="./img_demo_avatar.png" />
                <span>余萍</span>
              </li>
              <li>
                <img src="./img_demo_avatar.png" />
                <span>余萍</span>
              </li>
            </ul>
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
