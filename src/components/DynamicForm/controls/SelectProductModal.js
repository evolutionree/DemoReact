import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin, Pagination } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryProductData } from '../../../services/basicdata';
import styles from './SelectUser.less';
import SelectProductSerial from "./SelectProductSerial";
import { getSeries, getProducts } from '../../../services/products';
import ProductSerialSelect from "../../ProductSerialSelect";

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
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        currentSelected: [...nextProps.selected],
        keyword: '',
        list: [],
        pageIndex: 1,
        total: 0
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
      recVersion: 1
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
    this.props.onOk(this.state.currentSelected);
  };

  onPageChange = pageIndex => {
    this.setState({ pageIndex }, this.fetchList);
  };

  onSearch = keyword => {
    this.setState({ keyword, pageIndex: 1 }, this.fetchList);
  };

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

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, list } = this.state;
    const selectedItems = this.getSelectedItems();
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
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
      >
        <Toolbar>
          <ProductSerialSelect
            width="200px"
            value={this.state.currentSerial}
            onChange={this.onSerialChange}
            ref={this.onSerialRef}
          />
          <Search
            width="220px"
            value={this.state.keyword}
            onSearch={this.onSearch}
            placeholder="请输入产品名称"
          >
            搜索
          </Search>
        </Toolbar>
        <Spin spinning={this.state.loading}>
          {multiple ? (
            <Row gutter={20}>
              <Col span={11}>
                <ul className={styles.userlist}>
                  {list.map(item => (
                    <li key={item.productid} onClick={this.select.bind(this, item)}>
                      <span title={item.productname}>{item.productname}</span>
                    </li>
                  ))}
                </ul>
                {pagination}
              </Col>
              <Col span={2}>
                <div style={{ height: '400px' }} className={styles.midcontrol}>
                  <Icon type="right" onClick={this.selectAll} />
                  <Icon type="left" onClick={this.removeAll} />
                </div>
              </Col>
              <Col span={11}>
                <ul className={styles.userlist}>
                  {selectedItems.map(item => (
                    <li key={item.productid}>
                      <span title={item.productname}>{item.productname}</span>
                      <Icon type="close" onClick={this.remove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          ) : (
            <div>
              <ul className={styles.userlist}>
                {list.map(item => {
                  const cls = (currentSelected[0] && currentSelected[0].productid) === item.productid ? styles.highlight : '';
                  return (
                    <li key={item.productid} onClick={this.selectSingle.bind(this, item)} className={cls}>
                      <span title={item.productname}>{item.productname}</span>
                    </li>
                  );
                })}
              </ul>
              {pagination}
            </div>
          )}
        </Spin>
      </Modal>
    );
  }
}

export default SelectProductModal;
