import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, message, Spin, Table, Tabs } from 'antd';
import { is } from 'immutable';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import styles from './SelectProductModal.less';
import { queryMobFieldVisible } from '../../../services/entity';
import { searchproductformobile, getProductdetail } from '../../../services/products';
import ProductSerialSelect from '../../ProductSerialSelect';

const TabPane = Tabs.TabPane;

class SelectProductModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    data: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    multiple: true
  };

  serialSelectRef = null;

  constructor(props) {
    super(props);
    this.state = {
      currentSerial: '', //当前选择的系列
      productSerial: [], //所有产品系列的树 数据
      keyword: '',
      list: [],
      pageIndex: 1,
      total: 0,
      loading: false,
      columns: [], //控件列定义
      currentTabsKey: '1',
      filterKeyWord: '',
      currentSelected: [], //当前选择的数据
      selectedRows: [] //因为antd 表格前的checkbox控件选择时，第二个参数只会记录当前页的选中的值，所有需要记录所有分页的选中的数据
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.getColumns();
    }
    if (nextProps.visible) {
      this.setState({
        keyword: '',
        list: [],
        pageIndex: 1,
        total: 0,
        currentTabsKey: '1',
        filterKeyWord: ''
      }, () => {
        this.getProductSerial(nextProps);
        this.fetchProductsDetail(nextProps.value);
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  fetchProductsDetail = (productId) => {
    if (productId) {
      getProductdetail({
        recids: productId
      }).then(result => {
        const selectData = result.data.map(item => ({ ...item, productid: item.recid }));
        this.setState({
          currentSelected: selectData,
          selectedRows: selectData
        });
      }).catch(e => {
        console.error(e.message);
      });
    } else { //value为空 清空
      this.setState({
        currentSelected: [], //当前选择的数据
        selectedRows: [] //因为antd 表格前的checkbox控件选择时，第二个参数只会记录当前页的选中的值，所有需要记录所有分页的选中的数据
      });
    }
  }

  getColumns = () => {
    queryMobFieldVisible('59cf141c-4d74-44da-bca8-3ccf8582a1f2').then(result => {
      const columns = result.data.fieldvisible.map(item => {
        return {
          key: item.fieldname,
          dataIndex: item.fieldname,
          title: item.displayname
        };
      });

      this.setState({
        columns: columns
      });
    }).catch(e => {
      console.error(e.message);
    });
  }

  getProductSerial = (props) => {
    const { designateNodes, designateFilterNodes } = props;

    const includefilter = designateNodes && designateNodes.map(item => item.path).join(',');
    const excludefilter = designateFilterNodes && designateFilterNodes.join(',');
    const params = {
      istopset: -1,
      includefilter: includefilter || '',
      excludefilter: excludefilter || ''
    };
    this.setState({ loading: true });
    searchproductformobile(params).then(result => {
      const productSerial = result.data.pagedata;
      const rootNode = _.find(productSerial, ['nodepath', 0]);
      const currentSerial = rootNode && rootNode.productsetid;
      this.setState({
        productSerial: productSerial,
        currentSerial
      }, this.fetchList);
    }, e => {
      this.setState({ loading: false });
      message.error(e.message);
    });
  }

  fetchList = () => {
    const { designateNodes, designateFilterNodes } = this.props;
    const includefilter = designateNodes && designateNodes.map(item => item.path).join(',');
    const excludefilter = designateFilterNodes && designateFilterNodes.join(',');
    const params = {
      istopset: 0,
      psetid: this.state.currentSerial,
      searchKey: this.state.keyword,
      pageIndex: this.state.pageIndex,
      pagecount: 10,
      includefilter: includefilter || '',
      excludefilter: excludefilter || ''
    };
    this.setState({ loading: true });
    searchproductformobile(params).then(result => {
      this.setState({
        loading: false,
        list: result.data.pagedata.map(item => ({ ...item.productdetail, productid: item.productdetail.recid })),
        total: result.data.pagecount.total
      });
    }, e => {
      this.setState({ loading: false });
      message.error(e.message || '获取产品列表失败');
    });
  };

  onSerialChange = val => {
    this.setState({ currentSerial: val, pageIndex: 1, keyword: '' }, this.fetchList);
  };

  handleOk = () => {
    this.props.onOk(this.state.currentSelected);
  };

  onSearch = keyword => {
    if (this.state.currentTabsKey === '1') {
      this.setState({ keyword, pageIndex: 1 }, this.fetchList);
    } else {
      this.setState({
        filterKeyWord: keyword
      });
    }
  };

  tabsKeyChange = (key) => {
    this.setState({
      currentTabsKey: key
    });
  }


  handleTableChange = (pagination) => {
    this.setState({ pageIndex: pagination.current }, this.fetchList);
  }

  onSelectItems = (keys, selectedRows) => {
    const allData = _.uniqBy([...this.state.selectedRows, ...selectedRows], 'productid'); //因为selectedRows只会记录当前页选中的数据  则需存储所有选择过的数据 然后配合key选出当前所有页选中的数据
    const currentSelected = allData.filter(item => keys.indexOf(item.productid) > -1);
    this.setState({
      currentSelected: currentSelected,
      selectedRows: allData
    });
  }

  tableRowDoubleClick = (record) => {
    if (!this.props.multiple) { //单选支持 双击点击单行 确定选择
      this.props.onOk([record]);
    }
  }

  removeCurentItems = (record) => { //移除 已选列表中  的数据
    const currentSelected = this.state.currentSelected.filter(item => item.productid !== record.productid);
    this.setState({
      currentSelected: currentSelected
    });
  }

  render() {
    const { visible, onCancel, multiple, designateNodes, designateFilterNodes } = this.props;
    const { currentSelected, list } = this.state;
    const filterSelectedItems = currentSelected.filter(item => item.productname.indexOf(this.state.filterKeyWord) > -1);

    const alreadyColumns = [
      ...this.state.columns,
      {
        key: 'operate',
        dataIndex: 'operate',
        title: '操作',
        render: (text, record) => {
          return <a onClick={this.removeCurentItems.bind(this, record)}>删除</a>
        }
      }
    ];

    return (
      <Modal
        title="选择产品"
        visible={visible}
        width={700}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'selectProductModal ant-modal-custom-large' : 'selectProductModal'}
      >
        <Toolbar style={{ position: 'absolute', zIndex: 9 }}>
          {
            this.state.currentTabsKey === '1' ? <ProductSerialSelect
              width="200px"
              productSerial={this.state.productSerial}
              value={this.state.currentSerial}
              onChange={this.onSerialChange}
              designateNodes={designateNodes}
              designateFilterNodes={designateFilterNodes}
            /> : null
          }
          <Search
            width="220px"
            value={this.state.currentTabsKey === '1' ? this.state.keyword : this.state.filterKeyWord}
            onSearch={this.onSearch}
            placeholder="请输入产品名称"
          >
            搜索
          </Search>
        </Toolbar>
        <Tabs defaultActiveKey="1" onChange={this.tabsKeyChange}>
          <TabPane tab="可选" key="1">
            <Spin spinning={this.state.loading}>
              <Table columns={this.state.columns}
                     dataSource={list}
                     onRowDoubleClick={this.tableRowDoubleClick}
                     pagination={{
                       total: this.state.total,
                       pageSize: 10,
                       current: this.state.pageIndex,
                       showSizeChanger: false
                     }}
                     onChange={this.handleTableChange}
                     rowSelection={{
                       type: multiple ? 'checkbox' : 'radio',
                       selectedRowKeys: currentSelected.map(item => item.productid),
                       onChange: (keys, items) => this.onSelectItems(keys, items)
                     }}
                     rowKey="productid" />
            </Spin>
          </TabPane>
          <TabPane tab="已选" key="2">
            <Table columns={alreadyColumns}
                   dataSource={filterSelectedItems}
                   pagination={false}
                   rowKey="productid" />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

export default SelectProductModal;
