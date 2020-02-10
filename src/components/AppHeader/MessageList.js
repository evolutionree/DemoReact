/**
 * Created by 0291 on 2017/7/14.
 */
import React from 'react';
import { Tabs, Icon, Spin, Modal, message, Button, Radio } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import request from '../../utils/request';
import { disableReminder } from '../../services/reminder';
import { checkHasPermission } from '../../services/entcomm';
import classnames from 'classnames';
import BadgeIcon from './BadgeIcon';
import { approveStatus } from './hasBase64Str';
import styles from './MessageList.less';

const { TabPane } = Tabs;

const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
// const menuData=[{key:-1, text:'全部'}, {key:0, text:'系统通知'} ,{key:1, text:'实体操作消息'},
//   {key:2, text:'实体动态消息'},{key:3, text:'实体动态带点赞'},{key:4, text:'提醒'},{key:5, text:'审批'},
//   {key:6, text:'工作报告'},{key:7, text:'公告通知'},{key:99, text:'导入结果提醒'}];

const MSG_GROUP_ID = 1004;
const APPROVE_GROUP_ID = 1006;

const msgTypes = {
  IMPORT_RESULT: 99,
  TASK: 4,
  APPROVE: 5
};

const menuData = [
  { key: msgTypes.IMPORT_RESULT, text: '导入结果提醒', type: 'IMPORT_RESULT' },
  { key: msgTypes.TASK, text: '智能提醒', type: 'TASK' },
  { key: msgTypes.APPROVE, text: '审批提醒', type: 'APPROVE' }
];

// 0实体消息推送 1审批 2审批加签 3审批转办 4会审 5会审加签 6会审转办 7意见收集 8意见收集加签 9意见收集转办  10通知 11抄送 12传阅 13知会
const colorList = ['pink', 'red', 'gray', 'orange', 'cyan', 'green', 'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime', 'brown'];

const getApproveCount = (count) => count ? `(${count > 99 ? '99+' : count})` : '';

const radioList = [
  { key: 1, name: '待办' },
  { key: 2, name: '已办' },
  { key: 3, name: '未阅' },
  { key: 4, name: '已阅' }
]


