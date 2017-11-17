import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Select, DatePicker } from 'antd';
import { routerRedux } from 'dva/router';
import DepartmentSelect from '../../components/DepartmentSelect';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import { queryAttendanceList } from '../../services/attendance';
import { getCurrentMonthFirstDay, getCurrentDay } from '../../utils';

const Option = Select.Option;
const Column = Table.Column;

class AttendanceList extends React.Component {
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
      type: 2,
      searchName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      startDate: getCurrentMonthFirstDay(),
      endDate: getCurrentDay(),
      ...query,
      listType: -1,
      monthType: -1
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
    queryAttendanceList(params || this.state.queries)
      .then(result => {
        const { page, data } = result.data;
        this.setState({
          list: data,
          total: page[0].total,
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

  renderPhoto = (value, record) => {
    const fileId = value;
    const imageUrl = `/api/fileservice/read?fileid=${fileId}`;
    return (
      <img
        style={{ width: 30, height: 30 }}
        src={`/api/fileservice/read?fileid=${fileId}&thumbmodel=0&imagewidth=30&imageheight=30`}
        alt=""
        onClick={() => {
          this.props.dispatch({ type: 'app/viewImages', payload: [{ src: imageUrl }] });
        }}
      />
    );
  };

  renderLocation = (location, record) => {
    const mapLocation = location;
    return (
      <a
        onClick={() => { this.props.dispatch({ type: 'app/viewMapLocation', payload: mapLocation }); }}
        href="javascript:;"
      >
        {location.address}
      </a>
    );
  };

  render() {
    const { list, queries, total } = this.state;
    return (
      <Page title="考勤明细表">
        <Toolbar>
          <Select
            style={{ width: 120 }}
            value={queries.type + ''}
            onChange={this.search.bind(this, 'type')}
          >
            <Option value="2">全部</Option>
            <Option value="0">上班</Option>
            <Option value="1">下班</Option>
          </Select>
          <DepartmentSelect
            width="200px"
            value={queries.deptId}
            onChange={this.search.bind(this, 'deptId')}
          />
          <span>提交时间</span>
          <DatePicker
            style={{ marginLeft: '5px' }}
            placeholder="开始日期"
            value={queries.startDate ? moment(queries.startDate, 'YYYY-MM-DD') : undefined}
            onChange={(date, dateStr) => {
              this.search('startDate', date ? moment(date).format('YYYY-MM-DD') : '');
            }}
          />
          <DatePicker
            style={{ marginLeft: '5px' }}
            placeholder="结束日期"
            value={queries.endDate ? moment(queries.endDate, 'YYYY-MM-DD') : undefined}
            onChange={(date, dateStr) => {
              this.search('endDate', date ? moment(date).format('YYYY-MM-DD') : '' );
            }}
          />
          <Toolbar.Right>
            <Search
              placeholder="请输入姓名搜索"
              value={queries.searchName}
              onSearch={this.search.bind(this, 'searchName')}
            />
          </Toolbar.Right>
        </Toolbar>
        <Table
          rowKey="attendid"
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
          <Column title="账号" dataIndex="accountname" key="accountname" />
          <Column title="姓名" dataIndex="username" key="username" />
          <Column title="团队" dataIndex="deptname" key="deptname" />
          <Column title="打卡时间" dataIndex="reccreated" key="reccreated" />
          <Column title="类型" dataIndex="signtype" key="signtype" render={v => ['上班', '下班'][v]} />
          <Column title="拍照" dataIndex="signimg" key="signimg" render={this.renderPhoto} />
          <Column title="定位" dataIndex="locations" key="locations" render={this.renderLocation} />
          <Column title="备注" dataIndex="signmark" key="signmark" />
        </Table>
      </Page>
    );
  }
}

export default connect()(AttendanceList);
