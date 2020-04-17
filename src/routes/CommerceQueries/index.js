import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Table, message, Row, Col } from 'antd';
import Page from '../../components/Page';
import { dynamicRequest } from '../../services/common';

const { Panel } = Collapse;
const COMMERCEQUERIES = 'commercequeries';

// key 对应接口方法名称
const _collapseList = [
  { title: '工商照面信息', key: 'getbusinesslist', type: 'list', params: { skipnum: 999 }, data: [] },
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
      defaultActiveKey: _collapseList.map(o => o.key)
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const { collapseList } = this.state;
    const params = { companyname: '盘锦市中心医院' };
    const apiList = collapseList.map(o => ({ api: `/api/dockingapi/${o.key}`, params: { ...o.params, ...params } }));
    const newList = [...collapseList];

    const dataArr = await Promise.all(apiList.map(async (o) => {
      return dynamicRequest(o.api, o.params).then(res => res.data).catch(e => console.error(`fetch ${o.api} throw：${e.message}`));
    }));
    console.log(dataArr);
    dataArr.forEach((data, index) => {
      if (Array.isArray(data.items) && data.items.length) {
        newList[index].data = data.items;
      } else {
        newList[index].type = '';
      }
    });
    this.setState({ collapseList: newList });
  }

  renderChildren = (record) => {
    switch (record.type) {
      case 'list':
        const list = [];
        return (
          <Row>
            {list.map(item => (
              <Col span={item.span}>
                <div>{item.title}</div>
                <div>{item.content}</div>
              </Col>
            ))}
          </Row>
        );
      case 'table':
        const columns = [];
        const dataSource = [];
        return <Table dataSource={dataSource} columns={columns} />;
      default:
        return <div>（空）</div>;
    }
  }

  render() {
    const { collapseList, defaultActiveKey } = this.state;

    return (
      <div>
        <Collapse defaultActiveKey={defaultActiveKey}>
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
      </div>
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
