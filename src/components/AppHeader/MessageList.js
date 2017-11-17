/**
 * Created by 0291 on 2017/7/14.
 */
import React from 'react';
import { Layout, Dropdown, Menu, Icon, Badge, Spin, Modal, message, Button } from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import styles from './MessageList.less';
import request from '../../utils/request';
import { disableReminder } from '../../services/reminder';
import { checkHasPermission } from '../../services/entcomm';
import classnames from 'classnames';

const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
// const menuData=[{key:-1, text:'全部'}, {key:0, text:'系统通知'} ,{key:1, text:'实体操作消息'},
//   {key:2, text:'实体动态消息'},{key:3, text:'实体动态带点赞'},{key:4, text:'提醒'},{key:5, text:'审批'},
//   {key:6, text:'工作报告'},{key:7, text:'公告通知'},{key:99, text:'导入结果提醒'}];

const MSG_GROUP_ID = 1004;
const msgTypes = {
  IMPORT_RESULT: 99,
  TASK: 4
};
const menuData = [{ key: msgTypes.IMPORT_RESULT, text: '导入结果提醒' }, { key: msgTypes.TASK, text: '智能提醒' }];

class MessageList extends React.Component {
  static propTypes = {};
  static defaultProps = {
    url: '/api/notify/vertionmsglist'
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [],
      isPessionLoad: true,
      pageIndex: 0,
      clientHeight: clientHeight,
      unReadCount: null,
      loading: false,
      msgType: msgTypes.IMPORT_RESULT,
      modalVisible: false,
      modalBtnLoading: false,
      currentItem: null
    };
  }

  componentWillMount() {
    this.fetchUnReadCount();
    this.interval = setInterval(() => this.fetchUnReadCount(), 15000);
  }

  componentDidMount() {
    document.addEventListener('click', this.hideList.bind(this), false);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
    this.setState({
      clientHeight: clientHeight
    })
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.hideList, false);
    window.removeEventListener('resize', this.onWindowResize, false);
    // 去掉定时器任务
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onWindowResize() {
    const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
    this.setState({
      clientHeight: clientHeight
    })
  }

  fetchUnReadCount() {
    request('api/notify/unreadcount', {
      method: 'post', body: JSON.stringify({ MsgGroupIds: [MSG_GROUP_ID], MsgStyleTypes: [4, 8, 99] })
    }).then((result) => {
      this.setState({
        unReadCount: result.data.reduce((total, item) => total + item.count, 0)
      });
    }).catch((e) => {
      message.error(e.message);
    });
  }

  fetchMsgList(type, RecVersion, msgType = msgTypes.IMPORT_RESULT) {
    this.setState({
      loading: true
    });
    let newData = this.state.data;
    let MsgStyleTypes;
    if (msgType === -1) {
      MsgStyleTypes = [msgTypes.IMPORT_RESULT, msgTypes.TASK, 8];
    } else if (+msgType === msgTypes.TASK) {
      MsgStyleTypes = [msgTypes.TASK, 8];
    } else {
      MsgStyleTypes = [msgTypes.IMPORT_RESULT];
    }
    const params = {
      RecVersion: RecVersion,
      Direction: RecVersion === 0 ? 0 : -1, //以版本号为基线，向前或者向后取值，-1为取小于RecVersion的数据，0为全量，1为取大于RecVersion的数据
      PageSize: 10,
      MsgGroupIds: [MSG_GROUP_ID],
      MsgStyleTypes
    };
    request(this.props.url, {
      method: 'post', body: JSON.stringify(params)
    }).then((result) => {
      if (newData.length === 0) {
        newData = result.data.datalist;
      } else if (type === 'load') { //重新开始加载
        newData = result.data.datalist;
      } else if (type === 'loadMore') { //追加更多  查询更多
        result.data.datalist.forEach((item) => {
          newData.push(item);
        });
      }

      this.setState({
        data: newData,
        RecVersion: result.data.pageminversion,
        loading: false,
        isPessionLoad: newData.length < 10 ? false : !(result.data.pagemaxversion === result.data.pageminversion) //是否所有数据查询完
      });
    }).catch((e) => {
      message.error(e.message);
      this.setState({
        loading: false
      });
    });
  }


  toggleList(e) {
    this.fetchMsgList('load', 0, this.state.msgType);
    e.nativeEvent.stopImmediatePropagation();//阻止冒泡
    this.setState({
      visible: !this.state.visible
    });
  }

  hideList(e) {
    if (this.state.modalVisible) return;
    this.setState({
      visible: false
    });
  }

  loadMore() {
    this.fetchMsgList('loadMore', this.state.RecVersion, this.state.msgType);
  }

  headerMenuHandler({ key, domEvent }) {
    domEvent.nativeEvent.stopImmediatePropagation();//阻止冒泡
    this.fetchMsgList('load', 0, key);
    this.setState({
      msgType: key
    });
  }

  listClickHandler(readStatus, msgid, index, item) {//用户点击之后 表示已读 readstatus：0：未读 1：已查 2：已读
    const { msgstyletype, msgparam } = item;
    let link = null;
    if (msgstyletype === 8 && msgparam && msgparam.entityid && msgparam.businessid) {
      if (msgparam.data.type + '' === '0') {
        link = `/entcomm/${msgparam.entityid}/${msgparam.businessid}`;
      } else if (msgparam.data.type + '' === '2') {
        link = `/entcomm-application/${msgparam.entityid}`;
      }
    }
    if (link) {
      checkHasPermission({
        entityid: msgparam.entityid,
        recid: msgparam.businessid
      }).then(result => {
        if (result.data === '0') {
          message.error('您没有权限查看该数据');
        } else if (result.data === '2') {
          message.error('该数据已删除，无法查看');
        } else {
          this.props.dispatch(routerRedux.push({
            pathname: link
          }));
        }
      }, err => {
        message.error('获取超时，请检查网络!');
      });
    }

    if (readStatus === 2) {
      return false;
    }
    request('/api/notify/writeback', {
      method: 'post', body: JSON.stringify({ MsgIds: [msgid] })
    }).then((result) => {
      // message.success('标记为已读');
      let newData = this.state.data;
      newData[index].readstatus = 2;
      const unReadCount = this.state.unReadCount - 1;
      this.setState({
        data: newData,
        unReadCount: unReadCount < 0 ? 0 : unReadCount
      })
    })
  }

  openReminderConfig(item) {
    this.setState({
      modalVisible: true,
      currentItem: item
    });
  }

  closeReminderConfig(event) {
    if (event) {
      event.nativeEvent.stopImmediatePropagation();
    }
    this.setState({
      modalVisible: false,
      currentItem: null
    });
  }

  setReminderDisabled(disabled) {
    const { currentItem } = this.state;
    if (!currentItem) return;
    const params = {
      reminderid: currentItem.msgparam.reminderid,
      entityrecid: currentItem.msgparam.businessid,
      reminderstatus: disabled ? 1 : 0
    };
    this.setState({ modalBtnLoading: true });
    disableReminder(params).then(() => {
      this.setState({ modalBtnLoading: false });
      this.closeReminderConfig();
      message.success('设置成功');
    }, error => {
      this.setState({ modalBtnLoading: false });
      message.error(error.message || '设置失败');
    });
  }

  renderText() {
    for (let i = 0; i < menuData.length; i++) {
      if (menuData[i].key == this.state.msgType) { //注：不用全等
        return menuData[i].text;
      }
    }
  }

  isRenderMsgProgress(item) {
    if (item.msgstyletype === msgTypes.IMPORT_RESULT) {
      return `共导入数据${item.msgparam.data.DealRowsCount}条,导入成功${item.msgparam.data.DealRowsCount - item.msgparam.data.ErrorRowsCount}条,导入失败${item.msgparam.data.ErrorRowsCount}条`;
    } else {
      return null;
    }
  }

  render() {
    const menu = (
      <Menu onClick={this.headerMenuHandler.bind(this)}>
        {
          menuData.map((item) => {
            return <Menu.Item key={item.key}>{item.text}</Menu.Item>
          })
        }
      </Menu>
    );

    return (
      <div>
        <Badge count={this.state.unReadCount}>
          <Icon type='bell' style={{ fontSize: 24, cursor: "pointer" }} onClick={this.toggleList.bind(this)} />
        </Badge>
        <div className={styles.listContent}
             style={{ right: this.state.visible ? 0 : "-440px", height: this.state.clientHeight - 60 }}
             onClick={(e) => {
               e.nativeEvent.stopImmediatePropagation()
             }}>
          <div className={styles.header}>
            <Dropdown overlay={menu}>
              <a>
                {
                  this.renderText()
                }
                <Icon type="down" />
              </a>
            </Dropdown>
          </div>
          <Spin spinning={this.state.loading} tip="Loading...">
            <ul className={styles.ulWrap}>
              {
                this.state.data.map((item, index) => {
                  const cls = classnames({
                    [styles.alreadyRead]: item.readstatus === 2
                  });
                  const { msgid, msgtitle, msgstyletype, msgparam, msgcontent } = item;
                  const hasLink = item.msgstyletype === 8; // 为8可以跳转 4 不可以
                  return (
                    <li
                      className={cls}
                      style={hasLink ? { cursor: 'pointer' } : null}
                      key={msgid + 'itemWrap' + index}
                      onClick={this.listClickHandler.bind(this, item.readstatus, msgid, index, item)}
                    >
                      <ul>
                        <li>
                          <span className={styles.msgtitle}
                                title={msgtitle}>{msgstyletype === msgTypes.IMPORT_RESULT ? `${msgparam.data.TaskName}导入完成` : msgtitle}</span>
                          <span className={styles.timeinfo}>{item.reccreated.toString().split(' ')[0]}</span>
                        </li>
                        {msgstyletype === msgTypes.IMPORT_RESULT && <li title={'导入结果：' + this.isRenderMsgProgress(item)}>
                          导入结果：
                          {this.isRenderMsgProgress(item)}
                        </li>}
                        {(msgstyletype === msgTypes.TASK || msgstyletype === 8) && <li title={msgcontent}>
                          {msgcontent}
                        </li>}
                      </ul>
                      {msgstyletype === msgTypes.IMPORT_RESULT &&
                      <a className={styles.download} href={`/api/fileservice/download?fileid=${msgparam.data.ResultFileId}`}>下载</a>}
                      {((msgstyletype === msgTypes.TASK || msgstyletype === 8) && msgparam && msgparam.reminderid)
                      && <a className={styles.download} onClick={this.openReminderConfig.bind(this, item)}>提醒设置</a>}
                    </li>
                  );
                })
              }
              {
                this.state.loading ? null : this.state.isPessionLoad ?
                  <li key="loadMore" className={styles.loadMore} onClick={this.loadMore.bind(this)}>加载更多...</li> :
                  <li key="loadMore" className={styles.loadMore}>亲,没有更多数据加载了哦</li>
              }
            </ul>
          </Spin>
          <Modal
            wrapClassName={styles.modal}
            width={420}
            visible={this.state.modalVisible}
            onCancel={this.closeReminderConfig.bind(this)}
            footer={[
              <Button key="ok" loading={this.state.modalBtnLoading}
                      onClick={this.setReminderDisabled.bind(this, false)}>提醒</Button>,
              <Button key="cancel" loading={this.state.modalBtnLoading}
                      onClick={this.setReminderDisabled.bind(this, true)}>不提醒</Button>
            ]}
          >
            <div className={styles.modalContent}>
              <Icon type="question-circle" />
              <span>设置是否提醒</span>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}


export default connect()(MessageList);