class MessageList extends React.Component {
  static propTypes = {}
  static defaultProps = {
    url: '/api/notify/vertionmsglist'
  }

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isPessionLoad: true,
      pageIndex: 0,
      clientHeight,
      unReadCount: null,
      loading: false,
      msgType: msgTypes.APPROVE,
      modalVisible: false,
      modalBtnLoading: false,
      currentItem: null,
      MsgType: 1 // 1代办 2已办 3未阅
    };
  }

  componentDidMount() {
    this.fetchUnReadCount();
    this.interval = setInterval(() => this.fetchUnReadCount(), 15000);

    document.addEventListener('emitMsgClick', this.updateList, false);
    document.body.addEventListener('click', this.hideList, false);
    window.addEventListener('resize', this.onWindowResize, false);
    const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
    this.setState({ clientHeight });
  }

  componentWillUnmount() {
    document.removeEventListener('emitMsgClick', this.updateList, false);
    document.body.removeEventListener('click', this.hideList, false);
    window.removeEventListener('resize', this.onWindowResize, false);
    // 去掉定时器任务
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onWindowResize = () => {
    const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
    this.setState({
      clientHeight: clientHeight
    });
  }

  updateList = (e) => {
    this.setState({ msgType: 5, visible: !this.state.visible }, () => this.handleChangeRadio({ target: { value: e.detail } }));
  }

  fetchUnReadCount() {
    request('api/notify/unreadcount', {
      method: 'post',
      body: JSON.stringify({ MsgGroupIds: [MSG_GROUP_ID, APPROVE_GROUP_ID] })
    })
      .then(result => {
        this.setState({
          unReadCount: result.data.reduce((total, item) => total + item.count, 0)
        });
      })
      .catch(e => {
        message.error(e.message);
      });
  }

  getFieldType = (msgType, MsgType = this.state.MsgType) => {
    return `${(menuData.find(item => item.key === msgType).type || 'IMPORT_RESULT')}${(msgType === 5 ? MsgType : '')}`;
  }

  getMsgParams = (type, RecVersion, msgType = msgTypes.IMPORT_RESULT) => {
    const { MsgType } = this.state;
    let MsgGroupIds = [MSG_GROUP_ID];
    let MsgStyleTypes;

    if (msgType === -1) {
      MsgStyleTypes = [msgTypes.IMPORT_RESULT, msgTypes.TASK, 8];
    } else if (+msgType === msgTypes.TASK) {
      MsgStyleTypes = [1, msgTypes.TASK, 8];
    } else if (+msgType === msgTypes.APPROVE) {
      MsgStyleTypes = [msgTypes.APPROVE];
      MsgGroupIds = [APPROVE_GROUP_ID];
    } else {
      MsgStyleTypes = [msgTypes.IMPORT_RESULT];
    }

    const params = {
      RecVersion,
      Direction: RecVersion === 0 ? 0 : -1, // 以版本号为基线，向前或者向后取值，-1为取小于RecVersion的数据，0为全量，1为取大于RecVersion的数据
      PageSize: 10,
      MsgGroupIds,
      MsgStyleTypes
    };

    if (+msgType === msgTypes.APPROVE) params.MsgType = MsgType;

    return params;
  }

  fetchList = async params => {
    return request(this.props.url, {
      method: 'post',
      body: JSON.stringify(params)
    })
      .then(res => res)
      .catch(e => {
        message.error(e.message);
        console.error(e.message);
      });
  }

  fetchAllList = async (type, RecVersion) => {
    const paramArr = menuData.map(item => this.getMsgParams(type, RecVersion, item.key));
    const funcArr = paramArr.map(args => this.fetchList(args));
    return Promise.all(funcArr)
      .then(arr => {
        const result = {};
        menuData.forEach((item, i) => (result[this.getFieldType(item.key)] = arr[i]));
        return result;
      })
      .catch(e => {
        message.error(e.message);
        console.error(e.message);
      });
  }

  fetchApproveData = () => {
    request('api/notify/getmsgcount', {
      method: 'post',
      body: JSON.stringify({})
    })
      .then(result => {
        const { data } = result;

        const countList = {}
        for (let i = 1; i <= 4; i += 1) countList[`${this.getFieldType(msgTypes.APPROVE, i)}count`] = data[i - 1] ? data[i - 1].count : 0;

        this.setState(countList);
      })
      .catch(e => {
        console.error(e.message);
        message.error(e.message);
      });
  }

  fetchMsgList = async (type, RecVersion, msgType = msgTypes.IMPORT_RESULT, isFirst) => {
    const params = this.getMsgParams(type, RecVersion, msgType);

    this.setState({ loading: true });

    let result = null;

    if (!isFirst) {
      result = await this.fetchList(params).then(res => (result = res));
    } else {
      result = await this.fetchAllList(type, RecVersion)
        .then(res => res)
        .catch(e => {
          message.error(e.message);
          console.error(e.message);
        });
    }

    if (msgType === 5) this.fetchApproveData();

    this.setNewData(result, type, msgType);
  }

  setNewData = (result, type, msgType) => {
    const isSingle = result.data;
    const fieldType = this.getFieldType(msgType);
    let newData = this.state[fieldType] || [];
    const otherState = {};

    if (isSingle) {
      // 单个请求
      if (newData.length === 0 || type === 'load') {
        newData = result.data ? result.data.datalist : [];
      } else if (type === 'loadMore') {
        result.data &&
          Array.isArray(result.data.datalist) &&
          result.data.datalist.forEach(item => {
            newData.push(item);
          });
      }
    } else {
      Object.keys(result).forEach(
        key => (otherState[key] = result[key].data && Array.isArray(result[key].data.datalist) ? result[key].data.datalist : [])
      );
    }

    const RecVersion = isSingle ? result.data.pageminversion : result[fieldType].data.pageminversion;

    const pageminversion = isSingle ? result.data.pageminversion : result[fieldType].data.pageminversion;

    const pagemaxversion = isSingle ? result.data.pagemaxversion : result[fieldType].data.pagemaxversion;

    const isPessionLoad = newData.length < 10 ? false : !(pageminversion === pagemaxversion); // 是否所有数据查询完

    this.setState({
      [fieldType]: newData,
      RecVersion,
      isPessionLoad,
      loading: false,
      ...otherState
    });
  }

  toggleList(e) {
    this.fetchMsgList('load', 0, this.state.msgType, true);
    e.nativeEvent.stopImmediatePropagation(); // 阻止冒泡
    this.setState({ visible: !this.state.visible });
  }

  hideList = event => {
    if (this.state.modalVisible) return;
    if ($(event.target).closest('#message-panel').length || $(event.target).closest('.ant-dropdown').length) {
      return;
    }
    this.setState({ visible: false });
  }

  loadMore() {
    this.fetchMsgList('loadMore', this.state.RecVersion, this.state.msgType);
  }

  headerMenuHandler = key => {
    const msgType = key * 1;
    this.fetchMsgList('load', 0, msgType);
    this.setState({ msgType });
  }

  handleChangeRadio = (e) => {
    this.setState({ MsgType: e.target.value }, () => this.fetchMsgList('load', 0, msgTypes.APPROVE));
  }

  listClickHandler(readStatus, msgid, index, item) {
    // 用户点击之后 表示已读 readstatus：0：未读 1：已查 2：已读
    const { msgstyletype, msgparam } = item;
    let link = null;

    if (msgstyletype === 5 && msgparam && msgparam.data && msgparam.data.caseid) {
      link = `/affair/${msgparam.data.caseid}`;
      this.fetchApproveData();
    }

    if (msgstyletype === 8 && msgparam && msgparam.entityid && msgparam.businessid) {
      if (msgparam.data.type + '' === '0') {
        link = `/entcomm/${msgparam.entityid}/${msgparam.businessid}`;
      } else if (msgparam.data.type + '' === '2') {
        link = `/entcomm-application/${msgparam.entityid}`;
      }
    }

    if (link) {
      if (msgstyletype === 5) {
        this.props.dispatch(
          routerRedux.push({ pathname: link })
        );
      } else {
        checkHasPermission({
          entityid: msgparam.entityid,
          recid: msgparam.businessid
        }).then(
          result => {
            if (result.data === '0') {
              message.error('您没有权限查看该数据');
            } else if (result.data === '2') {
              message.error('该数据已删除，无法查看');
            } else {
              this.props.dispatch(
                routerRedux.push({ pathname: link })
              );
            }
          },
          err => {
            message.error('获取超时，请检查网络!');
          }
        );
      }
    }

    if (readStatus === 2) {
      return false;
    }
    request('/api/notify/writeback', {
      method: 'post',
      body: JSON.stringify({ MsgIds: [msgid] })
    }).then(result => {
      // message.success('标记为已读');
      const fieldType = this.getFieldType(msgstyletype);
      const newData = this.state[fieldType] || [];

      newData[index].readstatus = 2;
      const unReadCount = this.state.unReadCount - 1;
      this.setState({
        [fieldType]: newData,
        unReadCount: unReadCount < 0 ? 0 : unReadCount
      });
    });
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
    disableReminder(params).then(
      () => {
        this.setState({ modalBtnLoading: false });
        this.closeReminderConfig();
        message.success('设置成功');
      },
      error => {
        this.setState({ modalBtnLoading: false });
        message.error(error.message || '设置失败');
      }
    );
  }

  renderText() {
    for (let i = 0; i < menuData.length; i++) {
      if (menuData[i].key == this.state.msgType) {
        // 注：不用全等
        return menuData[i].text;
      }
    }
  }

  isRenderMsgProgress(item) {
    if (item.msgstyletype === msgTypes.IMPORT_RESULT) {
      return `共导入数据${item.msgparam.data.DealRowsCount}条,导入成功${item.msgparam.data.DealRowsCount -
        item.msgparam.data.ErrorRowsCount}条,导入失败${item.msgparam.data.ErrorRowsCount}条`;
    } else {
      return null;
    }
  }

  renderTabs = () => {
    const { msgType: msgtype, loading, isPessionLoad, clientHeight, MsgType } = this.state;

    return (
      <Tabs
        size="small"
        type="card"
        activeKey={msgtype + ''}
        onChange={this.headerMenuHandler}
        tabBarStyle={{ marginBottom: -1 }}
      >
        {menuData.map(item => {
          const data = this.state[this.getFieldType(item.key, MsgType)] || [];
          const count = data.length;

          radioList.forEach((o, index) => {
            const title = this.state[`${this.getFieldType(item.key, o.key)}count`]
            radioList[index].title = title
            radioList[index].count = getApproveCount(title)
          })

          return (
            <TabPane key={item.key + ''} tab={`${item.text} ` + (count ? '' : '')}>
              <Spin spinning={loading} tip="Loading...">
                {
                  msgtype !== 5 ? (
                    <ul className={styles.ulWrap} style={{ height: clientHeight - 90 }}>
                      {data.map((item, index) => {
                        const cls = classnames({
                          [styles.alreadyRead]: item.readstatus === 2
                        });
                        const { msgid, msgtitle, msgstyletype, msgparam, msgcontent } = item;
                        const hasLink = [5, 8].includes(item.msgstyletype); // 为8可以跳转 4 不可以

                        return (
                          <li
                            className={cls}
                            style={hasLink ? { cursor: 'pointer' } : null}
                            key={msgid + 'itemWrap' + index}
                            onClick={this.listClickHandler.bind(this, item.readstatus, msgid, index, item)}
                          >
                            <ul>
                              <li>
                                <span className={styles.msgtitle} title={msgtitle}>
                                  {msgstyletype === msgTypes.IMPORT_RESULT ? `${msgparam.data.TaskName}导入完成` : msgtitle}
                                </span>
                                <span className={styles.timeinfo}>{item.reccreated.toString().split(' ')[0]}</span>
                              </li>
                              {[msgTypes.IMPORT_RESULT].includes(msgstyletype) && (
                                <li title={`导入结果：${this.isRenderMsgProgress(item)}`}>
                                  导入结果：
                              {this.isRenderMsgProgress(item)}
                                  <a
                                    className={styles.download}
                                    href={`/api/fileservice/download?fileid=${msgparam.data.ResultFileId}`}
                                  >
                                    下载
                              </a>
                                </li>
                              )}
                              {[msgTypes.TASK, 5, 8].includes(msgstyletype) && (
                                <li title={msgcontent}>
                                  {msgcontent}
                                  {[msgTypes.TASK, 8].includes(msgstyletype) && msgparam && msgparam.reminderid && (
                                    <a className={styles.download} onClick={this.openReminderConfig.bind(this, item)}>
                                      提醒设置
                                </a>
                                  )}
                                </li>
                              )}
                            </ul>
                          </li>
                        );
                      })}
                      {loading ? null : isPessionLoad ? (
                        <li key="loadMore" className={styles.loadMore} onClick={this.loadMore.bind(this)}>
                          加载更多
                    </li>
                      ) : (
                          <li key="loadMore" className={styles.loadNo}>
                            亲,没有更多数据加载了哦
                    </li>
                        )}
                    </ul>
                  ) : (
                      <div className={styles.approveWrap}>
                        <Radio.Group className={styles.RadioTab} value={MsgType} onChange={this.handleChangeRadio}>
                          {radioList.map(item => <Radio.Button title={item.title} value={item.key} key={item.key}>{item.name} {item.count}</Radio.Button>)}
                        </Radio.Group>
                        <ul className={styles.ulWrap} style={{ paddingTop: 30, height: clientHeight - 90 }}>
                          {data.map((item, index) => {
                            const cls = classnames({ [styles.alreadyRead]: item.readstatus === 2 });
                            const { msgid, msgtitle, msgcontent, actrole, actrole_name, newbizstatus } = item;

                            return (
                              <li
                                className={cls}
                                style={{ cursor: 'pointer' }}
                                key={msgid + 'itemWrap' + index}
                                onClick={this.listClickHandler.bind(this, item.readstatus, msgid, index, item)}
                              >
                                <ul className={styles.approveUl}>
                                  <li className={styles.approveTitle}>
                                    <span className={styles.msgtitle} title={msgtitle}>{msgtitle}</span>
                                    <span className={styles.timeinfo}>{item.reccreated.toString().split(' ')[0]}</span>
                                    <span className={styles.approveFlag} style={{ color: colorList[actrole] }}>{actrole_name}</span>
                                  </li>
                                  <li title={msgcontent}>{msgcontent}</li>
                                  {/* {approveStatus[newbizstatus] && <img className={styles.approveImg} src={approveStatus[newbizstatus]} alt="" />} */}
                                </ul>
                              </li>
                            );
                          })}
                          {
                            loading ? null : (
                              isPessionLoad ?
                                <li key="loadMore" className={styles.loadMore} onClick={this.loadMore.bind(this)}>加载更多</li> :
                                <li key="loadMore" className={styles.loadNo}>亲,没有更多数据加载了哦</li>
                            )
                          }
                        </ul>
                      </div>
                    )
                }
              </Spin>
            </TabPane>
          );
        })}
      </Tabs>
    );
  }

  render() {
    return (
      <div>
        <BadgeIcon
          textBool={false}
          IconType="bell"
          title="系统通知"
          onClick={this.toggleList.bind(this)}
          count={this.state.unReadCount}
        />
        <div
          id="message-panel"
          className={styles.listContent}
          style={{
            width: 400,
            right: this.state.visible ? 0 : '-440px'
          }}
          onClick={e => e.nativeEvent.stopImmediatePropagation()}
        >
          {this.renderTabs()}
          <Modal
            wrapClassName={styles.modal}
            width={420}
            visible={this.state.modalVisible}
            onCancel={this.closeReminderConfig.bind(this)}
            footer={[
              <Button
                key="ok"
                loading={this.state.modalBtnLoading}
                onClick={this.setReminderDisabled.bind(this, false)}
              >
                提醒
              </Button>,
              <Button
                key="cancel"
                loading={this.state.modalBtnLoading}
                onClick={this.setReminderDisabled.bind(this, true)}
              >
                不提醒
              </Button>
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
