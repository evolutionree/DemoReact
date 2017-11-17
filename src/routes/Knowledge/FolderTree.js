import React from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from './FolderTree.less';

const TreeNode = Tree.TreeNode;

function transformData(data) {
  if (!data || !data.length) return;
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node.folderid;
      const children = data.filter(item => item.pfolderid === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}

class FolderTree extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    data: React.PropTypes.array
  };
  static defaultProps = {};

  getNodeById = id => {
    return _.find(this.props.data, ['folderid', id]);
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
          <TreeNode key={item.folderid} title={item.foldername}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.folderid} title={item.foldername} isLeaf />;
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
              defaultExpandedKeys={[treeNodes[0].folderid]}
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

export default FolderTree;
