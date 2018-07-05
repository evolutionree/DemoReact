/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Icon, message, Spin } from 'antd';
import classnames from 'classnames';
import styles from '../index.less';
import Avatar from '../../../../Avatar';
import Search from '../../../../Search';
import DepartmentCrumb from '../../Component/DepartmentCrumb';
import { queryContacts, queryUsers, flagContact, getlistsub } from '../../../../../services/structure';

const ContactItem = ({ dispatch, data, onStar, showStar = false }) => {
  const onClickStar = (e) => {
    e.stopPropagation();
    onStar();
  };

  const openIMPanel = () => {
    dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: 'IMPanel',
        panelInfo: {
          ...data,
          chatid: data.userid,
          chatname: data.username,
          chattype: 0
        }
      }
    });
  }

  const openPersonalDetail = () => {
    dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: 'PersonalDetail',
        panelInfo: data
      }
    });
  }

  return (
    <li className={styles.contactItem} onDoubleClick={openIMPanel}>
      <div className={styles.contactAvatar}>
        <Avatar image={`/api/fileservice/read?fileid=${data.usericon}`} name={data.username} width={30} />
      </div>
      <div>
        <span onClick={openPersonalDetail} className={styles.userName}>{data.username}</span>
        <Icon type="message" style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={openIMPanel} />
      </div>
      <p>
        <Icon type="mobile" style={{ marginRight: '5px' }} />
        <MetaValue>{data.userphone}</MetaValue>
        <Icon type="usergroup-add" style={{ marginLeft: '10px', marginRight: '5px' }} />
        <MetaValue>{data.deptname}</MetaValue>
      </p>
      {false && <div className={classnames(styles.contactStar, { [styles.isStared]: data.flag })}>
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

class ContactPanel extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

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
      loading: false,
      hasMore: true,
      childrenDept: [] //团队组织Tab-- 当前查询部门的子部门数据
    };
  }

  componentWillMount() {
    this.fetchList();
  }

  fetchList = (pageIndex = 1) => {
    const { currentTab, searchKey, searchDept } = this.state;
    if (currentTab === '1') {
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
    } else if (currentTab === '2') {
      const params = {
        deptId: this.props.userInfo.deptid,
        pageIndex: pageIndex,
        pageSize: -1,
        recStatus: 1,
        userName: currentTab === '2' ? (searchKey || '') : '',
        userPhone: ''
      };
      this.setState({ loading: true });
      queryUsers(params).then(result => {
        this.setState({ list: result.data.pagedata, loading: false });
      }, err => {
        this.setState({ loading: false });
        message.error(err.message || '获取通讯录列表失败');
      });
    } else {
      this.setState({ loading: true });
      getlistsub(searchDept).then(result => {
        this.setState({ list: result.data.subusers, childrenDept: result.data.subdepts, loading: false });
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
      { key: '1', label: '星标同事' },
      { key: '2', label: '我的部门' },
      { key: '3', label: '团队组织' }
    ];
    return tabs.map(tab => {
      const cls = classnames(styles.panelTabItem, { [styles.isActive]: this.state.currentTab === tab.key });
      return <li key={tab.key} className={cls} onClick={() => this.onTabChange(tab.key)}>{tab.label}</li>;
    });
  };

  render() {
    return (
      <div className={styles.contact_tabPanel}>
        <div className={styles.title}>通讯录</div>

        <div id="contacts-panel" className={styles.contactsPanel}>
          <ul className={styles.categoryTabs}>
            {this.renderTabItems()}
          </ul>
          <div className={styles.panelContent}>
            <Spin spinning={this.state.loading}>
              {this.state.currentTab === '3' ? (
                <DepartmentCrumb childrenDept={this.state.childrenDept} onSelect={this.onDepartmentChange} />
              ) : (
                <div className={styles.searchWrap}>
                  <Search
                    mode="icon"
                    placeholder="按姓名搜索"
                    value={this.state.searchKey}
                    onSearch={this.onSearch}
                    width="100%"
                  />
                </div>
              )}
              <ContactList>
                {this.state.list.map(item => (
                  <ContactItem
                    key={item.userid}
                    data={item}
                    onStar={this.handleStar.bind(this, item)}
                    showStar
                    dispatch={this.props.dispatch}
                  />
                ))}
              </ContactList>
              {/*{hasMore ? <div className={styles.loadMore} onClick={this.loadMore}>加载更多</div> : <div>亲,没有更多数据加载了哦</div>}*/}
            </Spin>
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
  },
  dispatch => {
    return {
      dispatch
    };
  }
)(ContactPanel);


{/*<DepartmentSelect*/}
  {/*showSearch*/}
  {/*value={this.state.searchDept}*/}
  {/*onChange={this.onDepartmentChange}*/}
  {/*style={{ width: '100%' }}*/}
{/*/>*/}
