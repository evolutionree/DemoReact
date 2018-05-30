import React, { PropTypes } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';
import SelectProductModal from './SelectProductModal';
import styles from './SelectUser.less';
import { Icon } from "antd";
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
    let valMap = {};
    if (props.value_name) {
      const arrVal = props.value.split(',');
      const arrName = props.value_name.split(',');
      arrVal.forEach((val, index) => {
        valMap[val] = arrName[index];
      });
    }
    this.state = {
      modalVisible: false,
      valMap: valMap
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value_name !== nextProps.value_name) {
      const arrVal = nextProps.value.split(',');
      const arrName = nextProps.value_name.split(',');
      let valMap = { ...this.state.valMap };
      arrVal.forEach((val, index) => {
        valMap[val] = arrName[index];
      });
      this.setState({ valMap });
    }
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

  parseValue = () => {
    // const { multiple, value, value_name, productsRaw } = this.props;
    // let text = value;
    // let array = value ? value.split(',') : [];
    // const allProductData = this.props.productsRaw.products;
    // text = array.map(id => _.find(allProductData, ['productid', id]))
    //   .filter(i => !!i)
    //   .map(obj => obj.productname)
    //   .join(',');
    // return { text, array };
    const { value } = this.props;
    const { valMap } = this.state;
    let arrVal = value ? value.split(',') : [];
    let array = arrVal.map(val => ({ productid: val, productname: valMap[val] }));
    let text = array.map(item =>item.productname).join(',');
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
    let valMap = { ...this.state.valMap };
    array.forEach(item => {
      valMap[item.productid] = item.productname;
    });
    this.setState({ valMap }, () => {
      this.props.onChange(array.map(item => item.productid).join(','));
    });
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
          selected={array}
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
