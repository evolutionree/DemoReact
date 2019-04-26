import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import ProductSelectTree from './ProductSelectTree';

class TransferProductModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: undefined
    };
  }

  selectChange = (value, item) => {
    this.setState({ value, item });
  }

  onOk = () => {
    const { value, item } = this.state;
    const { currentItem } = this.props;
    if (!value) {
      message.error('请选择产品');
      return;
    }

    if (value === currentItem.productsetid) {
      message.warning('已属于当前产品,不能转移');
      return;
    }

    Modal.confirm({
      title: '确定把选中的产品转换到【' + item.productsetname + '】？',
      onOk: () => {
        this.props.onOk({ 
          fieldData: { productsetid: value }, 
          recId: currentItem.recid, 
          typeId: '59cf141c-4d74-44da-bca8-3ccf8582a1f2',
          onSuccess: () => {
            this.setState({ value: undefined, item: undefined }, this.props.onCancel);
          }
        });
      }
    });
  };

  render() {
    const { series } = this.props;
    return (
      <Modal
        title="转换产品"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
      >
        <ProductSelectTree
          data={series}
          value={this.state.value}
          onChange={this.selectChange}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { currentItems, showModals, series } = state.productManager;
    return {
      visible: /transfer/.test(showModals),
      currentItem: currentItems[0],
      series
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'productManager/showModals', payload: '' });
      },
      onOk({ onSuccess, ...payload }) {
        dispatch({ type: 'productManager/transfer', payload, onSuccess });
      }
    };
  }
)(TransferProductModal);
