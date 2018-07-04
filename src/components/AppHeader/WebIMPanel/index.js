/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon, Badge } from 'antd';
import classnames from 'classnames';
import Search from './Component/Search';
import Tabs from './Component/Tabs';
import { ContactPanel, GroupPanel, RecentPanel } from './TabPanel';
import { OtherPanelRender } from './OtherPanelRender';
import ContextMenuPanel from './Component/ContextMenuPanel';
import _ from 'lodash';
import styles from './index.less';

class WebIMPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      tabModel: [{
        name: 'recent',
        tooltip: '最近聊天',
        content: <RecentPanel />,
        active: true
      }, {
        name: 'contact',
        tooltip: '通讯录',
        content: <ContactPanel />,
        active: false
      }, {
        name: 'group',
        tooltip: '群聊',
        content: <GroupPanel />,
        active: false
      }, {
        name: 'add',
        active: false
      }],
      showTabPage: 'recent'
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
    document.body.addEventListener('contextmenu', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
    document.body.removeEventListener('contextmenu', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    this.props.dispatch({ type: 'webIM/setContextMenu', payload: { visible: false } });  //隐藏 上下文菜单列表

    if ($(event.target).closest('#webIM').length) {
      return;
    }
    this.hidePanel();
  };

  componentDidUpdate() {
    const { webIMSocket, dispatch, spotNewMsgList, showPanel, panelInfo } = this.props;
    if (webIMSocket) {
      webIMSocket.onmessage = (event) => {
        console.log('Client received a message', event);
        const message = JSON.parse(event.data);
        if (message.ResultCode === undefined) {
          const CustomContent = message.CustomContent;
          dispatch({
            type: 'webIM/putReceiveOrSendMessage',
            payload: {
              data: {
                mid: CustomContent.mid,
                ctype: parseInt(CustomContent.ctype), // chattype      0为私聊，1为群聊
                gid: CustomContent.gid, //群组id 非群组消息默认 传00000000-0000-0000-0000-000000000000
                ct: CustomContent.ct, //聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
                fid: CustomContent.fid, //发送的文件fileid
                cont: message.Message //发送的文本内容
              },
              ud: {
                userid: CustomContent.ud.UserId,
                username: CustomContent.ud.UserName,
                usericon: CustomContent.ud.UserIcon
              },
              IMPanelCtype: parseInt(CustomContent.ctype),
              IMPanelKey: parseInt(CustomContent.ctype) === 0 ? CustomContent.s : CustomContent.gid, //发送者 userid  IMPanelKey用于定义 聊天面板的key，用于筛选出当前面板的对话聊天数据
              time: CustomContent.t,
              type: 'receiveMessage'
            }
          });

          if ((showPanel === 'IMPanel' || showPanel === 'miniIMPanel') && panelInfo.userid === CustomContent.s) {
            //当前正在窗口聊天中  不显示 徽标数
          } else {
            let newSpotNewMsgList = _.cloneDeep(spotNewMsgList);
            if (newSpotNewMsgList) {
              newSpotNewMsgList[CustomContent.s] = newSpotNewMsgList[CustomContent.s] ? newSpotNewMsgList[CustomContent.s] + 1 : 1;
            } else {
              newSpotNewMsgList = { [CustomContent.s]: 1 };
            }
            dispatch({ type: 'webIM/setSpotNewMsgList', payload: newSpotNewMsgList });
          }

          dispatch({ type: 'webIM/queryRecentList__' });
        }
      };
    }
  }

  hidePanel = () => {
    this.setState({
      panelVisible: false
    });
  }

  togglePanelVisible = () => {
    this.setState({
      panelVisible: !this.state.panelVisible
    });
  }

  tabClickHandler = (tabName) => {
    const newTabModel = this.state.tabModel.map(item => {
      item.active = false;
      if (item.name === tabName) {
        item.active = true;
      }
      return item;
    })

    if (tabName === 'recent') {
      this.props.dispatch({ type: 'webIM/queryRecentList__' });
    }

    this.setState({
      tabModel: newTabModel,
      showTabPage: tabName === 'add' ? this.state.showTabPage : tabName
    });
  }

  render() {
    const { showPanel, showChildrenPanel, contextMenuInfo, spotNewMsgList } = this.props;
    const tabModel = this.state.tabModel;
    let OtherPanelComponent = OtherPanelRender[showPanel];
    let OtherPanelChildrenComponent = OtherPanelRender[showChildrenPanel];

    let total_spotMsgCount = 0;
    if (spotNewMsgList) {
      for (let key in spotNewMsgList) {
        total_spotMsgCount += spotNewMsgList[key];
      }
    }

    return (
      <div id="webIM">
        <Badge count={total_spotMsgCount}>
          <Icon
            type="contacts"
            title="通讯录"
            style={{ fontSize: 24, cursor: 'pointer', marginRight: '10px', verticalAlign: 'middle' }}
            onClick={this.togglePanelVisible}
          />
        </Badge>
        <div className={classnames(styles.panelWrap, { [styles.panelVisible]: this.state.panelVisible })}>
          <ul className={styles.header}>
            <li>
              <Search style={{ top: '50%', transform: 'translateY(-50%)' }} />
            </li>
            <li>
              <Tabs onClick={this.tabClickHandler} model={tabModel} />
            </li>
          </ul>
          <div className={styles.body}>
            {
              tabModel.map((item, index) => {
                return (
                  <div style={{ display: item.name === this.state.showTabPage ? 'block' : 'none' }} className={styles.bodyWrap} key={index}>
                    {
                      item.content
                    }
                  </div>
                );
              })
            }
          </div>
        </div>
        {
          this.state.panelVisible && OtherPanelComponent ? <div className={styles.otherPanelWrap}>
            {
              React.createElement(OtherPanelComponent, { panelInfo: this.props.panelInfo })
            }
          </div> : null
        }
        {
          this.state.panelVisible && OtherPanelChildrenComponent ? <div className={styles.otherPanelWrap}>
            {
              React.createElement(OtherPanelChildrenComponent, { panelInfo: this.props.childrenPanelInfo, showGoBack: true })
            }
          </div> : null
        }
        <ContextMenuPanel />
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.webIM
    };
  },
  dispatch => {
    return {
      dispatch
    };
  })(WebIMPanel);
