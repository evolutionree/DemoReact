import React from 'react';
import { Tree } from 'antd';
import * as _ from 'lodash';
import connectBasicData from '../models/connectBasicData';
import styles from './DepartmentTree.less';

const TreeNode = Tree.TreeNode;

class DepartmentTree extends React.Component {
  static propTypes = {
    departments: React.PropTypes.array,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onInitialized: React.PropTypes.func,
    checkedKeys: React.PropTypes.any,
    onCheckChange: React.PropTypes.func,
    checkable: React.PropTypes.bool,
    checkStrictly: React.PropTypes.bool,
    checkChildrenRecursively: React.PropTypes.bool,
    uncheckChildrenRecursively: React.PropTypes.bool
  };
  static defaultProps = {
    departments: [],
    value: '',
    multiple: false,
    checkedKeys: [],
    checkable: false,
    checkStrictly: false,
    checkChildrenRecursively: false,
    uncheckChildrenRecursively: false
  };

  getNodeById = id => {
    const treeNodes = this.props.departments;
    let result = {};
    loopNodes(
      treeNodes,
      node => node.deptid === id,
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
    // if (!this.props.checkChildrenRecursively) {
    //   const { checkedNodes, halfCheckedKeys } = event;
    //   const values = checkedNodes.map(node => node.key);
    //   const nodes = values.map(this.getNodeById);
    //   this.props.onCheckChange(values, nodes, halfCheckedKeys);
    //   return;
    // }

    const targetNode = this.getNodeById(event.node.props.eventKey);
    let nowCheckedKeys = [];
    let nowCheckedNodes = [];
    if (targetNode && event.checked && this.props.checkChildrenRecursively) {
      nowCheckedKeys = [...checkedKeys.checked || []];
      nowCheckedNodes = checkedKeys.checked.map(this.getNodeById);
      checkNodeRecursively(targetNode);
      this.props.onCheckChange(nowCheckedKeys, nowCheckedNodes, []);
    } else if (targetNode && !event.checked && this.props.uncheckChildrenRecursively) {
      nowCheckedKeys = [...checkedKeys.checked || []];
      nowCheckedNodes = checkedKeys.checked.map(this.getNodeById);
      checkNodeRecursively(targetNode);
      this.props.onCheckChange(nowCheckedKeys, nowCheckedNodes, []);
      uncheckNodeRecursively(targetNode);
      this.props.onCheckChange(nowCheckedKeys, nowCheckedNodes, []);
    } else {
      const { checkedNodes, halfCheckedKeys } = event;
      const values = checkedNodes.map(node => node.key);
      const nodes = values.map(this.getNodeById);
      this.props.onCheckChange(values, nodes, halfCheckedKeys);
    }

    function checkNodeRecursively(node) {
      if (node.children) {
        node.children.forEach(child => {
          if (!_.includes(nowCheckedKeys, child.deptid)) {
            nowCheckedKeys.push(child.deptid);
            nowCheckedNodes.push(child);
          }
          checkNodeRecursively(child);
        });
      }
    }
    function uncheckNodeRecursively(node) {
      if (node.children) {
        node.children.forEach(child => {
          if (_.includes(nowCheckedKeys, child.deptid)) {
            _.remove(nowCheckedKeys, i => i === child.deptid);
            _.remove(nowCheckedNodes, i => i.deptid === child.deptid);
          }
          uncheckNodeRecursively(child);
        });
      }
    }
  };

  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.deptid} title={item.deptname}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.deptid} title={item.deptname} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = this.props.departments;
    return (
      <div className={styles.wrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              checkStrictly={this.props.checkStrictly}
              checkable={this.props.checkable}
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[treeNodes[0].deptid]}
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

export default connectBasicData('departments', DepartmentTree);
