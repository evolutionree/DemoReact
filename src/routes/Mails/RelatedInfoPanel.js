import React, { PropTypes, Component } from 'react';
import { Tabs, Table, Dropdown, Menu } from 'antd';
import { connect } from 'dva';
import * as _ from 'lodash';
import classnames from 'classnames';
import TinyPager from '../../components/TinyPager';
import ImgIcon from '../../components/ImgIcon';
import Avatar from '../../components/Avatar';
import styles from './RelatedInfoPanel.less';
import { getGeneralProtocol } from '../../services/entcomm';
import { DynamicFormViewLight } from '../../components/DynamicForm';

const Column = Table.Column;

const RelInfoMock = {
  a: 'b'
};

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
    const newCheckedKeys = checkedKeys.filter(
      k => !itemGroups.some(g => g.some(i => i.key === key) && g.some(i => i.key === k))
    );
    newCheckedKeys.push(key);
    onCheckedChange(newCheckedKeys);
  }
  return (
    <Menu selectable={false} onClick={onClick} className={styles.checkableMenu}>
      {itemGroups.map((itemGroup, index) => (
        <Menu.ItemGroup key={index}>
          {itemGroup.map(item => (
            <Menu.Item key={item.key} className={styles.checkableItem}>
              {checkedKeys.indexOf(item.key) !== -1
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

class RelatedInfoPanel extends Component {
  static propTypes = {
    mailId: PropTypes.string,
    narrow: PropTypes.bool,
    settings: PropTypes.shape({
      mailTypes: PropTypes.array,
      attachTypes: PropTypes.array
    })
  };
  static defaultProps = {
    narrow: false,
    settings: {}
  };

  constructor(props) {
    super(props);
    const { mailTypes, attachTypes } = this.getLastSettings();
    this.state = {
      currentTab: '1',
      relInfo: null,
      mailTypes: mailTypes || [],
      mailList: null,
      mailTotal: 0,
      mailPageIndex: 1,
      mailPageSize: 10,
      attachTypes: attachTypes || [],
      attachList: null,
      attachTotal: 0,
      attachPageIndex: 1,
      attachPageSize: 10,
      transferRecords: null,

      custProtocols: {}
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const detailData = this.props.mailDetailData || {};
    const nextDetailData = nextProps.mailDetailData || {};
    if (detailData !== nextDetailData) {
      if (detailData.custinfo !== nextDetailData.custinfo && nextDetailData.custinfo && nextDetailData.custinfo.length) {
        this.fetchCustProtocol(nextDetailData.custinfo[0].rectype);
      }
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

  // resetData = callback => {
  //   this.setState({
  //     currentTab: '1',
  //     relInfo: null,
  //     mailList: [],
  //     mailTotal: 0,
  //     mailPageIndex: 1,
  //     attachList: [],
  //     attachTotal: 0,
  //     attachPageIndex: 1
  //   }, callback);
  // };

  refreshCurrentTab = checkNeeded => {
    switch (this.state.currentTab) {
      case '1':
        if (checkNeeded && this.state.relInfo) return;
        return this.fetchRelInfo();
      case '2':
        if (checkNeeded && this.state.mailList) return;
        return this.fetchMailList();
      case '3':
        if (checkNeeded && this.state.attachList) return;
        return this.fetchAttachList();
      case '4':
        if (checkNeeded && this.state.transferRecords) return;
        return this.fetchTransferRecords();
      default:
    }
  };

  fetchCustProtocol = rectype => {
    if (this.state.custProtocols[rectype]) return;
    getGeneralProtocol({ typeid: rectype, operatetype: 2 }).then(result => {
      this.setState({
        custProtocols: { ...this.state.custProtocols, [rectype]: result.data }
      });
    });
  };

  fetchRelInfo = () => {
    setTimeout(() => {
      this.setState({ relInfo: RelInfoMock });
    }, 100);
  };

  fetchMailList = (pageIndex, pageSize) => {
    setTimeout(() => {
      this.setState({ mailList: [] });
    }, 100);
  };

  fetchAttachList = (pageIndex, pageSize) => {
    setTimeout(() => {
      this.setState({ attachList: [] });
    }, 100);
  };

  fetchTransferRecords = () => {
    setTimeout(() => {
      this.setState({ transferRecords: [] });
    }, 100);
  };

  onTabChange = key => {
    this.setState({ currentTab: key }, () => this.refreshCurrentTab(true));
  };

  onMailTypesChange = mailTypes => {
    this.setState({ mailTypes }, () => this.saveSettings({ mailTypes }));
  };

  renderRelatedInfo = () => {
    const { mailDetailData } = this.props;
    if (!(mailDetailData && mailDetailData.status === 'loaded')) return null;
    const { sender, custinfo } = mailDetailData;
    return (
      <div>
        {sender && sender.length > 0 && <div className={styles.infobox}>
          <div className={styles.infotitle}>发件人信息</div>
          <div className={styles.infometa}><Avatar image={sender[0].headicon} /></div>
          <div className={styles.infometa}><span>姓名：</span><span>{sender[0].recname}</span></div>
          <div className={styles.infometa}><span>电话：</span><span>{sender[0].phone}</span></div>
          <div className={styles.infometa}><span>邮箱：</span><span>{sender[0].email}</span></div>
        </div>}
        {custinfo && custinfo.length > 0 && <div className={styles.infobox}>
          <div className={styles.infotitle}>客户信息</div>
          <DynamicFormViewLight
            fields={this.state.custProtocols[mailDetailData.custinfo[0].rectype] || []}
            value={custinfo[0]}
          />
        </div>}
      </div>
    );
  };

  render() {
    return (
      <div className={styles.wrap} style={{ minWidth: '300px' }}>
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
                <ImgIcon name="refresh" />
                <Dropdown overlay={(
                  <CheckableMenu
                    items={[
                      { key: '0', group: 1, label: '仅查看与自己的往来邮件' },
                      { key: '1', group: 1, label: '查看与所有用户的往来邮件' },
                      { key: '2', group: 2, label: '查看所有收到与发出的邮件' },
                      { key: '3', group: 2, label: '查看收到的邮件' },
                      { key: '4', group: 2, label: '查看发出的邮件' }
                    ]}
                    checkedKeys={this.state.mailTypes}
                    onCheckedChange={this.onMailTypesChange}
                  />
                )}>
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
                onRowClick={record => this.props.dispatch({ type: 'mails/mailPreview__', payload: record })}
                onRowDoubleClick={record => this.props.dispatch({ type: 'mails/mailDetail', payload: record })}
              >
                <Column
                  title={<ImgIcon marginLess name="mail" />}
                  dataIndex="isread"
                  render={val => <ImgIcon marginLess name={val ? 'mail-read' : 'mail-new'} />}
                  width={34}
                />
                <Column title="主题" dataIndex="title" />
                <Column title="日期" dataIndex="sendtime" />
              </Table>
              <TinyPager
                noText
                showSizeChanger={!this.props.narrow}
                style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
                current={this.state.mailPageIndex}
                pageSize={this.state.mailPageSize}
                total={this.state.mailTotal}
                onChange={this.fetchMailList}
                onPageSizeChange={pageSize => this.fetchMailList({ pageIndex: 1, pageSize })}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="往来附件" key="3">
            <div className={styles.header}>
              <span>往来附件</span>
            </div>
            <div className={styles.content}>
              <Table
                size="middle"
                bordered={false}
                rowKey="recid"
                dataSource={this.state.attachList || []}
                pagination={false}
                onRowClick={record => this.props.dispatch({ type: 'mails/mailPreview__', payload: record })}
                onRowDoubleClick={record => this.props.dispatch({ type: 'mails/mailDetail', payload: record })}
              >
                <Column title="附件名" dataIndex="filename" />
                <Column title="大小" dataIndex="filesize" />
                <Column title="日期" dataIndex="sendtime" />
              </Table>
              <TinyPager
                noText
                showSizeChanger={!this.props.narrow}
                style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
                current={this.state.attachPageIndex}
                pageSize={this.state.attachPageSize}
                total={this.state.attachTotal}
                onChange={this.fetchAttachList}
                onPageSizeChange={pageSize => this.fetchAttachList({ pageIndex: 1, pageSize })}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="内部分发" key="4">
            hello
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect(
  state => state.mails
)(RelatedInfoPanel);

