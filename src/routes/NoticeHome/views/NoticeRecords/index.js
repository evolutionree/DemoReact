import React, { PropTypes, Component } from 'react';
import { Select, Button, Table, message, Spin, Input } from 'antd';
import Search from '../../../../components/Search';
import Page from '../../../../components/Page';
import Toolbar from '../../../../components/Toolbar';
import DepartmentSelect from '../../../../components/DepartmentSelect';
import styles from './styles.less';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { queryNoticeSendRecord } from '../../../../services/notice';

const Option = Select.Option;
const Column = Table.Column;

class NoticeRecords extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      list: [],
      total: undefined,
      loading: false,
      errMsg: '',
      noticeid: props.params.id,
      queries: this.getQueries()
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillReceiveProps(nextProps) {
    // debugger;
    const queries = this.getQueries(nextProps);
    this.setState({ queries });
    this.fetchList(queries);
  }

  getQueries = (props) => {
    const { query } = (props || this.props).location;
    const { id: noticeid } = (props || this.props).params;
    return {
      noticeid,
      pageIndex: 1,
      pageSize: 10,
      readflag: -1,
      keyword: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      ...query
    };
  };

  search = (key, value) => {
    const { pathname, query } = this.props.location;
    this.props.dispatch(routerRedux.push({
      pathname,
      query: {
        ...query,
        pageIndex: 1,
        [key]: value
      }
    }));
  };

  fetchList = (params) => {
    const data = params || this.state.queries;
    if (data.pageIndex) data.pageIndex = +data.pageIndex;
    if (data.readflag) data.readflag = +data.readflag;
    this.setState({ loading: true });
    queryNoticeSendRecord(data)
      .then(result => {
        const { pagecount, pagedata } = result.data;
        this.setState({
          list: pagedata,
          total: pagecount[0].total,
          loading: false
        });
      })
      .catch(e => {
        this.setState({
          errMsg: e.message || '获取列表失败',
          loading: false
        });
      });
  };

  render() {
    const { list, queries, total, loading } = this.state;
    return (
      <div >
        <Toolbar>
          <Select
            style={{ width: 120 }}
            value={queries.readflag + ''}
            onChange={this.search.bind(this, 'readflag')}
          >
            <Option value="-1">全部</Option>
            <Option value="0">未读</Option>
            <Option value="1">已读</Option>
          </Select>
          <DepartmentSelect
            width="200px"
            value={queries.deptId}
            onChange={this.search.bind(this, 'deptId')}
          />
          <Toolbar.Right>
            <Search
              placeholder="请输入姓名或者账号搜索"
              value={queries.keyword}
              onSearch={this.search.bind(this, 'keyword')}
            />
          </Toolbar.Right>
        </Toolbar>
        <Spin spinning={loading}>
          <Table
            rowkey="attendid"
            dataSource={list}
            pagination={{
              total,
              current: +queries.pageIndex,
              pageSize: +queries.pageSize,
              onChange: this.search.bind(this, 'pageIndex'),
              onShowSizeChange: (page, size) => {
                this.search('pageSize', size);
              }
            }}
          >

            <Column title="接收人" dataIndex="receivername" key="receivername" />
            <Column title="接收人账号" dataIndex="receiveraccname" key="receiveraccname" />
            <Column title="团队" dataIndex="deptname" key="deptname" />
            <Column
              title="状态"
              dataIndex="readstatus"
              key="readstatus"
            />
            <Column title="发送时间" dataIndex="sendtime" key="sendtime" />
            <Column title="发送人" dataIndex="sendname" key="sendname" />
            <Column title="发送人账号" dataIndex="sendaccname" key="sendaccname" />
          </Table>
        </Spin>
      </div>
    );
  }
}

export default connect()(NoticeRecords);
