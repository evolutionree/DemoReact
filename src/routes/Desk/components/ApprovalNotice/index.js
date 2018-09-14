/**
 * jingren
 */
import React, { PropTypes, PureComponent } from 'react';
import { Tabs, Badge } from 'antd';
import styles from './index.less';
import { Link } from 'dva/router';
import { queryNoticeList } from '../../../../services/approvalNotice';

const { TabPane } = Tabs;

const optionList = [
  { key: '1',
    name: '待处理',
    count: '8',
    data: {
      name: '发起人姓名',
      lcName: '审批流程名称',
      result: '待我审批',
      person: '当前节点人'
    }
  }, {
    key: '2',
    name: '通知消息',
    count: '233',
    data: {
      name: '发起人姓名',
      lcName: '审批流程名称',
      result: '待我审批',
      person: '当前节点人'
    }
}];

class ApprovalNotice extends PureComponent {
  static propTypes = {
    height: PropTypes.string.isRequired,
  }

  state = {
    data: null,
    tabState: '1', //tabs 状态
    title: '审批',
    more: '查看全部',
    params: {
      entityId: "00000000-0000-0000-0000-000000000001",
      isAdvanceQuery: 1,
      menuId: "cdc16143-1420-4efa-9420-c7141ee13744",
      pageIndex: 1,
      pageSize: 10,
      searchData: {},
      searchOrder: "",
      viewType: 0
    }
  }

  componentDidMount() {
    const { params } = this.state;

    this.fetchList(params);
  }

  onTabsChange = type => {
    const { params } = this.state;
    const auditstatus = (type === '-1') ? null : parseInt(type);
    const mergeParams = {
      ...params,
      searchData: {
        auditstatus
      }
    }

    this.fetchList(mergeParams);
  };

  onReadMsg = idx => {
    
  }

  fetchList = (params) => {
    this.setState({ params });

    queryNoticeList(params)
    .then(res => this.setState({ data: res.data }))
    .catch(err => console.log(err))
  }

  render() {
    const { height = 200 } = this.props;
    const { tabState, more, title, data } = this.state;

    const listDom = !!data && (
      <div className={styles.container}>
        {
          data.pagedata.map((item, index) => {
            return (
              <div className={styles.list} key={index} onClick={this.onReadMsg.bind(this,index)}>
                <Link to='/'>
                  <font></font>
                  <span>{`【${item.auditstatus_name}】`}</span>
                  <span className={styles.text}>
                    {item.data.name}发起的{item.data.lcname}，
                    {
                      item.id === '3' ? 
                      `等待${item.data.person}审批！`
                      :
                      <span className={styles.weight}>{`${item.auditstatus_name}`}！</span>
                    }
                  </span>
                </Link>
              </div>
            );
          })
        }
      </div>
    )

    const showList = (!!data) ?  listDom  :
    <div className={styles.notNewMsg}>{tabState === '1' ? '暂无新的待处理审批！' : '暂无新的审批通知！'}</div>
    ;

    return (
      <div className={styles.contains} style={{ maxHeight: height }}>
        <div className={styles.header}>
          <Tabs defaultActiveKey={tabState}
          animated
          tabBarExtraContent={<span className={styles.title}>{title}</span>}
          onTabClick={this.onTabsChange}
          >
            {
              Array.isArray(optionList) ?
                optionList.map(item => {
                  return (
                    <TabPane 
                      tab={
                        <Badge className={styles.badge} count={item.count} title={`共${item.count}条信息`}>
                          <span className={styles.tabText}>{item.name}</span>
                        </Badge>
                      }
                      key={item.key}
                    >
                      <div className={styles.warp} >
                      {showList}
                      {
                        (!!data) && data.pagedata.length >= 10 ?
                          <div className={styles.footer}>
                            <Link to='/affair-list'><span>{more}</span></Link>
                          </div>
                          : null
                      }
                      </div>
                    </TabPane>
                  )
                }) : null
            }
          </Tabs>
        </div>
      </div>
    );
  }
}

export default ApprovalNotice;
