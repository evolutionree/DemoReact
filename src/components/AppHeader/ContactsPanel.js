import React, { PropTypes, Component } from 'react';
import { Badge, Icon, Tabs, message, Spin } from "antd";
import classnames from 'classnames';
import styles from './ContactsPanel.less';
import Avatar from "../Avatar";
import Search from "../Search";
import DepartmentSelect from "../DepartmentSelect";
import { queryContacts } from '../../services/structure';

const TabPane = Tabs.TabPane;

const ContactItem = ({ data, onStar, onClick }) => {
  return (
    <li className={styles.contactItem} onClick={onClick}>
      <div className={styles.contactAvatar}>
        <Avatar image={data.headicon} width={30} />
      </div>
      <p>{data.contactname}</p>
      <p>{data.deptname}</p>
      <p>
        <Icon type="mobile" />
        <span style={{ marginRight: '12px' }}>{data.mobile}</span>
        <Icon type="phone" />
        <span>{data.phone}</span>
      </p>
      <div className={classnames(styles.contactStar, { [styles.isStared]: data.isstared })}>
        <Icon type="star" onClick={(e) => { e.stopPropagation(); onStar(); }} />
      </div>
    </li>
  );
};

const ContactList = ({ children }) => {
  return (
    <ul className={styles.contactList}>
      {children}
    </ul>
  );
};

class ContactsPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      searchKey: '',
      searchDept: '',
      currentTab: '1',
      list: [],
      detailVisible: false,
      detailData: {},
      loading: false
    };
  }

  componentDidMount() {
    // document.body.addEventListener('click', this.hidePanel, false);
  }

  componentWillUnmount() {
    // document.body.removeEventListener('click', this.hidePanel);
  }

  hidePanel = () => {
    this.togglePanelVisible(false);
  };

  togglePanelVisible = (visible) => {
    const panelVisible = typeof visible === 'boolean' ? visible : !this.state.panelVisible;
    this.setState({ panelVisible }, () => {
      if (panelVisible) {
        this.setState({
          searchKey: '',
          searchDept: '',
          currentTab: '1',
          list: [],
          detailVisible: false,
          detailData: {},
        }, this.fetchList);
      } else {
        this.setState({
          detailVisible: false
        })
      }
    });
  };

  fetchList = () => {
    this.setState({ loading: true });
    queryContacts({}).then(result => {
      this.setState({ list: result, loading: false });
    }, err => {
      message.error(err.message || '获取通讯录列表失败');
    });
  };

  onTabChange = (tabKey) => {
    this.setState({
      searchKey: '',
      searchDept: '',
      currentTab: tabKey,
      list: []
    }, this.fetchList);
  };

  onSearch = (val) => {
    this.setState({
      searchKey: val
    }, this.fetchList);
  };

  closeDetail = () => {
    this.setState({ detailData: {}, detailVisible: false });
  };

  showContactDetail = (item) => {
    this.setState({ detailData: item, detailVisible: true });
  };

  handleStar = (item) => {

  };

  onDepartmentChange = (deptid) => {
    this.setState({
      searchDept: deptid
    }, this.fetchList);
  };

  renderTabItems = () => {
    const tabs = [
      { key: '1', label: '最近联系' },
      { key: '2', label: '星标' },
      { key: '3', label: '我的部门' },
      { key: '4', label: '团队组织' }
    ];
    return tabs.map(tab => {
      const cls = classnames(styles.panelTabItem, { [styles.isActive]: this.state.currentTab === tab.key });
      return <li key={tab.key} className={cls} onClick={() => this.onTabChange(tab.key)}>{tab.label}</li>;
    });
  };

  render() {
    return (
      <div>
        <Badge>
          <Icon
            type="contacts"
            style={{ fontSize: 24, cursor: "pointer", marginRight: '10px' }}
            onClick={this.togglePanelVisible}
          />
        </Badge>
        <div className={classnames(styles.panelWrap, { [styles.panelVisible]: this.state.panelVisible })}>
          <div className={styles.panelHeader}>
            <Icon type='contacts' />
            <span>通讯录</span>
            <Icon type="close" onClick={this.hidePanel} />
          </div>
          <ul className={styles.panelTabs}>
            {this.renderTabItems()}
          </ul>
          <Spin spinning={this.state.loading}>
            <div className={styles.panelContent}>
              <div className={styles.panelSearch}>
                {this.state.currentTab === '4' ? (
                  <DepartmentSelect
                    value={this.state.searchDept}
                    onChange={this.onDepartmentChange}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Search
                    mode="icon"
                    placeholder="按姓名搜索"
                    value={this.state.searchKey}
                    onSearch={this.onSearch}
                    width="100%"
                  />
                )}
              </div>
              <ContactList>
                {this.state.list.map(item => (
                  <ContactItem
                    key={item.id}
                    data={item}
                    onClick={this.showContactDetail.bind(this, item)}
                    onStar={this.handleStar.bind(this, item)}
                  />
                ))}
              </ContactList>
            </div>
          </Spin>
          <div className={styles.detailPanel} style={{ display: this.state.detailVisible ? 'block' : 'none' }}>
            <div className={styles.detailHeader}>
              <span style={{ fontSize: '18px', marginRight: '12px' }}>林克</span>
              <span style={{ fontSize: '14px', color: '#999' }}>超厉害的部门</span>
              <Icon type="close" onClick={this.closeDetail} />
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailAvatar}>
                <Avatar image="123" width={120} />
              </div>
              <p className={styles.detailMeta}>
                <span>姓名：</span>
                <span>林克</span>
              </p>
              <p className={styles.detailMeta}>
                <span>部门：</span>
                <span>超厉害的部门</span>
              </p>
              <p className={styles.detailMeta}>
                <span>入职日期：</span>
                <span>2017.09.09</span>
              </p>
              <p className={styles.detailMeta}>
                <span>性别：</span>
                <span>男</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContactsPanel;
