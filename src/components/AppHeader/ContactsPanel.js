import React, { PropTypes, Component } from 'react';
import { Badge, Icon, Tabs } from "antd";
import styles from './ContactsPanel.less';

const TabPane = Tabs.TabPane;

class ContactsPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onTabChange = () => {

  };

  render() {
    return (
      <div>
        <Badge>
          <Icon type='contacts' style={{ fontSize: 24, cursor: "pointer", marginRight: '10px' }} />
        </Badge>
        <div className={styles.panelWrap}>
          <div className={styles.panelHeader}>
            <Icon type='contacts' />
            <span>通讯录</span>
          </div>
          <Tabs className={styles.panelTabs} defaultActiveKey="1" onChange={this.onTabChange}>
            <TabPane tab="最近联系" key="1">Content of Tab Pane 1</TabPane>
            <TabPane tab="星标" key="2">Content of Tab Pane 2</TabPane>
            <TabPane tab="我的部门" key="3">Content of Tab Pane 3</TabPane>
            <TabPane tab="团队组织" key="4">Content of Tab Pane 3</TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default ContactsPanel;
