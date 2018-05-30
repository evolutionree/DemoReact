import React from 'react';
import { TreeSelect } from 'antd';
import * as _ from 'lodash';
import connectBasicData from '../models/connectBasicData';
import { treeForEach, treeFilter, resolveTreeByPathSearch } from '../utils';
import styles from './DepartmentTree.less';

const TreeNode = TreeSelect.TreeNode;

function transformData(data) {
  if (!data || !data.length) return [];
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node.productsetid;
      const children = data.filter(item => item.pproductsetid === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}

class ProductSerialSelect extends React.Component {
  static propTypes = {
    productSerial: React.PropTypes.array,
    value: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string
    ]),
    onChange: React.PropTypes.func,
    width: React.PropTypes.string,
    multiple: React.PropTypes.bool
  };
  static defaultProps = {
    productSerial: [],
    placeholder: '请选择产品系列',
    multiple: false
  };

  onSerialDataCallback = () => {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.productSerial.length && nextProps.productSerial.length) {
      if (this.onSerialDataCallback) {
        setTimeout(() => {
          this.onSerialDataCallback();
        });
      }
    }
  }

  renderTreeNodes(data) {
    const titleStyle = {
      display: 'inline-block',
      maxWidth: '15em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.productsetid}
            key={item.productsetid}
            title={<span title={item.productsetname} style={titleStyle}>{item.productsetname}</span>}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.productsetid}
            key={item.productsetid}
            title={<span title={item.productsetname} style={titleStyle}>{item.productsetname}</span>}
            isLeaf
          />
        );
      }
    });
  }

  getDefaultSerial = (callback) => {
    if (this.props.productSerial.length) {
      const rootNode = _.find(this.props.productSerial, ['nodepath', 0]);
      callback(rootNode && rootNode.productsetid);
    } else {
      this.onSerialDataCallback = () => {
        const rootNode = _.find(this.props.productSerial, ['nodepath', 0]);
        callback(rootNode && rootNode.productsetid);
      }
    }
  };

  getTreeData = () => {
    return transformData(this.props.productSerial || [])
    // const retTree = transformData(this.props.productSerial || []);
    // const productBySerial = {};
    // treeForEach(retTree, node => {
    //   const belongProducts = productBySerial[node.productsetid];
    //   if (belongProducts) {
    //     node.children = [...node.children, ...belongProducts];
    //     node.children.forEach(child => {
    //       if (!child.path) {
    //         child.path = [...node.path, child.productname];
    //       }
    //     });
    //   }
    // });
    //
    // const { designateNodes, designateFilterNodes } = this.props;
    // console.log(designateNodes)
    // let treeData = treeFilter(retTree, node => {
    //   if (node.productid) return false;
    //   node.label = node.productsetname;
    //   node.key = node.value = node.productsetid;
    //   return true;
    // });
    //
    // if (designateNodes || designateFilterNodes) {
    //   treeData = resolveTreeByPathSearch(treeData, designateNodes, designateFilterNodes);
    // }
    //
    // // hack 根节点不可选择
    // // treeData.forEach(item => item.selectable = false);
    // treeData = treeData[0] ? treeData[0].children : [];
    //
    // return treeData;
  };

  handleChange = (value, nodes, evt) => {
    const labels = nodes.map(node => {
      return node.props && node.props.title;
    });
    this.props.onChange && this.props.onChange(value, labels, evt);
  };

  render() {
    const { width, value, onChange, onFocus, ...rest } = this.props;

    const treeNodes = this.getTreeData();
    const treeDefaultExpandedKeys = treeNodes.map(item => item.productsetid).filter(item => !!item);

    return treeNodes ? (
      <TreeSelect
        allowClear
        showSearch={true}
        treeNodeFilterProp="title"
        style={width ? { width } : {}}
        dropdownStyle={{ maxHeight: 250, overflow: 'auto' }}
        value={value}
        onChange={this.handleChange}
        onClick={onFocus}
        treeDefaultExpandedKeys={treeDefaultExpandedKeys}
        {...rest}
      >
        {this.renderTreeNodes(treeNodes)}
      </TreeSelect>
    ) : <div style={{ display: 'inline-block' }}>loading...</div>;
  }
}

export default connectBasicData('productSerial', ProductSerialSelect);
