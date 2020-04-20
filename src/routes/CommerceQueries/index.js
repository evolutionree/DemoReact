import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Table, message, Row, Col, Spin } from 'antd';
import { dynamicRequest } from '../../services/common';
import BusinessInfo from './BusinessInfo';
import styles from './index.less';

const { Panel } = Collapse;
const COMMERCEQUERIES = 'commercequeries';

// key 对应接口方法名称
const _collapseList = [
  { title: '工商照面信息', key: 'getbusinesslist', type: 'list', params: { skipnum: 0 }, data: [] },
  { title: '企业工商年报', key: 'getyearreport', type: 'table', data: [] },
  { title: '企业裁判文书列表', key: 'getlawsuit', type: 'table', data: [] },
  { title: '企业立案信息', key: 'getcasedetail', type: 'table', data: [] },
  { title: '企业法院公告信息', key: 'getcourtnotice', type: 'table', data: [] },
  { title: '企业失信信息', key: 'getbreakpromise', type: 'table', data: [] }
];

class CommerceQueries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseList: _collapseList,
      defaultActiveKey: _collapseList.map(o => o.key),
      loading: false
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const { collapseList } = this.state;
    const params = { companyname: '小米科技有限责任公司' };
    const apiList = collapseList.map(o => ({ api: `/api/dockingapi/${o.key}`, params: { ...o.params, ...params } }));
    const newList = [...collapseList];

    this.setState({ loading: true });

    const dataArr = await Promise.all(apiList.map(async (o) => {
      return dynamicRequest(o.api, o.params).then(res => res.data).catch(e => console.error(`fetch ${o.api} throw：${e.message}`));
    }));

    console.log(dataArr);
    dataArr.forEach((data, index) => {
      if (Array.isArray(data.items) && data.items.length) {
        newList[index].data = data.items;
      } else {
        (index !== 0) && (newList[index].type = '');
      }
    });
    this.setState({ collapseList: newList, loading: false });
  }

  renderChildren = (record) => {
    switch (record.type) {
      case 'list':
        const list = [
          { title: '统一社会信用代码', content: '', span: 14 },
          { title: '组织机构代码', content: '', span: 10 },
          { title: '注册号', content: '', span: 14 },
          { title: '经营状态', content: '', span: 10 },
          { title: '公司类型', content: '', span: 14 },
          { title: '成立日期', content: '', span: 10 },
          { title: '法定代表人', content: '', span: 14 },
          { title: '营业期限', content: '', span: 10 },
          { title: '注册资本', content: '', span: 14 },
          { title: '发照日期', content: '', span: 10 },
          { title: '挂牌日期', content: '', span: 14 },
          { title: '董秘电话', content: '', span: 10 },
          { title: '登记机关', content: '', span: 24 },
          { title: '注册地址', content: '', span: 24 },
          { title: '办公地址', content: '', span: 24 }
        ];
        return <BusinessInfo list={list} />;
      case 'table':
        const columns = [];
        const dataSource = [];
        return <Table dataSource={dataSource} columns={columns} />;
      default:
        return <div>（空）</div>;
    }
  }

  render() {
    const { collapseList, defaultActiveKey, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <Collapse defaultActiveKey={defaultActiveKey}>
          <a onClick={this.init}>reload</a>
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
    );
  }
}

export default connect(
  state => state[COMMERCEQUERIES],
  dispatch => {
    return {
      // init(callback) {
      //     dispatch({ type: 'affairDetail/init', payload: { callback } });
      //   },
    };
  }
)(CommerceQueries);
