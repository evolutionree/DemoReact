import React, { Component } from 'react';
import { Collapse, Spin, Button, message, Popconfirm } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import { __list, columns1, columns2, columns3, columns4, columns5 } from './common';
import BusinessInfo from './BusinessInfo';
import ConfigTable from '../../../../components/ConfigTable';
import styles from './index.less';

const { Panel } = Collapse;

// key 对应接口方法名称
const _collapseList = [
  { key: 'getbusinessdetail', title: '工商照面信息', type: 'list', params: {}, data: [] },
  { key: 'getyearreport', title: '企业工商年报', type: 'table', columns: columns1, data: [] },
  { key: 'getlawsuit', title: '企业裁判文书列表', type: 'table', columns: columns2, data: [] },
  { key: 'getcasedetail', title: '企业立案信息', type: 'table', columns: columns3, data: [] },
  { key: 'getcourtnotice', title: '企业法院公告信息', type: 'table', columns: columns4, data: [] },
  { key: 'getbreakpromise', title: '企业失信信息', type: 'table', columns: columns5, data: [] }
];

class CommerceQueries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseList: _collapseList,
      defaultActiveKey: _collapseList.map(o => o.key),
      loading: false,
      updateLoading: false
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const { titleText } = this.props;
    const { collapseList } = this.state;
    const params = { companyname: '小米科技有限责任公司' };
    const apiList = collapseList.map(o => ({ api: `/api/dockingapi/${o.key}`, params: { ...o.params, ...params } }));
    const newList = [...collapseList];

    this.setState({ loading: true });

    const dataArr = await Promise.all(apiList.map(async (o) => {
      return dynamicRequest(o.api, o.params).then(res => res.data).catch(e => {
        console.error(`fetch ${o.api} throw：${e.message}`);
        this.setState({ loading: false });
      });
    }));

    // console.log(dataArr);
    dataArr.forEach((data, index) => {
      if (index === 0) {
        newList[index].data = data;
      } else if (Array.isArray(data.items) && data.items.length) {
        newList[index].data = data.items;
      } else {
        (index !== 0 && !data.items) && (newList[index].type = '');
      }
    });
    this.setState({ collapseList: newList, loading: false });
  }

  updateData = async () => {
    this.setState({ updateLoading: true });

    const res = await dynamicRequest('', {}).catch(e => {
      console.error(e.message);
      message.error(e.message);
      this.setState({ updateLoading: false });
    });
    this.setState({ updateLoading: false });
    if (res.error_code === 0) this.init();
  }

  renderChildren = (record) => {
    const { titleText } = this.props;

    switch (record.type) {
      case 'list':
        const businessList = __list.map(item => ({
          ...item,
          content: (record.data && record.data[item.key]) || '(空)'
        }));
        return <BusinessInfo list={businessList} />;
      case 'table':
        return <ConfigTable rowKey="key" dataSource={record.data} columns={record.columns} />;
      default:
        return <div>接口又没钱啦</div>;
    }
  }

  render() {
    const { collapseList, defaultActiveKey, loading, updateLoading } = this.state;

    return (
      <div>
        <div>
          <span style={{ marginRight: 10 }}>当前数据更新于： 2050年xxxxxx</span>
          <Popconfirm
            title="确定更新数据?"
            onConfirm={this.updateData}
          >
            <Button type="primary" loading={updateLoading}>同步最新数据</Button>
          </Popconfirm>
        </div>
        <Spin spinning={loading}>
          <Collapse defaultActiveKey={defaultActiveKey} bordered={false} style={{ height: document.body.clientHeight - 246, overflowY: 'auto' }}>
            {
              collapseList.map(item => {
                return (
                  <Panel key={item.key} header={item.title}>
                    {this.renderChildren(item)}
                  </Panel>
                );
              })
            }
          </Collapse>
        </Spin>
      </div>

    );
  }
}

export default CommerceQueries;
