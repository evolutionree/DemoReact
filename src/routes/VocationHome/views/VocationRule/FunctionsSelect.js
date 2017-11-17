import React from 'react';
import { Tree } from 'antd';
import { connect } from 'dva';
import * as _ from 'lodash';
import styles from './FunctionsSelect.less';

const TreeNode = Tree.TreeNode;

class FunctionsTree extends React.Component {
  static propTypes = {
    allFunctions: React.PropTypes.array,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onInitialized: React.PropTypes.func,
    checkedKeys: React.PropTypes.object,
    onCheckChange: React.PropTypes.func,
    checkable: React.PropTypes.bool,
    checkStrictly: React.PropTypes.bool,
    onEditFunc: React.PropTypes.func
  };
  static defaultProps = {
    allFunctions: [],
    value: '',
    multiple: false,
    checkedKeys: {
      checked: [],
      halfChecked: []
    },
    checkable: false,
    checkStrictly: false
  };

  constructor(props) {
    super(props);
  }

  getNodeById = id => {
    const treeNodes = this.props.allFunctions;
    let result = {};
    loopNodes(
      treeNodes,
      node => node.funcid === id,
      node => { result = node; }
    );
    return result;
    function loopNodes(nodes, predicate, callback) {
      nodes.forEach(node => {
        if (predicate(node)) {
          callback(node);
          return false;
        }
        //else if (node.children) {
        //  loopNodes(node.children, predicate, callback);
        //}
      });
    }
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0].key;
    console.log('handleSelect');
    console.log(selectedNodes);
    this.props.onChange && this.props.onChange(value, this.getNodeById(value));
  };

  handleCheck = (checkedKeys, event) => {
    const { allFunctions } = this.props;
    const nowCheckedKeys = [...checkedKeys.checked];
    const targetKey = event.node.props.eventKey;
    const targetNode = _.find(allFunctions, ['funcid', targetKey]);

    if (targetNode) {
      checkNodeRecursively(targetNode, event.checked);
    }

    // const { checkedNodes } = event;
    // const values = checkedNodes.map(node => node.key);
    // const nodes = values.map(this.getNodeById);
    // console.log(nodes);
    this.props.onCheckChange({
      checked: nowCheckedKeys,
      halfChecked: []
    });

    function checkNodeRecursively(node, checked) {
      const { funcid } = node;
      const children = allFunctions.filter(item => item.ancestor === funcid);
      const checkIndex = nowCheckedKeys.indexOf(funcid);
      if (checked && checkIndex === -1) {
        nowCheckedKeys.push(funcid);
      } else if (!checked && checkIndex !== -1) {
        nowCheckedKeys.splice(checkIndex, 1);
      }
      children.forEach(item => {
        checkNodeRecursively(item, checked);
      });
    }
  };

  renderTitle = item => {
    return (
      <div className={styles.title}>
        <span className={styles.titleText}>{item.funcname}</span>
        {item.islastchild === -1 && item.entityid && <a
          className={styles.titleCtrl}
          href="javascript:;"
          onClick={() => { this.props.onEditFunc(item); }}
        >
          编辑数据权限
        </a>}
      </div>
    );
  };

  renderTreeNodes(data) {
    return data.map(item => {
      const { allFunctions } = this.props;
      let childs = allFunctions.filter(item2 => item2.ancestor === item.funcid);

      if (childs && childs.length) {
        return (
          <TreeNode key={item.funcid} title={this.renderTitle(item)}>
            {this.renderTreeNodes(childs)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.funcid} title={this.renderTitle(item)} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = this.props.allFunctions;
    const rootNode = treeNodes.filter(item => item.ancestor === '1fc3a304-9e5c-4f8e-852b-ef947645aa98');
    return (
      <div className={styles.wrap}>
        {(rootNode && rootNode.length)
          ? (
            <Tree
              checkStrictly={this.props.checkStrictly}
              checkable={this.props.checkable}
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[rootNode[0].funcid]}
              checkedKeys={this.props.checkedKeys}
              onSelect={this.handleSelect}
              onCheck={this.handleCheck}
            >
              {this.renderTreeNodes(rootNode)}
            </Tree>
          )
          : 'loading...'
        }
      </div>
    );
  }
}

export default connect(
  state => state.vocationRule
)(FunctionsTree);
