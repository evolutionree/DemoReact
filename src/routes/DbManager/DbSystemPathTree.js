import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from '../ProductManager/styles.less';

const TreeNode = Tree.TreeNode;


class DbSystemPathTree extends Component {
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
    return _.find(this.props.data, ['fullpath', id]);
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    if (selectedNodes && selectedNodes instanceof Array && selectedNodes.length > 0) {
      const value = selectedNodes[0].key;
      this.props.onChange(value, this.getNodeById(value));
    }
  };

  renderTreeNodes(data) {
    return data.map(item => {
      const title = item.name;
      if (item.subitems && item.subitems.length) {
        return (
          <TreeNode key={item.fullpath} title={title}>
            {this.renderTreeNodes(item.subitems)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.fullpath} title={title} isLeaf />;
      }
    });
  }

  render() {
    const treeNodes = this.props.data;
    return (
      <div className={styles.treewrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              selectedKeys={[this.props.value]}
              defaultExpandedKeys={[treeNodes[0].fullpath]}
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

export default DbSystemPathTree;
