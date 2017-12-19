/**
 * Created by 0291 on 2017/12/6.
 */
import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from './FuncTree.less';

const TreeNode = Tree.TreeNode;

function transformData(data) {
  if (!data || !data.length) return;
  const root = _.find(data, item => item.parentid === '11111111');
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node.funcid;
      const children = data && data instanceof Array && data.filter(item => item.parentid === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}

class FuncTree extends Component {
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
    return _.find(this.props.data, ['funcid', id]);
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0] && selectedNodes[0].key;
    this.props.onChange(value, this.getNodeById(value));
  };

  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.funcid} title={item.funcname}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.funcid} title={item.funcname} isLeaf />;
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
              defaultExpandedKeys={[treeNodes[0].funcid]}
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

export default FuncTree;
