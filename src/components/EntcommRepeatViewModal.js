import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin } from 'antd';
import { queryMobFieldVisible } from '../services/entity';
import { getListData } from '../services/entcomm';
import Search from '../components/Search';
import Toolbar from '../components/Toolbar';
import DynamicTable from '../components/DynamicTable';

class EntcommRepeatViewModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired
  };
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      showFormModal: false,
      protocol: [],
      list: [],
      keyword: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.setState({
        showFormModal: true
      });
      this.fetchProtocol();
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      showFormModal: false,
      protocol: [],
      list: [],
      keyword: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      loading: false
    });
  };

  fetchProtocol = () => {
    queryMobFieldVisible(this.props.entityId).then(result => {
      this.setState({ protocol: result.data.fieldvisible });
    });
  }

  queryData = () => {
    if (this.state.keyword) {
      this.setState({
        loading: true
      })
      getListData({
        viewType: 0,
        searchOrder: '',
        entityId: this.props.entityId,
        pageIndex: this.state.pageIndex,
        pageSize: this.state.pageSize,
        menuId: '',
        isAdvanceQuery: 0,
        NeedPower: 0,
        SearchData: {
          [this.props.simpleSearchKey] : this.state.keyword
        }
      }).then(result => {
        this.setState({
          loading: false,
          list: result.data.pagedata,
          total: result.data.pagecount[0].total
        });
      }).catch(e => {
        console.error(e.message);
        message.error(e.message);
        this.setState({
          loading: false
        });
      });
    }
  }

  onFormModalCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  onSearch = (keyword) => {
    this.setState({
      keyword
    }, () => {
      this.queryData();
    });
  }

  handleTableChange = (pagination) => {
    this.setState({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize
    }, () => {
      this.queryData();
    });
  }

  render() {
    const {
      showFormModal,
      loading
    } = this.state;

    return (
      <Modal
        title="查重"
        visible={showFormModal}
        onCancel={this.onFormModalCancel}
        footer={null}
        width={860}
      >
        <Toolbar>
          <Search
            width="220px"
            value={this.state.keyword}
            onSearch={this.onSearch}
            placeholder="请输入关键字"
          >
            搜索
          </Search>
        </Toolbar>
        <Spin spinning={loading}>
          <DynamicTable
            ignoreRecName
            protocol={this.state.protocol}
            rowKey="recid"
            dataSource={this.state.list}
            pagination={{
              total: this.state.total,
              pageSize: this.state.pageSize,
              current: this.state.pageIndex
            }}
            onChange={this.handleTableChange}
            fixedHeader={false}
            fetchCustomHeader={false}
          />
        </Spin>
      </Modal>
    );
  }
}

export default EntcommRepeatViewModal;
