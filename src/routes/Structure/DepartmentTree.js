import React from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from './Structure.less';

const TreeNode = Tree.TreeNode;

function transformData(data) {
  if (!data || !data.length) return;
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node.deptid;
      const children = data.filter(item => item.ancestor === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}

class DepartmentTree extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    data: React.PropTypes.array
  };
  static defaultProps = {};

  getNodeById = id => {
    return _.find(this.props.data, ['deptid', id]);
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0].key;
    this.props.onChange(value, this.getNodeById(value));
  };

  renderTreeNodes(data) {
    return data.map(item => {
      const title = item.recstatus === 0 ? `(停用)${item.deptname}` : item.deptname;
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.deptid} title={title}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.deptid} title={title} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = transformData(this.props.data);
    return (
      <div className={styles.wrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[treeNodes[0].deptid]}
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

export default DepartmentTree;
