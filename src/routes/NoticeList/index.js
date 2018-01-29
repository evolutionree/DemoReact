import React from 'react';
import { connect } from 'dva';
import { Table, Select, Button, Menu, Dropdown, Icon, Modal, message, Spin } from 'antd';
import { routerRedux, Link } from 'dva/router';
import _ from 'lodash';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import NoticeFormModal from './NoticeFormModal';
import NoticeSendModal from './NoticeSendModal';

import { queryNoticeList, delNotice } from '../../services/notice';

const Option = Select.Option;
const Column = Table.Column;

class NoticeList extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    checkFunc: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      list: [],
      total: undefined,
      loading: false,
      errMsg: '',
      queries: this.getQueries(),
      showModals: '',
      currentRecords: []
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

  handleAdd = () => {
    this.setState({ showModals: 'add' });
  };

  handleSend = record => {
    this.setState({ showModals: 'send' });
  };

  handleEdit = () => {
    this.setState({ showModals: 'edit' });
  };

  handleDel = () => {
    Modal.confirm({
      title: '您确定删除选中记录吗？',
      onOk: () => {
        const ids = this.state.currentRecords.map(item => item.noticeid).join(',');
        delNotice(ids).then(result => {
          this.search('pageIndex', this.state.queries.pageIndex);
        }).catch(e => {
          message.error(e.message || '删除失败');
        });
      }
    });
  };

  hideModals = () => {
    this.setState({ showModals: '' });
  };

  clearSelection = () => {
    this.setState({ currentRecords: [] });
  };

  handlePostDone = () => {
    this.clearSelection();
    if (/edit|send/.test(this.state.showModals)) {
      this.search('pageIndex', this.state.queries.pageIndex);
    } else {
      this.search({
        ...this.getDefaultQueries(),
        pageSize: this.state.queries.pageSize
      });
    }
    this.hideModals();
  };

  getDefaultQueries = () => {
    return {
      pageIndex: 1,
      pageSize: 10,
      noticeType: 0,
      noticeSendStatus: -1,
      keyword: ''
    };
  };

  getQueries = (props) => {
    const { query } = (props || this.props).location;
    return {
      ...this.getDefaultQueries(),
      ...query
    };
  };

  search = (key, value) => {
    const { pathname, query } = this.props.location;
    if (typeof key === 'string') {
      this.props.dispatch(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          [key]: value
        }
      }));
    } else if (typeof key === 'object') {
      this.props.dispatch(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          ...key
        }
      }));
    }
  };

  fetchList = (params) => {
    this.setState({ loading: true });
    queryNoticeList(params || this.state.queries)
      .then(result => {
        const { pagecount, pagedata } = result.data;
        this.setState({
          list: pagedata,
          total: pagecount[0].total,
          loading: false,
          currentRecords: []
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
    if (!value) return null;
    const fileId = value;
    const imageUrl = `/api/fileservice/read?fileid=${fileId}`;
    return (
      <img
        style={{ width: 30, height: 30 }}
        src={`/api/fileservice/read?fileid=${fileId}&filetype=1&thumbmodel=0&imagewidth=30&imageheight=30`}
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
    const { list, queries, total, showModals, currentRecords, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <Page title="公告通知">
          <Toolbar
            selectedCount={currentRecords.length}
            actions={[
              { label: '编辑', handler: this.handleEdit,
                show: () => (currentRecords.length === 1 && currentRecords[0].sendstatus === '待发送' && this.props.checkFunc('NoticeEdit')) },
              { label: '发送', handler: this.handleSend, show: this.props.checkFunc('NoticePublish') },
              { label: '删除', handler: this.handleDel, show: this.props.checkFunc('NoticeDelete') }
            ]}
          >
            <Select
              style={{ width: 120 }}
              value={queries.noticeSendStatus + ''}
              onChange={this.search.bind(this, 'noticeSendStatus')}
            >
              <Option value="-1">全部公告</Option>
              <Option value="0">待发送</Option>
              <Option value="1">已发送</Option>
            </Select>
            {this.props.checkFunc('NoticeAdd') && <Button onClick={this.handleAdd}>新增</Button>}
            <Toolbar.Right>
              <Search
                placeholder="输入标题搜索"
                value={queries.keyword}
                onSearch={this.search.bind(this, 'keyword')}
              />
            </Toolbar.Right>
          </Toolbar>
          <Table
            rowKey="noticeid"
            dataSource={list}
            rowSelection={{
              selectedRowKeys: currentRecords.map(item => item.noticeid),
              onChange: (keys, items) => { this.setState({ currentRecords: items }); }
            }}
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
            <Column
              title="标题"
              dataIndex="noticetitle"
              key="noticetitle"
              render={(text, record) => <Link to={`/notice/${record.noticeid}/${record.noticetitle}`}>{text}</Link>}
            />
            <Column title="摘要" dataIndex="headremark" key="headremark" />
            <Column title="封面" dataIndex="headimg" key="headimg" render={this.renderPhoto} />
            <Column title="发送状态" dataIndex="sendstatus" key="sendstatus" />
            <Column title="创建人" dataIndex="creator" key="creator" />
            <Column title="最后活动时间" dataIndex="onlivetime" key="onlivetime" />
          </Table>
          <NoticeFormModal
            visible={/edit|add/.test(showModals)}
            currentRecord={/edit/.test(showModals) ? currentRecords[0] : null}
            onCancel={this.hideModals}
            onDone={this.handlePostDone.bind(this)}
          />
          <NoticeSendModal
            visible={/send/.test(showModals)}
            currentRecords={currentRecords}
            onCancel={this.hideModals}
            onDone={this.handlePostDone}
          />
        </Page>
      </Spin>
    );
  }
}

export default connect()(NoticeList);
