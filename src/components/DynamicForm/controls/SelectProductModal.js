import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryProductData } from '../../../services/basicdata';
import styles from './SelectUser.less';
import SelectProductSerial from "./SelectProductSerial";

class SelectProductModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    data: PropTypes.object,
    selected: PropTypes.arrayOf(PropTypes.string),
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selected: [],
    multiple: true
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSerial: '',
      currentSelected: [...props.selected],
      list: [],
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        currentSerial: this.getDefaultSerial(nextProps),
        currentSelected: [...nextProps.selected]
      }, this.fetchList);
    }
  }

  onSerialChange = val => {
    this.setState({ currentSerial: val }, this.fetchList);
  };

  fetchList = () => {
    const allProducts = this.props.data.products;
    const list = (allProducts || []).filter(item => item.productsetid === this.state.currentSerial);
    this.setState({ list });
  };

  getDefaultSerial = (props) => {
    const serials = props.data.productserial;
    return serials && serials[0].productsetid;
  };

  handleOk = () => {
    this.props.onOk(this.state.currentSelected);
  };

  selectAll = () => {
    const ids = _.map(this.state.list, 'productid');
    this.setState({
      currentSelected: _.union(this.state.currentSelected, ids)
    });
  };

  select = data => {
    const currSelected = this.state.currentSelected;
    const hasSelected = _.includes(currSelected, data.productid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [...currSelected, data.productid]
      });
    }
  };

  selectSingle = data => {
    this.setState({
      currentSelected: [data.productid]
    });
  };

  remove = data => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(id => id !== data.productid)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  getSelectedItems = () => {
    const allProducts = this.props.data.products;
    return this.state.currentSelected.map(id => _.find(allProducts, ['productid', id])).filter(i => !!i);
  };

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, list } = this.state;
    const selectedItems = this.getSelectedItems();
    return (
      <Modal
        title="选择产品"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
      >
        <Toolbar>
          <SelectProductSerial
            wrapStyle={{ width: '200px' }}
            value={this.state.currentSerial}
            onChange={this.onSerialChange}
          />
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
            <ul className={styles.userlist}>
              {list.map(item => {
                const cls = currentSelected[0] === item.productid ? styles.highlight : '';
                return (
                  <li key={item.productid} onClick={this.selectSingle.bind(this, item)} className={cls}>
                    <span title={item.productname}>{item.productname}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Spin>
      </Modal>
    );
  }
}

export default SelectProductModal;
