import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Icon, Tabs, message, Spin } from 'antd';
import classnames from 'classnames';
import Avatar from '../Avatar';
import Search from '../Search';
import DepartmentSelect from '../DepartmentSelect';
import { queryContacts, queryUsers, flagContact } from '../../services/structure';
import BadgeIcon from './BadgeIcon';
import styles from './ContactsPanel.less';

const TabPane = Tabs.TabPane;

const ContactItem = ({ data, onStar, onClick, showStar = false }) => {
  const onClickStar = (e) => {
    e.stopPropagation();
    onStar();
  };
  return (
    <li className={styles.contactItem} onClick={onClick}>
      <div className={styles.contactAvatar}>
        <Avatar image={`/api/fileservice/read?fileid=${data.usericon}`} width={30} />
      </div>
      <p>{data.username}</p>
      <p>{data.deptname}</p>
      <p>
        <Icon type="mobile" style={{ marginRight: '5px' }} />
        <MetaValue>{data.userphone}</MetaValue>
        <Icon type="phone" style={{ marginLeft: '12px', marginRight: '5px' }} />
        <MetaValue>{data.usertel}</MetaValue>
      </p>
      {showStar && <div className={classnames(styles.contactStar, { [styles.isStared]: data.flag })}>
        <Icon type="star" onClick={onClickStar} />
      </div>}
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

const MetaValue = ({ children }) => {
  if (!children) {
    return <span style={{ color: '#999' }}>未填写</span>;
  }
  return <span>{children}</span>;
};

class ContactsPanel extends Component {
  static propTypes = {
    userInfo: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      searchKey: '',
      searchDept: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentTab: '1',
      pageIndex: 1,
      pageSize: 20,
      list: [],
      detailVisible: false,
      detailData: {},
      loading: false,
      hasMore: true
    };
  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    // if ($(event.target).closest(['#contacts-panel', '#contacts-panel-detail']).length) {
    //   return;
    // }
    if ($(event.target).closest('#contacts-panel').length || $(event.target).closest('#contacts-panel-detail').length || $(event.target).closest('.ant-select-dropdown').length) {
      return;
    }
    // console.log(event);
    this.hidePanel();
  };

  hidePanel = () => {
    this.togglePanelVisible(false);
  };

  togglePanelVisible = (visible) => {
    const panelVisible = typeof visible === 'boolean' ? visible : !this.state.panelVisible;
    this.setState({ panelVisible }, () => {
      if (panelVisible) {
        this.setState({
          panelVisible: true,
          searchKey: '',
          searchDept: '7f74192d-b937-403f-ac2a-8be34714278b',
          currentTab: '1',
          pageIndex: 1,
          pageSize: 20,
          list: [],
          detailVisible: false,
          detailData: {},
          loading: false,
          hasMore: true
        }, this.fetchList);
      } else {
        this.setState({
          detailVisible: false
        });
      }
    });
  };

  fetchList = (pageIndex = 1) => {
    const { currentTab, searchKey, searchDept } = this.state;
    if (currentTab === '1' || currentTab === '2') {
      this.setState({ loading: true });
      const params = {
        type: currentTab === '1' ? 0 : 1,
        userid: this.props.userInfo.userid,
        searchkey: searchKey,
        pageIndex: pageIndex,
        pageSize: currentTab === '1' ? 20 : -1
      };
      queryContacts(params).then(result => {
        this.setState({
          list: pageIndex === 1 ? result.data.datalist : this.state.list.concat(result.data.datalist),
          loading: false,
          pageIndex: pageIndex
        });
      }, err => {
        this.setState({ loading: false });
        message.error(err.message || '获取通讯录列表失败');
      });
    } else {
      const params = {
        deptId: currentTab === '3' ? this.props.userInfo.deptid : searchDept,
        pageIndex: pageIndex,
        pageSize: -1,
        recStatus: 1,
        userName: currentTab === '3' ? (searchKey || '') : '',
        userPhone: '',
        iscrmuser: -1
      };
      this.setState({ loading: true });
      queryUsers(params).then(result => {
        this.setState({ list: result.data.pagedata, loading: false });
      }, err => {
        this.setState({ loading: false });
        message.error(err.message || '获取通讯录列表失败');
      });
    }
  };

  onTabChange = (tabKey) => {
    this.setState({
      searchKey: '',
      searchDept: '7f74192d-b937-403f-ac2a-8be34714278b',
      currentTab: tabKey,
      pageIndex: 1,
      pageSize: 20,
      list: [],
      loading: false,
      hasMore: true
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
    const params = {
      userid: item.userid,
      flag: !item.flag
    };
    flagContact(params).then(result => {
      item.flag = !item.flag;
      this.setState({ list: [...this.state.list] });
    }, err => {
      message.error(err.message || '操作失败');
    });
  };

  loadMore = () => {
    this.fetchList(this.state.pageIndex + 1);
  };

  onDepartmentChange = (deptid) => {
    this.setState({
      searchDept: deptid
    }, this.fetchList);
  };

  renderTabItems = () => {
    const tabs = [
      { key: '1', label: '最近联系' },
      { key: '2', label: '星标同事' },
      { key: '3', label: '我的部门' },
      { key: '4', label: '团队组织' }
    ];
    return tabs.map(tab => {
      const cls = classnames(styles.panelTabItem, { [styles.isActive]: this.state.currentTab === tab.key });
      return <li key={tab.key} className={cls} onClick={() => this.onTabChange(tab.key)}>{tab.label}</li>;
    });
  };

  onClickDetailStar = () => {
    const params = {
      userid: this.state.detailData.userid,
      flag: !this.state.detailData.flag
    };
    flagContact(params).then(result => {
      this.state.detailData.flag = !this.state.detailData.flag;
      this.setState({ list: [...this.state.list] });
    }, err => {
      message.error(err.message || '操作失败');
    });
  };

  render() {
    const { detailData, currentTab, hasMore } = this.state;
    const formatDate = val => {
      if (!val) return '';
      return val.slice(0, 10);
    };
    return (
      <div>
        <BadgeIcon
          textBool={false}
          IconType="contacts"
          title="通讯录"
          onClick={this.togglePanelVisible}
        />
        <div id="contacts-panel" className={classnames(styles.panelWrap, { [styles.panelVisible]: this.state.panelVisible })}>
          <div className={styles.panelHeader}>
            <Icon type="contacts" />
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
                    showSearch
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
                    key={item.userid}
                    data={item}
                    onClick={this.showContactDetail.bind(this, item)}
                    onStar={this.handleStar.bind(this, item)}
                    showStar
                  />
                ))}
              </ContactList>
              {/*{hasMore ? <div className={styles.loadMore} onClick={this.loadMore}>加载更多</div> : <div>亲,没有更多数据加载了哦</div>}*/}
            </div>
          </Spin>
        </div>
        <div id="contacts-panel-detail" className={styles.detailPanel} style={{ display: this.state.detailVisible ? 'block' : 'none' }}>
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <span style={{ fontSize: '18px', marginRight: '12px' }}>{detailData.username}</span>
              <span style={{ fontSize: '14px', color: '#999' }}>{detailData.deptname}</span>
              <Icon type="close" onClick={this.closeDetail} />
            </div>
            <div className={styles.detailContent}>
              <div className={classnames([styles.contactStar, styles.detailStar], { [styles.isStared]: detailData.flag })}>
                <Icon type="star" onClick={this.onClickDetailStar} />
              </div>
              <div className={styles.detailAvatar}>
                <Avatar image={`/api/fileservice/read?fileid=${detailData.usericon}`} width={120} />
              </div>
              <p className={styles.detailMeta}>
                <span>姓名：</span>
                <MetaValue>{detailData.username}</MetaValue>
              </p>
              <p className={styles.detailMeta}>
                <span>部门：</span>
                <MetaValue>{detailData.deptname}</MetaValue>
              </p>
              {/*<p className={styles.detailMeta}>*/}
              {/*<span>入职日期：</span>*/}
              {/*<MetaValue>{formatDate(detailData.joineddate)}</MetaValue>*/}
              {/*</p>*/}
              <p className={styles.detailMeta}>
                <span>性别：</span>
                <MetaValue>{['男', '女'][detailData.usersex]}</MetaValue>
              </p>
              <p className={styles.detailMeta}>
                <span>职位：</span>
                <MetaValue>{detailData.userjob}</MetaValue>
              </p>
              {/*<p className={styles.detailMeta}>*/}
              {/*<span>出生日期：</span>*/}
              {/*<MetaValue>{formatDate(detailData.birthday)}</MetaValue>*/}
              {/*</p>*/}
              {/*<p className={styles.detailMeta}>*/}
              {/*<span>备注：</span>*/}
              {/*<MetaValue>{detailData.remark}</MetaValue>*/}
              {/*</p>*/}
              <div style={{ marginBottom: '15px', borderTop: '1px solid #f0f0f0' }} />
              <p className={styles.detailMeta}>
                <span>电话：</span>
                <MetaValue>{detailData.usertel}</MetaValue>
              </p>
              <p className={styles.detailMeta}>
                <span>手机号码：</span>
                <MetaValue>{detailData.userphone}</MetaValue>
              </p>
              <p className={styles.detailMeta}>
                <span>邮箱：</span>
                <MetaValue>{detailData.useremail}</MetaValue>
              </p>
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
      userInfo: state.app.user
    };
  }
)(ContactsPanel);
