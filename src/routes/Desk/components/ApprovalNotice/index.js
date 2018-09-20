/**
 * 0920
 */
import React, { PropTypes, PureComponent } from 'react';
import { Tabs, Tag, Badge, Spin, Icon, Tooltip } from 'antd';
import styles from './index.less';
import { Link } from 'dva/router';
import { queryGetunmsglist, queryGetwflist } from '../../../../services/approvalNotice';
import dayjs from 'dayjs';

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

function isStrings(str) {
  return typeof str === 'string' && str.constructor === String
}

function showTimeDiffText(timeStr) {
  const defaultTimes = '2018-09-18 15:18:49';
  const str = isStrings(timeStr) ? timeStr : defaultTimes;
  const second = dayjs().diff(dayjs(str), 'seconds');

  if(second >= 0 && second < 60) {
    return {type: 'second', value: `${second}秒前`};
  } else if (second >= 60 && second < 3600) {
    return {type: 'minute', value: `${Math.floor(second / 60)}分钟前`};
  } else if (second >= 3600 && second < 3600*24) {
    return {type: 'hour', value: `${Math.floor(second / 3600)}小时前`};
  } else if (second >= 3600*24 && second < 3600*24*30) {
    return {type: 'day', value: `${Math.floor(second / 3600 / 24)}天前`};
  } else {
    return {type: 'extra', value: defaultTimes.substring(0, 10)};
  }
}

class ApprovalNotice extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
  }

  state = {
    tabKeys: '1',
    data: null,
    params: {
      pageIndex: 1,
      pageSize: 10,
    }
  }

  setStateAsync = state => new Promise(resolve => this.setState(state, resolve));

  componentDidMount() {
    const { params } = this.state;

    this.fetchList('1', params);
  }

  onTabsChange = key => {
    const { params } = this.state;

    this.fetchList(key, params);
  };

  fetchList = (key = '1', params) => {
    switch(key) {
      case '1':
        queryGetunmsglist(params)
        .then(res => this.setState({ tabKeys: '1', data: res.data }))
        .catch(err => console.log(err))
        break
      case '2':
        queryGetwflist(params)
        .then(res => this.setState({ tabKeys: '2', data: res.data }))
        .catch(err => console.log(err))
        break
    }
  }

  renderWrapElms() {
    const { maxListLength = 10 } = this.props;
    const { tabKeys } = this.state;
    
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
          {tabKeys === '1' ? '暂无新的待处理审批！' : '暂无新的审批通知！'}
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
            {this.renderTimeTag(showTimeDiffText(item.reccreated))}
          </Tooltip>
          ，{item.msgcontent}
        </p>
      </Link>
    );
  }

  renderTimeTag(obj) {
    switch(obj.type) {
      case 'second':
        return <Tag color="red">{obj.value}</Tag>
      case 'minute':
        return <Tag color="magenta">{obj.value}</Tag>
      case 'hour':
        return <Tag color="volcano">{obj.value}</Tag>
      case 'day':
        return <Tag color="purple">{obj.value}</Tag>
      case 'extra':
        return <Tag color="green">{obj.value}</Tag>
    }
  }

  render() {
    const { height = 200, title='title', defaultKey='1' } = this.props;
    const { data } = this.state;

    if(data && optionList[0].count === 0) optionList[0].count = data.pageinfo.totalcount; //显示消息条数

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
