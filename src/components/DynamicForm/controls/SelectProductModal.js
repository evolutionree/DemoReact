import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin, Pagination, Table, Tabs } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryProductData } from '../../../services/basicdata';
import styles from './SelectProductModal.less';
import SelectProductSerial from "./SelectProductSerial";
import { getSeries, getProducts } from '../../../services/products';
import ProductSerialSelect from "../../ProductSerialSelect";

const TabPane = Tabs.TabPane;

class SelectProductModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    data: PropTypes.object,
    selected: PropTypes.arrayOf(PropTypes.shape({
      productid: PropTypes.string,
      productname: PropTypes.string
    })),
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selected: [],
    multiple: true
  };

  serialSelectRef = null;

  constructor(props) {
    super(props);
    this.state = {
      currentSerial: '',
      currentSelected: [...props.selected],
      keyword: '',
      list: [],
      pageIndex: 1,
      total: 0,
      loading: false,
      currentTabsKey: '1',
      filterKeyWord: '',
      selectedRows: [...props.selected],
      currentRemoveItems: []  //准备删除的数据  存的是key值
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        currentSelected: [...nextProps.selected],
        selectedRows: [...nextProps.selected],
        keyword: '',
        list: [],
        pageIndex: 1,
        total: 0,
        currentTabsKey: '1',
        filterKeyWord: ''
      }, () => {
        this.serialSelectRef && this.serialSelectRef.getDefaultSerial(serialId => {
          this.setState({ currentSerial: serialId }, this.fetchList);
        });
      });
    }
  }

  onSerialRef = ref => {
    this.serialSelectRef = ref && ref.refs.wrappedInstance.wrappedInstance;
    if (this.props.visible && this.serialSelectRef) {
      this.serialSelectRef.getDefaultSerial(serialId => {
        this.setState({ currentSerial: serialId }, this.fetchList);
      });
    }
  };

  onSerialChange = val => {
    this.setState({ currentSerial: val, pageIndex: 1, keyword: '' }, this.fetchList);
  };

  fetchList = () => {
    const params = {
      productSeriesId: this.state.currentSerial,
      recStatus: 1,
      pageIndex: this.state.pageIndex,
      pageSize: 10,
      searchKey: this.state.keyword,
      includeChild: true,
      recVersion: 0
    };
    this.setState({ loading: true });
    getProducts(params).then(result => {
      this.setState({
        loading: false,
        list: result.data.pagedata.map(item => ({ ...item, productid: item.recid })),
        total: result.data.pagecount[0].total
      });
    }, e => {
      this.setState({ loading: false });
      message.error(e.message || '获取产品列表失败');
    });
  };

  handleOk = () => {
    console.log(this.state.currentSelected)
    this.props.onOk(this.state.currentSelected);
  };

  onPageChange = pageIndex => {
    this.setState({ pageIndex }, this.fetchList);
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

  selectAll = () => {
    this.setState({
      currentSelected: _.unionBy(this.state.currentSelected, this.state.list, 'productid')
    });
  };

  select = data => {
    // if (this.state.currentSelected.some(item => item.productid === data.id)) return;
    this.setState({
      currentSelected: _.unionBy(this.state.currentSelected, [data], 'productid')
    });
  };

  selectSingle = data => {
    this.setState({
      currentSelected: [data]
    });
  };

  remove = data => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(item => item.productid !== data.productid)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  getSelectedItems = () => {
    return this.state.currentSelected;
    // const allProducts = this.props.data.products;
    // return this.state.currentSelected.map(id => _.find(allProducts, ['productid', id])).filter(i => !!i);
  };

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

  onSelectRemoveItems = (keys) => {
    this.setState({
      currentRemoveItems: keys
    });
  }

  removeCurentItems = () => { //移除 已选列表中  选择的数据
    const currentSelected = this.state.currentSelected.filter(item => this.state.currentRemoveItems.indexOf(item.productid) === -1);
    this.setState({
      currentSelected: currentSelected
    });
  }

  render() {
    const columns = [{
      title: '产品名称',
      dataIndex: 'productname'
    }, {
      title: '产品编号',
      dataIndex: 'productcode'
    }, {
      title: '修改时间',
      dataIndex: 'recupdated'
    }];

    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, list } = this.state;
    const selectedItems = this.getSelectedItems();

    const filterSelectedItems = selectedItems.filter(item => item.productname.indexOf(this.state.filterKeyWord) > -1);
    const pagination = (
      <Pagination
        size="small"
        current={this.state.pageIndex}
        total={this.state.total}
        showSizeChanger={false}
        showQuickJumper={false}
        onChange={this.onPageChange}
      />
    );
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
              value={this.state.currentSerial}
              onChange={this.onSerialChange}
              ref={this.onSerialRef}
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
              <Table columns={columns}
                     dataSource={list}
                     pagination={{
                       total: this.state.total,
                       pageSize: 10,
                       current: this.state.pageIndex,
                       showSizeChanger: false
                     }}
                     onChange={this.handleTableChange}
                     rowSelection={{
                       type: multiple ? 'checkbox' : 'radio',
                       selectedRowKeys: selectedItems.map(item => item.productid),
                       onChange: (keys, items) => this.onSelectItems(keys, items)
                     }}
                     rowKey="productid" />
            </Spin>
          </TabPane>
          <TabPane tab="已选" key="2">
            {
              this.state.currentRemoveItems.length > 0 ? (
                <div className={styles.toolbarToggle}>
                  <span className={styles.count}>已选中{this.state.currentRemoveItems.length}项</span>
                  <a className={styles.action} onClick={this.removeCurentItems}>从已选列表中删除</a>
                </div>
              ) : null
            }
            <Table columns={columns}
                   dataSource={filterSelectedItems}
                   pagination={false}
                   rowSelection={{
                     selectedRowKeys: this.state.currentRemoveItems,
                     onChange: (keys, items) => this.onSelectRemoveItems(keys)
                   }}
                   rowKey="productid" />
          </TabPane>
        </Tabs>
        {/*<Spin spinning={this.state.loading}>*/}
          {/*{multiple ? (*/}
            {/*<Row gutter={20}>*/}
              {/*<Col span={11}>*/}
                {/*<ul className={styles.userlist}>*/}
                  {/*{list.map(item => (*/}
                    {/*<li key={item.productid} onClick={this.select.bind(this, item)}>*/}
                      {/*<span title={item.productname}>{item.productname}</span>*/}
                    {/*</li>*/}
                  {/*))}*/}
                {/*</ul>*/}
                {/*{pagination}*/}
              {/*</Col>*/}
              {/*<Col span={2}>*/}
                {/*<div style={{ height: '400px' }} className={styles.midcontrol}>*/}
                  {/*<Icon type="right" onClick={this.selectAll} />*/}
                  {/*<Icon type="left" onClick={this.removeAll} />*/}
                {/*</div>*/}
              {/*</Col>*/}
              {/*<Col span={11}>*/}
                {/*<ul className={styles.userlist}>*/}
                  {/*{selectedItems.map(item => (*/}
                    {/*<li key={item.productid}>*/}
                      {/*<span title={item.productname}>{item.productname}</span>*/}
                      {/*<Icon type="close" onClick={this.remove.bind(this, item)} />*/}
                    {/*</li>*/}
                  {/*))}*/}
                {/*</ul>*/}
              {/*</Col>*/}
            {/*</Row>*/}
          {/*) : (*/}
            {/*<div>*/}
              {/*<ul className={styles.userlist}>*/}
                {/*{list.map(item => {*/}
                  {/*const cls = (currentSelected[0] && currentSelected[0].productid) === item.productid ? styles.highlight : '';*/}
                  {/*return (*/}
                    {/*<li key={item.productid} onClick={this.selectSingle.bind(this, item)} className={cls}>*/}
                      {/*<span title={item.productname}>{item.productname}</span>*/}
                    {/*</li>*/}
                  {/*);*/}
                {/*})}*/}
              {/*</ul>*/}
              {/*{pagination}*/}
            {/*</div>*/}
          {/*)}*/}
        {/*</Spin>*/}
      </Modal>
    );
  }
}

export default SelectProductModal;
