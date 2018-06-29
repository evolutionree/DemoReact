/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import Search from './Component/Search';
import Tabs from './Component/Tabs';
import { ContactPanel, GroupPanel, RecentPanel } from './TabPanel';
import { OtherPanelRender } from './OtherPanelRender';
import ContextMenuPanel from './Component/ContextMenuPanel';
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
    const { webIMSocket, dispatch } = this.props;
    if (webIMSocket) {
      webIMSocket.onmessage = (event) => {
        console.log('Client received a message', event);
        const message = JSON.parse(event.data);
        if (message.ResultCode === undefined) {
          message.type = 'receiveMessage';
          message.time = new Date(message.CustomContent.t).getTime();
          dispatch({
            type: 'webIM/receivemessage',
            payload: message
          });
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
      this.props.dispatch({ type: 'webIM/queryRecentList' });
    }

    this.setState({
      tabModel: newTabModel,
      showTabPage: tabName === 'add' ? this.state.showTabPage : tabName
    });
  }

  render() {
    const { showPanel, showChildrenPanel, contextMenuInfo } = this.props;
    const tabModel = this.state.tabModel;
    let OtherPanelComponent = OtherPanelRender[showPanel];
    let OtherPanelChildrenComponent = OtherPanelRender[showChildrenPanel];
    return (
      <div id="webIM">
        <Icon
          type="contacts"
          title="通讯录"
          style={{ fontSize: 24, cursor: 'pointer', marginRight: '10px', verticalAlign: 'middle' }}
          onClick={this.togglePanelVisible}
        />
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
