import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'antd';
import SelectProductSerialModal from './SelectProductSerialModal';
import styles from './SelectUser.less';

class SelectProductSerial extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func,
    onChangeWithName: PropTypes.func,
    dataRange: PropTypes.oneOf([0, 1, 2]),
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    dataRange: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      idNameMap: {}
    };
    if (props.value) {
      const products = this.toProductArray(props.value, props.value_name);
      this.state.idNameMap = {
        ...this.toIdNameMap(products)
      };
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value_name && nextProps.value_name !== this.props.value_name) {
      const products = this.toProductArray(nextProps.value, nextProps.value_name);
      this.setState({
        idNameMap: {
          ...this.state.idNameMap,
          ...this.toIdNameMap(products)
        }
      });
    }
  }

  handleOk = (products) => {
    this.hideModal();
    this.setState({
      idNameMap: {
        ...this.state.idNameMap,
        ...this.toIdNameMap(products)
      }
    });
    const ids = products.map(u => u.id).join(',');
    this.props.onChange && this.props.onChange(ids);
    if (this.props.onChangeWithName) {
      this.props.onChangeWithName({
        value: ids,
        value_name: products.map(u => u.name).join(',')
      });
    }
  };

  showModal = () => {
    if (this.props.isReadOnly === 1) return;
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  toProductArray = (value, value_name) => {
    if (typeof value === 'number') value += '';
    if (!value) return [];
    const products = [];
    const arrId = value.split(',');
    const arrName = value_name.split(',');
    arrId.forEach((id, index) => {
      products.push({
        id,
        name: arrName[index]
      });
    });
    return products;
  };

  toIdNameMap = productArray => {
    const idNameMap = {};
    productArray.forEach(({ id, name }) => {
      idNameMap[id] = name;
    });
    return idNameMap;
  };

  parseValue = () => {
    const products = [];
    const { idNameMap } = this.state;
    let { value } = this.props;
    if (typeof value === 'number') value += '';
    if (value) {
      value.split(',').forEach(id => {
        products.push({
          id,
          name: idNameMap[id] || ''
        });
      });
    }
    return {
      products,
      text: products.map(u => u.name).join(',')
    };
  };

  render() {
    const { text, products } = this.parseValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);
    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div
          className="ant-input"
          onClick={this.showModal}
          title={text}
        >
          {text || this.props.placeholder}
        </div>
        <SelectProductSerialModal
          visible={this.state.modalVisible}
          selected={products}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
        />
      </div>
    );
  }
}

export default SelectProductSerial;
