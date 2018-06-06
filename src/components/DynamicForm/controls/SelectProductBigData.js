import React, { PropTypes } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';
import SelectProductModal from './SelectProductModal';
import styles from './SelectUser.less';
import { Icon } from "antd";
import { getProductdetail } from '../../../services/products';
import connectBasicData from "../../../models/connectBasicData";

class SelectProductBigData extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onChangeWithName: PropTypes.func,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    if (props.value) {
      this.fetchProductsDetail(this.props.value);
    }
    this.state = {
      modalVisible: false,
      productsDetail: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value_name !== nextProps.value_name) {
      this.fetchProductsDetail(nextProps.value);
    }
  }

  fetchProductsDetail = (productId) => {
    getProductdetail({
      recids: productId
    }).then(result => {
      this.setState({
        productsDetail: result.data.map(item => ({ ...item, productid: item.recid }))
      });
    }).catch(e => {
      console.error(e.message);
    });
  }

  setValue = val => {
    if (!val) {
      this.props.onChange('', true);
      return;
    }
    const allProductData = this.props.productsRaw.products;
    const arrVal = val.split(',');
    const validVals = arrVal.filter(id => {
      return allProductData.some(obj => obj.productid === id);
    }).join(',');
    this.props.onChange(validVals);
  };

  setValueByName = valueName => {
    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    const allProductData = this.props.productsRaw.products;
    const arrVal = valueName.split(',');
    const validVals = arrVal
      .map(name => {
        const match = _.find(allProductData, ['productname', name]);
        if (match) return match.productid;
        return undefined;
      })
      .filter(i => !!i)
      .join(',');
    this.props.onChange(validVals);
  };

  parseTextValue = () => {
    // const { multiple, value, value_name, productsRaw } = this.props;
    // let text = value;
    // let array = value ? value.split(',') : [];
    // const allProductData = this.props.productsRaw.products;
    // text = array.map(id => _.find(allProductData, ['productid', id]))
    //   .filter(i => !!i)
    //   .map(obj => obj.productname)
    //   .join(',');
    // return { text, array };
    const productsDetail = this.state.productsDetail;
    let text = productsDetail.map(item =>item.productname).join(',');
    return { text };
  };

  showModal = () => {
    if (this.props.isReadOnly === 1) return;
    if (this.props.onFocus) {
      this.props.onFocus();
    }
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleOk = array => {
    this.hideModal();
    this.props.onChange(array.map(item => item.productid).join(','));
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  render() {
    const { text } = this.parseTextValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);

    const { designateNodes, designateFilterNodes } = this.props;
    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div
          className="ant-input"
          onClick={this.showModal}
          title={text}
        >
          {text || this.props.placeholder}
          <Icon type="close-circle" className={iconCls} onClick={this.iconClearHandler} />
        </div>
        <SelectProductModal
          visible={this.state.modalVisible}
          selected={this.state.productsDetail}
          data={this.props.productsRaw}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
          designateNodes={designateNodes}
          designateFilterNodes={designateFilterNodes}
        />
      </div>
    );
  }
}

// export default connectBasicData('productsRaw', SelectProductBigData);
export default SelectProductBigData;
