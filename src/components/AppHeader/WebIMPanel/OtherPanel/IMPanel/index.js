/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, message, Spin } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import moment from 'moment';
import Avatar from '../../../../Avatar';
import FileUpload from '../../Component/FileUpload';
import _ from 'lodash';
import { uuid } from '../../../../../utils/index';
import { getchatlist } from '../../../../../services/structure';
import MemberList from './MemberList';
import styles from './index.less';

class IMPanel extends Component {
  static propTypes = {
    /*
     {
     chattype: 0 or 1  1表示是群聊天
     chatid:
     }
     */
    panelInfo: PropTypes.object,
    showPanel: PropTypes.string
  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {
      sendMessage: '',
      chatList: [],
      chatListLoading: false,
      recVersion: 0,
      isPessionLoadMore: false, //是否加载更多

      IMPanelAutoScroll: true,
      IMPanelScrollHeight: 0
    };
  }

  componentDidMount() {
    const { panelInfo } = this.props;
    this.getChatList(panelInfo.chattype, panelInfo.chatid);
  }

  componentWillReceiveProps(nextProps) {
    const { panelInfo } = nextProps;
    if (panelInfo.chatid !== this.props.panelInfo.chatid) {
      this.getChatList(panelInfo.chattype, panelInfo.chatid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagelistRef && this.state.IMPanelAutoScroll) { //让聊天窗口滚动条滚动到底部
      this.messagelistRef.scrollTop = this.messagelistRef.scrollHeight - this.state.IMPanelScrollHeight;
    }
  }

  getChatList = (chattype, chatid, recversion = 0) => {
    if (!chatid && chatid !== 0) {
      return;
    }
    let params = {
      ishistory: recversion === 0 ? 0 : 1,
      recversion: recversion  //通过 recversion进行分页查询
    };

    if (chattype === 1) { //群聊
      params.groupid = chatid;
    } else {
      params.friendid = chatid;
      params.groupid = '00000000-0000-0000-0000-000000000000';
    }

    this.setState({
      chatListLoading: true
    });

    getchatlist(params).then(result => {
      const data = result.data;
      const transformData = data instanceof Array && data.map(item => {
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
          IMPanelCtype: parseInt(chattype),
          IMPanelKey: chatid,
          time: item.reccreated,
          type: item.ud.userid === this.props.userInfo.userid ? 'sendMessage' : 'receiveMessage'
        };
      });

      this.setState({
        chatList: this.state.chatList.length === 0 ? transformData : [...this.state.chatList, ...transformData],
        recVersion: data.length > 0 && data[0].recversion, //第一条数据的version作为下一次请求的version
        isPessionLoadMore: !(data.length < 50),  //每次请求最多50条数据
        chatListLoading: false,
        IMPanelAutoScroll: true
      });
    }, err => {
      console.error(err.message)
      message.error(err.message);
      this.setState({
        chatListLoading: false
      });
    });
  }

  closePanel = () => {
    this.props.close && this.props.close();
    this.props.dispatch({ type: 'webIM/closeOtherPanel', payload: '' });
  }

  chatNameClickHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: { showChildrenPanel: 'IMDetail', childrenPanelInfo: this.props.panelInfo } });
  }

  zoomIMPanel = (type) => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: type,
        panelInfo: this.props.panelInfo
      }
    });
  }

  sendMessageChangeHandler = (e) => {
    this.setState({
      sendMessage: e.target.value
    });
  }

  sendMessage = () => {
    if (this.state.sendMessage === '') {
      return;
    }

    const sendData = this.getCommonSendSockerParams();
    sendData.data.ct = 1; //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
    sendData.data.fid = ''; //发送的文件fileid
    sendData.data.cont = this.state.sendMessage; //发送的文本内容
    this.sendWebSocker(sendData);
    this.setState({
      sendMessage: ''
    });
  }

  imgUpload = (fileObj) => {
    const sendData = this.getCommonSendSockerParams();
    sendData.data.ct = 2; //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
    sendData.data.fid = fileObj.fileId; //发送的文件fileid
    sendData.data.cont = ''; //发送的文本内容
    this.sendWebSocker(sendData);
  }

  fileUpload = (fileObj) => {
    const sendData = this.getCommonSendSockerParams();
    sendData.data.ct = 5; //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
    sendData.data.fid = fileObj.fileId; //发送的文件fileid
    sendData.data.cont = ''; //发送的文本内容
    this.sendWebSocker(sendData);
  }

  getCommonSendSockerParams = () => {
    const { panelInfo } = this.props;
    const params = {
      Cmd: 3,
      data: {
        mid: uuid(),
        ctype: panelInfo.chattype, // chattype      0为私聊，1为群聊
        gid: panelInfo.chattype ? panelInfo.chatid : '00000000-0000-0000-0000-000000000000', //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
        rec: panelInfo.chattype ? 0 : panelInfo.chatid //收消息用户id
      }
    };
    return params;
  }

  sendWebSocker = (sendData) => {
    const { webIMSocket, userInfo } = this.props;
    webIMSocket.send(JSON.stringify(sendData));
    this.props.dispatch({
      type: 'webIM/putReceiveOrSendMessage',
      payload: {
        ...sendData,
        ud: {
          userid: userInfo.userid,
          username: userInfo.username,
          usericon: userInfo.usericon
        },
        IMPanelCtype: parseInt(sendData.data.ctype),
        IMPanelKey: parseInt(sendData.data.ctype) === 0 ? sendData.data.rec : sendData.data.gid,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 'sendMessage'
      }
    });
    this.props.dispatch({ type: 'webIM/queryRecentList__' });

    this.setState({
      IMPanelAutoScroll: true,
      IMPanelScrollHeight: 0
    });
  }

  imgStartUpload = (file) => { //开始上传图片 就拿到文件数据 loading显示正在发送
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const imgFile = e.target.result;
      const nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
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

  loadMore = () => {
    const { panelInfo } = this.props;
    this.getChatList(panelInfo.chattype, panelInfo.chatid, this.state.recVersion);
  }

  selectEmotionIcon = () => {
    message.info('【表情功能】攻城狮正在加速开发中,尽请期待...');
  }

  messagelistScroll = (e) => {
    this.setState({
      IMPanelScrollHeight: e.target.scrollHeight - e.target.scrollTop,
      IMPanelAutoScroll: false
    });
  }

  zoomViewImg = (data) => {
    this.props.dispatch({ type: 'webIM/putState', payload: { showPicture: true, imgInfo: { src: `/api/fileservice/read?fileid=${data.data.fid}`, title: 'test' } } });
  }

  renderMessage = (data) => {
    let itemLayout = 'itemLeft';
    if (data.type === 'sendMessage') {
      itemLayout = 'itemRight';
    }

    if (data.data.ct === 1) { //文字
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.data.mid}>
          <Avatar image={`/api/fileservice/read?fileid=${data.ud.usericon}`} name={data.ud.username} width={30} />
          <div className={styles.messageWrap}>
            <div className={styles.userName}>{data.ud.username}</div>
            <div className={styles.message}>{data.data.cont}</div>
          </div>
        </div>
      );
    } else if (data.data.ct === 2) { //图片
      const imgSrc = data.data.loading ? data.data.fid : `/api/fileservice/read?fileid=${data.data.fid}`;
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.data.mid}>
          <Avatar image={`/api/fileservice/read?fileid=${data.ud.usericon}`} name={data.ud.username} width={30} />
          <div className={styles.messageWrap}>
            <div className={styles.userName}>{data.ud.username}</div>
            <div className={classnames(styles.message, styles.pictureMessage)}><img src={imgSrc} key={data.time} onClick={this.zoomViewImg.bind(this, data)} /></div>
          </div>
        </div>
      );
    } else if (data.data.ct === 5) { //文件
      return (
        <div className={classnames(styles.chatItem, styles[itemLayout])} key={data.data.mid}>
          <Avatar image={`/api/fileservice/read?fileid=${data.ud.usericon}`} name={data.ud.username} width={30} />
          <div className={styles.messageWrap}>
            <div className={styles.userName}>{data.ud.username}</div>
            <div className={classnames(styles.message, styles.fileMessage)}>
              <div className={classnames(styles.file)}></div>
              <div className={styles.fileInfo}>
                <div>文件名</div>
                <div>126.7kb</div>
              </div>
              <div className={styles.download}>
                <Icon type="download" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  getMessageList = (chatData) => {
    let html = [];
    for (let date in chatData) {
      html.push(
        <div key={date}>
          <div className={styles.date}>{moment().format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD') ? moment(date).format('HH:mm') : date}</div>
          {
            chatData[date] && chatData[date] instanceof Array && chatData[date].map(item => {
              return this.renderMessage(item);
            })
          }
        </div>
      );
    }
    return html;
  }

  render() {
    const { panelInfo, messagelist, showPanel } = this.props;

    let allChatList = [];
    if (messagelist instanceof Array) {
      allChatList = [...messagelist, ...this.state.chatList];
    }
    const currentUserIMData = allChatList.filter(item => { //当前聊天窗口的 所有消息
      return item.IMPanelKey == panelInfo.chatid;  //不用全等！！！
    });
    const currentUserIMData_sortBy = _.sortBy(currentUserIMData, item => new Date(item.time).getTime());
    const chartData = _.uniqBy(currentUserIMData_sortBy, 'data.mid'); //去重
    const date_group_ChartData = _.groupBy(chartData, item => {
      return moment(item.time).format('YYYY-MM-DD HH:mm');
    }); //按时间分组
    return (
      <div className={classnames(styles.IMPanelContent, { [styles.GroupIMPanel]: panelInfo.chattype === 1, [styles.MiniIMPanel]: showPanel === 'miniIMPanel' })}>
        <div className={styles.header}>
          <h3 title={panelInfo.chatname}><span onClick={this.chatNameClickHandler}>{panelInfo.chatname}</span></h3>
          {
            showPanel === 'miniIMPanel' ? <Icon type="arrows-alt" onClick={this.zoomIMPanel.bind(this, 'IMPanel')} /> : <Icon type="shrink" onClick={this.zoomIMPanel.bind(this, 'miniIMPanel')} />
          }
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.IMBody}>
          <div className={styles.IMPanelWrap}>
            <Spin spinning={this.state.chatListLoading}></Spin>
            <div className={styles.messageList} ref={ref => this.messagelistRef = ref} onScroll={this.messagelistScroll}>
              {
                this.state.isPessionLoadMore ? <div className={styles.loadMoreWrap}><span onClick={this.loadMore}>查看更多消息</span></div> : null
              }
              {
                this.getMessageList(date_group_ChartData)
              }
            </div>
            <div className={styles.IMInputWrap}>
              <div className={styles.toolbar}>
                <FileUpload onUpload={this.imgUpload} startUpload={this.imgStartUpload} type="img"><Icon type="picture" /></FileUpload>
                <FileUpload onUpload={this.fileUpload} startUpload={this.imgStartUpload}><Icon type="folder-open" /></FileUpload>
                <Icon type="smile-o" onClick={this.selectEmotionIcon} />
              </div>
              <div className={styles.inputWrap}>
                <textarea onChange={this.sendMessageChangeHandler} value={this.state.sendMessage} />
              </div>
              <div className={styles.submitWrap}>
                <div className={classnames(styles.buttonWrap, { [styles.pessionSend]: this.state.sendMessage !== '' })}>
                  <div onClick={this.sendMessage}>发送</div>
                  <div>
                    <i></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.memberListWrap}>
            {
              panelInfo.chattype === 1 && showPanel === 'IMPanel' ? <MemberList groupId={panelInfo.chatid} /> : null
            }
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
