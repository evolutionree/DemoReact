import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Select, DatePicker, Button } from 'antd';
import { routerRedux } from 'dva/router';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DepartmentSelect from '../../components/DepartmentSelect';
import { queryRecordList } from '../../services/operateLog';
import { downloadFile } from '../../utils/ukUtil';

const Option = Select.Option;
const Column = Table.Column;
const RangePicker = DatePicker.RangePicker;

class OperateLog extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    currentUser: React.PropTypes.number
  };
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      list: [],
      total: undefined,
      loading: false,
      errMsg: '',
      queries: this.getQueries()
    };
  }

  componentWillMount() {
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
    return {
      pageIndex: 1,
      pageSize: 10,
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      searchBegin: '',
      searchEnd: '',
      userName: '',
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
    this.setState({ loading: true });
    queryRecordList(params || this.state.queries)
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

  exportData = () => {
    const { queries } = this.state;
    const params = JSON.stringify(_.mapValues({
      ...queries,
      pageIndex: 1,
      pageSize: 65535
    }, val => val + ''));
    downloadFile(`/api/excel/exportdata?TemplateType=0&FuncName=operatelog_export&QueryParameters=${params}&UserId=${this.props.currentUser}`);
  }

  render() {
    const { list, queries, total } = this.state;
    return (
      <Page title="操作日志">
        <Toolbar>
          <DepartmentSelect
            width="200px"
            value={queries.deptId}
            dropdownMatchSelectWidth={false}
            onChange={this.search.bind(this, 'deptId')}
          />
          <DatePicker
            placeholder="开始日期"
            value={queries.searchBegin ? moment(queries.searchBegin, 'YYYY-MM-DD') : undefined}
            onChange={(date, dateStr) => {
              this.search('searchBegin', date ? moment(date).format('YYYY-MM-DD') : '');
            }}
          />
          <DatePicker
            placeholder="结束日期"
            value={queries.searchEnd ? moment(queries.searchEnd, 'YYYY-MM-DD') : undefined}
            onChange={(date, dateStr) => {
              this.search('searchEnd', date ? moment(date).format('YYYY-MM-DD') : '');
            }}
          />
          <Button onClick={this.exportData.bind(this)}>导出</Button>
          <Toolbar.Right>
            <Search
              placeholder="输入用户名称搜索"
              value={queries.userName}
              onSearch={this.search.bind(this, 'userName')}
            />
          </Toolbar.Right>
        </Toolbar>
        <Table
          rowkey="logid"
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
          <Column title="姓名" dataIndex="username" key="username" />
          <Column title="操作" dataIndex="logmsg" key="logmsg" />
          <Column title="时间" dataIndex="reccreated" key="reccreated" />
          <Column title="部门" dataIndex="deptname" key="deptname" />
          <Column title="备注" dataIndex="sysmark" key="sysmark" />
          <Column title="设备" dataIndex="device" key="device" />
          <Column title="客户端" dataIndex="vernum" key="vernum" />
        </Table>
      </Page>
    );
  }
}

export default connect(
  state => {
    return {
      currentUser: state.app.user.userid
    };
}
)(OperateLog);
