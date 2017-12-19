import React, { PropTypes } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';
import SelectProductModal from './SelectProductModal';
import styles from './SelectUser.less';
import { Icon } from "antd";
import connectBasicData from "../../../models/connectBasicData";

class SelectProductBigData extends React.Component {
  static propTypes = {
    productsRaw: PropTypes.shape({ productserial: PropTypes.array, products: PropTypes.array }),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onChangeWithName: PropTypes.func,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    productsRaw: { productserial: [], products: [] }
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
    if (props.productsRaw.products.length) {
      this.setDataReady();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.productsRaw.products.length && nextProps.productsRaw.products.length) {
      setTimeout(this.setDataReady, 0);
    }
    // if (nextProps.value !== this.props.value) {
    //   setTimeout(blurByHelper, 10);
    // }
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

  setDataReady = () => {
    this._dataReady = true;
    if (this._onDataReady) {
      this._onDataReady.forEach(fn => fn());
      this._onDataReady = [];
    }
  };
  ensureDataReady = callback => {
    return (...args) => {
      if (this._dataReady) return callback(...args);
      if (!this._onDataReady) this._onDataReady = [];
      this._onDataReady.push(callback.bind(this, ...args));
    };
  };

  parseValue = () => {
    const { multiple, value, value_name, productsRaw } = this.props;
    let text = value;
    let array = value ? value.split(',') : [];
    const allProductData = this.props.productsRaw.products;
    text = array.map(id => _.find(allProductData, ['productid', id]))
      .filter(i => !!i)
      .map(obj => obj.productname)
      .join(',');
    return { text, array };
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
    this.props.onChange(array.join(','));
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  render() {
    const { text, array } = this.parseValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);

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
          selected={array}
          data={this.props.productsRaw}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
        />
      </div>
    );
  }
}

export default connectBasicData('productsRaw', SelectProductBigData);