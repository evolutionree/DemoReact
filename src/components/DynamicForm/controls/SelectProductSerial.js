import React, { PropTypes } from 'react';
import { TreeSelect } from 'antd';
import connectBasicData from '../../../models/connectBasicData';
import { matchPath, treeFilter, resolveTreeByPathSearch, treeForEach } from '../../../utils';
import { blurByHelper } from './helpers';
import styles from './SelectProduct.less';

const TreeNode = TreeSelect.TreeNode;
//
// const titleStyle = {
//   display: 'inline-block',
//   maxWidth: '15em',
//   overflow: 'hidden',
//   textOverflow: 'ellipsis',
//   whiteSpace: 'nowrap'
// };
// const Title = ({ text }) => (
//   <span style={titleStyle} title={text}>{text}</span>
// );

class SelectProductSerial extends React.Component {
  static propTypes = {
    wrapStyle: PropTypes.object,
    products: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value_name: PropTypes.string,
    onChange: PropTypes.func,
    onChangeWithName: PropTypes.func,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    wrapStyle: {},
    products: []
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
    if (props.products.length) {
      this.setDataReady();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.products.length && nextProps.products.length) {
      setTimeout(this.setDataReady, 0);
    }
    // if (nextProps.value !== this.props.value) {
    //   setTimeout(blurByHelper, 10);
    // }
  }

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

  handleChange = (value, labels, extra) => {
    let newValue;
    if (Array.isArray(value)) {
      newValue = value.join(',');
    } else {
      newValue = value;
    }
    this.props.onChange && this.props.onChange(newValue);
    if (this.props.onChangeWithName) {
      this.props.onChangeWithName({
        value: newValue,
        value_name: labels.join(',')
      });
    }
  };

  parseValue = () => {
    const { multiple, value } = this.props;
    if (multiple === 1) {
      if (!value) return [];
      return value && value.split(',');
    } else {
      if (!value) return undefined; //不返回‘’，不然传placeholder 显示不了
      return value;
    }
  };

  setValue = val => {
    // this.props.onChange(val);
    if (!val) {
      this.props.onChange('', true);
      return;
    }
    const arrVal = val && val.split(',');
    const treeData = this.getTreeData();
    const matchIds = arrVal.filter(id => {
      let flag = false;
      treeForEach(treeData, node => {
        if (node.productsetid === id) flag = true;
      });
      return flag;
    });
    if (matchIds.length) {
      this.props.onChange(this.props.multiple ? matchIds.join(',') : matchIds[0], true);
    }
  };

  setValueByName = valueName => {
    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    const arrName = valueName.split(',');
    const treeData = this.getTreeData();
    const matchIds = arrName
      .map(name => {
        let matchNode;
        matchPath(treeData, name, 'productsetname', node => matchNode = node);
        return matchNode && matchNode.productsetid;
      })
      .filter(item => !!item);
    if (matchIds.length) {
      this.props.onChange(this.props.multiple ? matchIds.join(',') : matchIds[0], true);
    }
  };

  getTreeData = () => {
    const { products, designateNodes, designateFilterNodes } = this.props;
    let treeData = treeFilter(products, node => {
      if (node.productid) return false;
      node.label = node.productsetname;
      node.key = node.value = node.productsetid;
      return true;
    });

    if (designateNodes || designateFilterNodes) {
      treeData = resolveTreeByPathSearch(treeData, designateNodes, designateFilterNodes);
    }

    // hack 根节点不可选择
    // treeData.forEach(item => item.selectable = false);
    treeData = treeData[0] ? treeData[0].children : [];

    return treeData;
  };

  // renderTreeNodes = nodes => {
  //   return nodes.map(item => {
  //     const { children, productid, productname, productsetid, productsetname } = item;
  //     if (children && children.length) {
  //       return (
  //         <TreeNode value={productsetid} key={productsetid} title={<Title text={productsetname} />}>
  //           {this.renderTreeNodes(children)}
  //         </TreeNode>
  //       );
  //     } else if (productid) {
  //       return <TreeNode value={productid} key={productid} title={<Title text={productname} />} isLeaf />;
  //     } else {
  //       return <TreeNode value={productsetid} key={productsetid} title={<Title text={productsetname} />} isLeaf />;
  //     }
  //   });
  // };

  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.value}
            key={item.key}
            title={item.label}
            selectable={item.selectable !== false}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.value}
            key={item.key}
            title={item.label}
            selectable={item.selectable !== false}
            isLeaf
          />
        );
      }
    });
  }

  render() {
    const { multiple, placeholder, isReadOnly, onFocus, wrapStyle } = this.props;

    const treeData = this.getTreeData();
    // const treeDefaultExpandedKeys = treeData.map(item => item.productsetid).filter(item => !!item);

    return (
      <TreeSelect
        allowClear
        style={{ height: 32, ...wrapStyle }}
        dropdownStyle={{ maxHeight: 250, overflow: 'auto' }}
        value={this.parseValue()}
        onChange={this.handleChange}
        onClick={onFocus}
        placeholder={placeholder}
        multiple={multiple === 1}
        disabled={isReadOnly === 1}
      >
        {this.renderTreeNodes(treeData)}
      </TreeSelect>
    );
  }
}

export default connectBasicData('products', SelectProductSerial);
