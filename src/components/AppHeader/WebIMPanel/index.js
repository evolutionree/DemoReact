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
        name: 'group',
        tooltip: '通讯录',
        content: <GroupPanel />,
        active: false
      }, {
        name: 'contact',
        tooltip: '群聊',
        content: <ContactPanel />,
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
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    if ($(event.target).closest('#web-IM-Panel').length || $(event.target).closest('.webIMTooltip').length) {
      return;
    }
    this.hidePanel();
  };

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
    this.setState({
      tabModel: newTabModel,
      showTabPage: tabName === 'add' ? this.state.showTabPage : tabName
    });
  }

  render() {
    const tabModel = this.state.tabModel;
    return (
      <div>
        <Icon
          type="contacts"
          title="通讯录"
          style={{ fontSize: 24, cursor: 'pointer', marginRight: '10px', verticalAlign: 'middle' }}
          onClick={this.togglePanelVisible}
        />
        <div id="web-IM-Panel" className={classnames(styles.panelWrap, { [styles.panelVisible]: this.state.panelVisible })}>
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
                  <div style={{ display: item.name === this.state.showTabPage ? 'block' : 'none' }} key={index}>
                    {
                      item.content
                    }
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.app,
  dispatch => {
    return {

    };
  })(WebIMPanel);
