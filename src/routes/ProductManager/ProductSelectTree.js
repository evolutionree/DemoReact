import React, { PropTypes, Component } from 'react';
import { TreeSelect } from 'antd';
import _ from 'lodash';
import styles from './styles.less';

const TreeNode = TreeSelect.TreeNode;

function transformData(data) {
  if (!data || !data.length) return;
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

class ProductSelectTree extends Component {
  static propTypes = {
    data: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    data: [],
    value: undefined
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSelect = (value) => {
    const { onChange } = this.props;
    const item = _.find(this.props.data, v => v.productsetid === value);
    onChange(value, item);
  };

  renderTreeNodes(data) {
    return data.map(item => {
      const title = item.recstatus === 0 ? ('(停用)' + item.productsetname) : item.productsetname;
      const value = item.productsetid;
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.productsetid} title={title} value={value}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.productsetid} title={title} value={value} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = transformData(this.props.data);
    return (
      <div className={styles.treewrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <TreeSelect
                // showSearch
                style={{ width: '100%' }}
                value={this.props.value}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择要转换为产品"
                allowClear
                treeDefaultExpandAll
                onChange={this.handleSelect}
            >
              {this.renderTreeNodes(treeNodes)}
            </TreeSelect>
          )
          : 'loading...'
        }
      </div>
    );
  }
}

export default ProductSelectTree;
