import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from './styles.less';

const TreeNode = Tree.TreeNode;

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

class SeriesTree extends Component {
  static propTypes = {
    data: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    data: [],
    value: ''
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  getNodeById = id => {
    return _.find(this.props.data, ['productsetid', id]);
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0].key;
    this.props.onChange(value, this.getNodeById(value));
  };

  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.productsetid} title={item.productsetname}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.productsetid} title={item.productsetname} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = transformData(this.props.data);
    return (
      <div className={styles.treewrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[treeNodes[0].productsetid]}
              onSelect={this.handleSelect}
            >
              {this.renderTreeNodes(treeNodes)}
            </Tree>
          )
          : 'loading...'
        }
      </div>
    );
  }
}

export default SeriesTree;
