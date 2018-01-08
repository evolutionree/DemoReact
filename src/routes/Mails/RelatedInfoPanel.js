import React, { PropTypes, Component } from 'react';
import { Tabs, Table, Dropdown, Menu, message, Spin } from 'antd';
import { connect } from 'dva';
import * as _ from 'lodash';
import classnames from 'classnames';
import TinyPager from '../../components/TinyPager';
import ImgIcon from '../../components/ImgIcon';
import Avatar from '../../components/DynamicForm/controls/Avatar';
import styles from './RelatedInfoPanel.less';
import { getGeneralProtocol } from '../../services/entcomm';
import {
  queryRelatedMails,
  queryRelatedAttachments,
  queryMailTransferRecords,
  queryMailDetail
} from '../../services/mails';
import { DynamicFormViewLight } from '../../components/DynamicForm';
import { formatFileSize, formatTime } from '../../utils';

const Column = Table.Column;

const CheckableMenu = ({ items, checkedKeys, onCheckedChange }) => {
  const itemGroups = [];
  const temp = {};
  items.forEach(item => {
    let group = temp[item.group];
    if (!temp[item.group]) {
      group = temp[item.group] = [];
      itemGroups.push(group);
    }
    group.push(item);
  });
  function onClick({ key }) {
    const [group, k] = key.split('-');
    const newCheckedKeys = [...checkedKeys];
    newCheckedKeys[group] = k;
    onCheckedChange(newCheckedKeys);
    // const newCheckedKeys = checkedKeys.filter(
    //   k => !itemGroups.some(g => g.some(i => i.key === key) && g.some(i => i.key === k))
    // );
    // newCheckedKeys.push(key);
    // onCheckedChange(newCheckedKeys);
  }
  return (
    <Menu selectable={false} onClick={onClick} className={styles.checkableMenu}>
      {itemGroups.map((itemGroup, index) => (
        <Menu.ItemGroup key={index}>
          {itemGroup.map(item => (
            <Menu.Item key={item.group + '-' + item.key} className={styles.checkableItem}>
              {checkedKeys[index] === item.key
                ? <ImgIcon name="check" />
                : (
                  <div style={{ display: 'inline-block', width: '24px' }}>&nbsp;</div>
                )}
              {item.label}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      ))}
    </Menu>
  );
};

const MetaValue = ({ children }) => (
  <span style={children ? {} : { color: '#999' }}>{children || '(空)'}</span>
);

class RelatedInfoPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { mailTypes, attachTypes } = this.getLastSettings();
    this.state = {
      currentTab: '1',
      loading: false,
      sender: null,
      custInfo: null,
      contacts: null,
      mailTypes: mailTypes || ['1', '0'],
      mailList: null,
      mailTotal: 0,
      mailPageIndex: 1,
      mailPageSize: 10,
      // mailLoading: false,
      attachTypes: attachTypes || ['1', '0'],
      attachList: null,
      attachTotal: 0,
      attachPageIndex: 1,
      attachPageSize: 10,
      // attachLoading: false,
      transferRecords: null,
      transferTotal: 0,
      transferPageIndex: 1,
      transferPageSize: 10,

      custProtocols: {}
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.mailCurrent) {
      this.resetData();
    } else if (this.props.mailCurrent !== nextProps.mailCurrent) {
      this.resetData(this.fetchRelInfo);
    }
    // if (nextProps.mailId !== this.props.mailId) {
    //   this.setState({
    //     currentTab: '2',
    //     relInfo: null,
    //     mailTypes: [],
    //     mailList: null,
    //     mailTotal: 0,
    //     mailPageIndex: 1,
    //     mailPageSize: 10,
    //     attachTypes: [],
    //     attachList: null,
    //     attachTotal: 0,
    //     attachPageIndex: 1,
    //     attachPageSize: 10,
    //     transferRecords: null
    //   }, this.refreshCurrentTab);
    // }
  }

  getLastSettings = () => {
    const settings = localStorage.getItem('uke100_mail_settings');
    return settings ? JSON.parse(settings) : {};
  };

  saveSettings = settings => {
    const lastSettings = this.getLastSettings();
    localStorage.setItem('uke100_mail_settings', JSON.stringify({ ...lastSettings, ...settings }));
  };

  resetData = callback => {
    this.setState({
      currentTab: '1',
      sender: null,
      custInfo: null,
      contacts: null,
      mailList: null,
      mailTotal: 0,
      mailPageIndex: 1,
      // mailLoading: false,
      attachList: null,
      attachTotal: 0,
      attachPageIndex: 1,
      // attachLoading: false,
      transferRecords: null,
      custProtocols: {}
    }, callback);
  };

  refreshCurrentTab = checkNeeded => {
    if (!this.props.mailCurrent) return;
    switch (this.state.currentTab) {
      case '1':
        if (checkNeeded === true && this.state.sender) return;
        return this.fetchRelInfo();
      case '2':
        if (checkNeeded === true && this.state.mailList) return;
        return this.setState({ mailPageIndex: 1 }, this.fetchMailList);
      case '3':
        if (checkNeeded === true && this.state.attachList) return;
        return this.fetchAttachList();
      case '4':
        if (checkNeeded === true && this.state.transferRecords) return;
        return this.fetchTransferRecords();
      default:
    }
  };

  fetchCustProtocol = rectype => {
    if (this.state.custProtocols[rectype]) return;
    getGeneralProtocol({ typeid: rectype, operatetype: 2 }).then(result => {
      this.setState({
        custProtocols: { ...this.state.custProtocols, [rectype]: result.data },
        loading: false
      });
    });
  };

  fetchRelInfo = () => {
    this.setState({ loading: true });
    queryMailDetail(this.props.mailCurrent.mailid).then(result => {
      const { sender, custinfo, contacts } = result.data;
      this.setState({
        sender,
        custInfo: custinfo,
        contacts,
        loading: false
      });
      if (custinfo && custinfo.length) {
        this.fetchCustProtocol(custinfo[0].rectype);
      }
    }, err => {
      this.setState({ loading: false });
      message.error('获取邮件详情失败, ' + err.message);
    });
  };

  fetchMailList = () => {
    const { mailTypes, mailPageIndex, mailPageSize } = this.state;
    const relatedMySelf = mailTypes[0];
    const relatedSendOrReceive = mailTypes[1];
    const params = {
      pageIndex: mailPageIndex,
      pageSize: mailPageSize,
      mailid: this.props.mailCurrent.mailid,
      relatedMySelf,
      relatedSendOrReceive
    };
    this.setState({ loading: true });
    queryRelatedMails(params).then(result => {
      this.setState({
        mailList: result.data.datalist,
        mailTotal: result.data.pageinfo.totalcount,
        loading: false
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取往来邮件数据失败');
    });
  };

  fetchAttachList = () => {
    const { attachTypes, attachPageIndex, attachPageSize } = this.state;
    const relatedMySelf = attachTypes[0];
    const relatedSendOrReceive = attachTypes[1];
    const params = {
      pageIndex: attachPageIndex,
      pageSize: attachPageSize,
      mailid: this.props.mailCurrent.mailid,
      relatedMySelf,
      relatedSendOrReceive
    };
    this.setState({ loading: true });
    queryRelatedAttachments(params).then(result => {
      this.setState({
        attachList: result.data.datalist,
        attachTotal: result.data.pageinfo.totalcount,
        loading: false
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取往来附件数据失败');
    });
  };

  fetchTransferRecords = () => {
    const params = {
      mailid: this.props.mailCurrent.mailid,
      pageIndex: this.state.transferPageIndex,
      pageSize: this.state.transferPageSize
    };
    this.setState({ loading: true });
    queryMailTransferRecords(params).then(result => {
      this.setState({
        transferRecords: result.data.datalist,
        transferTotal: result.data.pageinfo.totalcount,
        loading: false
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取内部分发记录失败');
    });
  };

  onTabChange = key => {
    this.setState({ currentTab: key }, () => this.refreshCurrentTab(true));
  };

  onMailTypesChange = mailTypes => {
    this.setState({ mailTypes }, () => {
      this.saveSettings({ mailTypes });
      this.refreshCurrentTab();
    });
  };

  onAttachTypesChange = attachTypes => {
    this.setState({ attachTypes }, () => {
      this.saveSettings({ attachTypes });
      this.refreshCurrentTab();
    });
  };

  renderRelatedInfo = () => {
    const { sender, custInfo, contacts } = this.state;
    if (!(sender && sender.length) && !(custInfo && custInfo.length)) {
      return <div style={{ padding: '10px 15px', color: '#999' }}>暂无数据</div>;
    }
    return (
      <div>
        {sender && sender.length > 0 && <div className={styles.infobox}>
          <div className={styles.infotitle}>发件人信息</div>
          <div className={styles.infometa}><Avatar.View value={sender[0].headicon} headShape={1} size={50} /></div>
          <div className={styles.infometa}><span>姓名：</span><MetaValue>{sender[0].recname}</MetaValue></div>
          <div className={styles.infometa}><span>电话：</span><MetaValue>{sender[0].phone}</MetaValue></div>
          <div className={styles.infometa}><span>邮箱：</span><MetaValue>{sender[0].email}</MetaValue></div>
        </div>}
        {custInfo && custInfo.length > 0 && <div className={styles.infobox}>
          <div className={styles.infotitle}>客户信息</div>
          <DynamicFormViewLight
            fields={this.state.custProtocols[custInfo[0].rectype] || []}
            value={custInfo[0]}
          />
        </div>}
        {contacts && contacts.length > 0 && <div className={styles.infobox}>
          <div className={styles.infotitle}>客户联系人信息</div>
          {contacts.map(contact => <div key={contact.recname} style={{ marginBottom: '5px' }}>
            <div className={styles.infometa}><span>姓名：</span><MetaValue>{contact.recname}</MetaValue></div>
            <div className={styles.infometa}><span>电话：</span><MetaValue>{contact.mobilephone}</MetaValue></div>
            <div className={styles.infometa}><span>邮箱：</span><MetaValue>{contact.email}</MetaValue></div>
          </div>)}
        </div>}
      </div>
    );
  };

  render() {
    const { mailDetailData } = this.props;
    return (
      <div className={styles.wrap} style={{ minWidth: '400px' }}>
        <Spin spinning={this.state.loading}>
          <Tabs
            animated={false}
            activeKey={this.state.currentTab}
            tabPosition="bottom"
            size="small"
            onChange={this.onTabChange}
            tabBarStyle={{ background: '#f1f1f1' }}
          >
            <Tabs.TabPane tab="联系人" key="1">
              <div className={styles.header}>
                <span>邮件联系人信息</span>
              </div>
              <div className={styles.content}>
                {this.renderRelatedInfo()}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="往来邮件" key="2">
              <div className={styles.header}>
                <span>往来邮件</span>
                <div className={styles.actions}>
                  <ImgIcon name="refresh" onClick={this.refreshCurrentTab} />
                  <Dropdown
                    trigger={['click']}
                    overlay={(
                      <CheckableMenu
                        items={[
                          { key: '0', group: 0, label: '仅查看与自己的往来邮件' },
                          { key: '1', group: 0, label: '查看与所有用户的往来邮件' },
                          { key: '0', group: 1, label: '查看所有收到与发出的邮件' },
                          { key: '1', group: 1, label: '查看收到的邮件' },
                          { key: '2', group: 1, label: '查看发出的邮件' }
                        ]}
                        checkedKeys={this.state.mailTypes}
                        onCheckedChange={this.onMailTypesChange}
                      />
                    )}
                  >
                    <ImgIcon name="arrow-down" />
                  </Dropdown>
                </div>
              </div>
              <div className={styles.content}>
                <Table
                  size="middle"
                  bordered={false}
                  rowKey="mailid"
                  dataSource={this.state.mailList || []}
                  pagination={false}
                  rowClassName={record => classnames({
                    [styles.selectedrow]: !!(mailDetailData && mailDetailData.mailId === record.mailid),
                    [styles.readrow]: !!record.isread
                  })}
                  onRowClick={this.props.preview}
                  onRowDoubleClick={this.props.showMailDetail}
                >
                  <Column
                    title={<ImgIcon marginLess name="mail" />}
                    dataIndex="isread"
                    render={val => <ImgIcon marginLess name={val ? 'mail-read' : 'mail-new'} />}
                    width={34}
                  />
                  <Column title="主题" dataIndex="title" />
                  <Column title="日期" dataIndex="senttime" render={(val, record) => formatTime(record.receivedtime) || formatTime(record.senttime)} />
                </Table>
                <TinyPager
                  noText
                  style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
                  current={this.state.mailPageIndex}
                  pageSize={this.state.mailPageSize}
                  total={this.state.mailTotal}
                  onChange={pageIndex => this.setState({ mailPageIndex: pageIndex }, this.fetchMailList)}
                  onPageSizeChange={pageSize => this.setState({ mailPageIndex: 1, mailPageSize: pageSize }, this.fetchMailList)}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="往来附件" key="3">
              <div className={styles.header}>
                <span>往来附件</span>
                <div className={styles.actions}>
                  <ImgIcon name="refresh" onClick={this.refreshCurrentTab} />
                  <Dropdown
                    trigger={['click']}
                    overlay={(
                      <CheckableMenu
                        items={[
                          { key: '0', group: 0, label: '当前邮件的附件' },
                          { key: '1', group: 0, label: '仅查看与自己的往来附件' },
                          { key: '2', group: 0, label: '查看与所有用户的往来附件' },
                          { key: '0', group: 1, label: '查看所有收到与发出的附件' },
                          { key: '1', group: 1, label: '查看收到的附件' },
                          { key: '2', group: 1, label: '查看发出的附件' }
                        ]}
                        checkedKeys={this.state.attachTypes}
                        onCheckedChange={this.onAttachTypesChange}
                      />
                    )}
                  >
                    <ImgIcon name="arrow-down" />
                  </Dropdown>
                </div>
              </div>
              <div className={styles.content}>
                <Table
                  size="middle"
                  bordered={false}
                  rowKey="mongoid"
                  dataSource={this.state.attachList || []}
                  pagination={false}
                >
                  <Column title="附件名" dataIndex="filename" render={val => (
                    <span title={val} style={{ display: 'block', maxWidth: '108px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                  )} />
                  <Column width={95} title="大小" dataIndex="filesize" render={val => {
                    const style = { width: '75', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
                    return <div style={style}>{formatFileSize(val)}</div>;
                  }} />
                  <Column width={100} title="日期" dataIndex="receivedtime" render={(val, record) => {
                    const style = { width: '80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
                    return <div style={style}>{formatTime(record.receivedtime) || formatTime(record.senttime)}</div>;
                  }} />
                  <Column width={76} title="操作" dataIndex="mongoid" render={mongoid => (
                    <a style={{ width: '50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} href={`/api/fileservice/download?fileid=${mongoid}`} download>下载</a>
                  )} />
                </Table>
                <TinyPager
                  noText
                  style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
                  current={this.state.attachPageIndex}
                  pageSize={this.state.attachPageSize}
                  total={this.state.attachTotal}
                  onChange={pageIndex => this.setState({ attachPageIndex: pageIndex }, this.fetchAttachList)}
                  onPageSizeChange={pageSize => this.setState({ attachPageIndex: 1, attachPageSize: pageSize }, this.fetchAttachList)}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="内部分发" key="4">
              <div className={styles.header}>
                <span>内部分发记录</span>
              </div>
              <div className={styles.content}>
                <Table
                  size="middle"
                  bordered={false}
                  rowKey="mailid"
                  dataSource={this.state.transferRecords || []}
                  pagination={false}
                >
                  <Column title="工号" dataIndex="userid" />
                  <Column title="接收人" dataIndex="username" />
                  <Column title="转发来源" dataIndex="fromuser" />
                  <Column title="日期" dataIndex="transfertime" render={formatTime} />
                </Table>
                <TinyPager
                  noText
                  style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
                  current={this.state.transferPageIndex}
                  pageSize={this.state.transferPageSize}
                  total={this.state.transferTotal}
                  onChange={pageIndex => this.setState({ transferPageIndex: pageIndex }, this.fetchTransferRecords)}
                  onPageSizeChange={pageSize => this.setState({ transferPageIndex: 1, transferPageSize: pageSize }, this.fetchTransferRecords)}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      preview(mail) {
        dispatch({ type: 'mails/mailPreview__', payload: mail });
      },
      showMailDetail(mail) {
        dispatch({ type: 'mails/showMailDetail', payload: mail });
      }
    };
  }
)(RelatedInfoPanel);

