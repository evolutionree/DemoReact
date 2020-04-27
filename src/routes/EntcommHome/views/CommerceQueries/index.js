import React, { Component } from 'react';
import { Collapse, Spin, Button, Icon, message, Popconfirm } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import { __collapseList, __list } from './common';
import BusinessInfo from './BusinessInfo';
import ConfigTable from '../../../../components/ConfigTable';
import styles from './index.less';

const { Panel } = Collapse;
const PREAPI = '/api/dockingapi';

class CommerceQueries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseList: __collapseList,
      activeKey: __collapseList.map(o => o.key),
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

    const params = { companyname: titleText };
    const apiList = collapseList.map(o => ({ api: `${PREAPI}/${o.key}`, params: { ...o.params, ...params } }));
    const newList = [...collapseList];

    this.setState({ loading: true });

    const dataArr = await Promise.all(apiList.map(async (o) => {
      return dynamicRequest(o.api, o.params).then(res => res.data).catch(e => {
        console.error(`fetch ${o.api} throw：${e.message}`);
        if (this.state.loading) this.setState({ loading: false });
      });
    }));

    dataArr.forEach((data, index) => {
      if (data && ('items' in data)) {
        newList[index].type = 'table';
        newList[index].data = data.items;
      } else if (Object().toString.call(data) === '[object Object]') {
        newList[index].type = 'list';
        newList[index].data = data;
      } else {
        newList[index].type = '';
      }
    });
    // console.log(newList);
    this.setState({ collapseList: newList, loading: false });
  }

  updateData = async () => {
    this.setState({ updateLoading: true });

    const res = await dynamicRequest(`${PREAPI}/updatebusiinfo`, {}).catch(e => {
      console.error(e.message);
      message.error(e.message);
      this.setState({ updateLoading: false });
    });
    this.setState({ updateLoading: false });
    if (res.error_code === 0) this.init();
  }

  renderChildren = (record) => {
    switch (record.type) {
      case 'list':
        const businessList = __list.map(item => {
          const text = record.data && record.data[item.key] || '(空)';
          return { ...item, content: item.render ? item.render(text) : text };
        });
        return <BusinessInfo list={businessList} />;
      case 'table':
        return <ConfigTable rowKey={record.rowKey} dataSource={record.data} tableHeight={300} columns={record.columns} />;
      default:
        return <div style={{ textAlign: 'center' }}><Icon type="frown-o" /> 暂无数据</div>;
    }
  }

  render() {
    const { collapseList, activeKey, loading, updateLoading } = this.state;
    const updatetime = (collapseList[0].data.recupdated && collapseList[0].data.recupdated.slice(0, 19)) || '庆历四年春，滕子京谪守巴陵郡';

    return (
      <div>
        <div style={{ padding: 8, borderBottom: '1px solid #ccc' }}>
          <span style={{ marginRight: 10 }}>当前数据更新于： {updatetime}</span>
          <Popconfirm
            title="确定更新数据?"
            onConfirm={this.updateData}
          >
            <Button type="primary" loading={updateLoading}>同步最新数据</Button>
          </Popconfirm>
        </div>
        <Spin spinning={loading}>
          <Collapse defaultActiveKey={activeKey} bordered={false} style={{ height: document.body.clientHeight - 246, overflowY: 'auto' }}>
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
