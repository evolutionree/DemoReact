import React from 'react';
import { Tree } from 'antd';
import { connect } from 'dva';
import connectBasicData from '../models/connectBasicData';
import styles from './RoleGroupTree.less';

const TreeNode = Tree.TreeNode;

class RoleGroupTree extends React.Component {
  static propTypes = {
    roles: React.PropTypes.array,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onInitialized: React.PropTypes.func,
    checkedKeys: React.PropTypes.arrayOf(React.PropTypes.string),
    onCheckChange: React.PropTypes.func,
    checkable: React.PropTypes.bool
  };
  static defaultProps = {
    roles: [],
    value: '',
    multiple: false,
    checkedKeys: [],
    checkable: true
  };

  constructor(parameters) {
    const props = parameters.props;
    super(props);
    // this.state = {
    //   data: null
    // };
    // this.fetchDepartmentData();
  }

  getNodeById = id => {
    const treeNodes = this.props.roles;
    let result = {};
    loopNodes(
      treeNodes,
      node => node.roleid === id,
      node => { result = node; }
    );
    return result;
    function loopNodes(nodes, predicate, callback) {
      nodes.forEach(node => {
        if (predicate(node)) {
          callback(node);
          return false;
        } else if (node.children) {
          loopNodes(node.children, predicate, callback);
        }
      });
    }
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0].key;
    this.props.onChange && this.props.onChange(value, this.getNodeById(value));
  };

  handleCheck = (checkedKeys, event) => {
    const { checkedNodes } = event;
    const values = checkedNodes.map(node => node.key);
    const nodes = values.map(this.getNodeById);
    this.props.onCheckChange(values, nodes);
  };
  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.roleid} title={item.rolename}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.roleid} title={item.rolename} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = this.props.roles;
    return (
      <div className={styles.wrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              checkable={this.props.checkable}
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[treeNodes[0].roleid]}
              checkedKeys={this.props.checkedKeys}
              onSelect={this.handleSelect}
              onCheck={this.handleCheck}
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

export default connectBasicData('roles', RoleGroupTree);
