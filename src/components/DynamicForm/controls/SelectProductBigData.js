import React, { PropTypes } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';
import SelectProductModal from './SelectProductModal';
import styles from './SelectUser.less';
import { Icon, Select } from "antd";
import { getProductdetail, searchproductformobile } from '../../../services/products';
import connectBasicData from "../../../models/connectBasicData";

const Option = Select.Option;

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
      valMap: valMap,
      currentSerial: '',
      options: []
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
      this.setState({
        valMap
      });
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

  parseTextValue = () => {
    const { value } = this.props;
    const { valMap } = this.state;
    let arrVal = value ? value.split(',') : [];
    let array = arrVal.map(val => ({ productid: val, productname: valMap[val] }));
    let text = array.map(item => item.productname).join(',');
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
    console.log(array)
    this.setState({ valMap }, () => {
      this.props.onChange(array.map(item => item.productid).join(','));
    });
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  selectChange = (options, value) => {
    console.log(options);
    console.log(value)
    const selectData = options instanceof Array && options.filter(item => value && value.indexOf(item.productid) > -1);
    let valMap = { ...this.state.valMap };
    selectData.forEach(item => {
      valMap[item.productid] = item.productname;
    });
    this.setState({ valMap }, () => {
      this.props.onChange(selectData.map(item => item.productid).join(','));
    });
  }

  queryOptions = (searchKey) => {
    const { designateNodes, designateFilterNodes } = this.props;
    const includefilter = designateNodes && designateNodes.map(item => item.path).join(',');
    const excludefilter = designateFilterNodes && designateFilterNodes.join(',');
    const params = {
      istopset: 0,
      psetid: this.state.currentSerial,
      searchKey: searchKey,
      pageIndex: 1,
      pagecount: 10,
      includefilter: includefilter,
      excludefilter: excludefilter
    };
    this.setState({ loading: true });
    searchproductformobile(params).then(result => {
      let options = result.data.pagedata.map(item => {
        return {
          productid: item.productdetail.recid,
          productname: item.productdetail.productname
        };
      });
      const { array } = this.parseTextValue();
      options = _.uniqBy(_.concat(array, options), 'productid');
      this.setState({ loading: false, options });
    }, e => {
      this.setState({ loading: false });
      console.error(e.message || '获取产品列表失败');
    });
  }

  render() {
    let { options } = this.state;
    const { text, array } = this.parseTextValue();
    options = _.uniqBy(_.concat(array, options), 'productid');
    const isReadOnly = this.props.isReadOnly === 1;
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: isReadOnly
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);

    const { designateNodes, designateFilterNodes } = this.props;
    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div className={styles.inputSelectWrap}>
          <Select onChange={this.selectChange.bind(this, options)}
                  onSearch={this.queryOptions}
                  placeholder={this.props.placeholder}
                  disabled={isReadOnly}
                  mode={this.props.multiple === 1 ? 'multiple' : null}
                  value={array.map(item => item.productid)}
                  allowClear
          >
            {
              options instanceof Array && options.map(item => {
                return <Option key={item.productid}>{item.productname}</Option>;
              })
            }
          </Select>
          <div className={classnames(styles.openModal, { [styles.openModalDisabled]: isReadOnly })} onClick={this.showModal}>
            <Icon type="plus-square" />
          </div>
        </div>
        <SelectProductModal
          visible={this.state.modalVisible}
          value={this.props.value}
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
