/**
 * jingren
 */
import React, { PropTypes, PureComponent } from 'react';
import { Tabs, Badge, Spin, Icon, Tooltip } from 'antd';
import styles from './index.less';
import { Link } from 'dva/router';
import { queryGetunmsglist, queryGetwflist } from '../../../../services/approvalNotice';
import moment from 'moment';


const { TabPane } = Tabs;

const optionList = [
  { key: '1',
    name: '待处理',
    icon: 'schedule',
    count: 0
  }, {
    key: '2',
    name: '通知',
    icon: 'message',
    count: 0
}];

class ApprovalNotice extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
  }

  state = {
    data: null,
    params: {
      pageIndex: 1,
      pageSize: 10,
    }
  }

  componentDidMount() {
    const { params } = this.state;

    this.fetchList('1', params);
    this.fetchList('2', params);
  }

  onTabsChange = key => {
    const { params } = this.state;

    this.fetchList(key, params);
  };

  fetchList = (key = '1', params) => {
    switch(key) {
      case '1':
        queryGetunmsglist(params)
        .then(res => this.setState({ data: res.data }))
        .catch(err => console.log(err))
        break
      case '2':
        queryGetwflist(params)
        .then(res => this.setState({ data: res.data }))
        .catch(err => console.log(err))
        break
    }
  }

  renderWrapElms() {
    const { maxListLength = 10, defaultKey = '1' } = this.props;
    const { data } = this.state;
    let list = [];

    if(!!data) list = [...data.datalist];
    if(list.length >= 10) list = [...list.slice(0, 10)]; // 数据长度最大10

    // list
    const showList = list.length !== 0 ?
      (
        <div className={styles.contents}>
          {list.map((item, index) => this.renderListElms(item, index))}
        </div>
      ) :
      (
        <div className={styles.notNewMsg}>
          {defaultKey === '1' ? '暂无新的待处理审批！' : '暂无新的审批通知！'}
        </div>
      )

    return (
      <div className={styles.warp}>
        {
          !!list ? showList : <div className={styles.spins}><Spin /></div>
        }
        {
          !!list && list.length >= maxListLength ?
            <div className={styles.footer}>
              <Link to='/affair-list'><span>查看更多</span></Link>
            </div>
          : null
        }
      </div>
    )
  }

  renderListElms = (item, index) => {
    return (
      <Link className={styles.list} key={index} to={`/affair/${item.msgparam.Data.caseid}`}>
        <Badge className={styles.text} status="processing" />
        <p>
          <Tooltip title={item.reccreated}>
            【{moment(item.reccreated).fromNow()}】
          </Tooltip>
          ，{item.msgcontent}
        </p>
      </Link>
    );
  }

  render() {
    const { height = 200, title='title', defaultKey='1' } = this.props;
    const { data } = this.state;

    if(data) optionList[0].count = data.pageinfo.totalcount;

    return (
      <div className={styles.container} style={{ maxHeight: height }}>
        <div className={styles.header}>
          <Tabs defaultActiveKey={defaultKey}
            tabBarExtraContent={<span className={styles.title}>{title}</span>}
            onChange={this.onTabsChange}
          >
            {
              Array.isArray(optionList) ?
                optionList.map(item => (
                  <TabPane
                    key={item.key}
                    tab={
                      <Badge
                        className={styles.badge}
                        count={item.count}
                        title={`共${item.count}条信息`}
                      >
                        <span className={styles.tabText}><Icon type={item.icon} />{item.name}</span>
                      </Badge>
                    }
                  >
                    {this.renderWrapElms()}
                  </TabPane>
                )
              ) : null
            }
          </Tabs>
        </div>
      </div>
    );
  }
}

export default ApprovalNotice;
