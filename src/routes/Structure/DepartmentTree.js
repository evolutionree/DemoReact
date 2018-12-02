import React from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from './Structure.less';
import Search from '../../components/Search';
import { resolveTreeByPathSearch } from '../../utils';

const TreeNode = Tree.TreeNode;

const screenHeight = document.body.offsetHeight && document.documentElement.clientHeight;
const modalHeight = screenHeight * 0.6;

function transformData(data) {
  if (!data || !data.length) return;
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes, parent) {
    nodes.forEach((node, index) => {
      node.path = parent ? [...parent.path, node.deptname] : [node.deptname];
      const id = node.deptid;
      const children = data.filter(item => item.ancestor === id);
      nodes[index].children = children;
      loopChildren(children, node);
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

  constructor(props) {
    super(props);
    this.state = {
      keyword: ''
    };
  }

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

  searchDept = (keyword) => {
    this.setState({
      keyword
    });
  }

  render() {
    const treeData = transformData(_.cloneDeep(this.props.data));
    const treeNodes = this.state.keyword ? resolveTreeByPathSearch(treeData, [{ path: this.state.keyword, includeSubNode: false }]) : treeData;
    return (
      <div className={styles.wrap}>
        <Search
          placeholder="请输入部门名称"
          value={this.state.keyword}
          onSearch={this.searchDept}
          style={{ marginTop: '10px', width: '100%', maxHeight: `${modalHeight + 10}px` }}
        >
          搜索
        </Search>
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
