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
      keyword: '',
      expandedKeys: [],
      autoExpandParent: true
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
    const { keyword } = this.state;
    return data.map(item => {
      let title = item.recstatus === 0 ? `(停用)${item.deptname}` : item.deptname;
      if (keyword) {
        const index = title.indexOf(keyword);
        const beforeStr = title.substr(0, index);
        const afterStr = title.substr(index + keyword.length);
        title = index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{keyword}</span>
            {afterStr}
          </span>
        ) : <span>{title}</span>;
      }

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

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  }

  searchDept = (keyword) => {
    const { data } = this.props;
    const treeData = transformData(_.cloneDeep(data));
    if (keyword) {
      const treeNodes = resolveTreeByPathSearch(treeData, [{ path: keyword, includeSubNode: false }]);
      const expandedKeys = [];
      const loop = (list) => {
        list.forEach(item => {
          if (item.children) loop(item.children);
          expandedKeys.push(item.deptid);
        });
      };
      loop(treeNodes);
      this.setState({ keyword, expandedKeys, treeNodes, autoExpandParent: true });
    } else {
      const treeNodes = treeData;
      this.setState({ keyword, expandedKeys: [treeNodes[0].deptid], treeNodes, autoExpandParent: true });
    }
  }

  render() {
    const { keyword, expandedKeys, autoExpandParent } = this.state;
    const treeData = transformData(_.cloneDeep(this.props.data));
    const treeNodes = keyword ? resolveTreeByPathSearch(treeData, [{ path: keyword, includeSubNode: false }]) : treeData;
    return (
      <div className={styles.wrap}>
        <Search
          placeholder="请输入部门名称"
          value={keyword}
          onSearch={this.searchDept}
          style={{ marginTop: '10px', width: '100%', maxHeight: `${modalHeight + 10}px` }}
        >
          搜索
        </Search>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              selectedKeys={[this.props.value]}
              onExpand={this.onExpand}
              autoExpandParent={autoExpandParent}
              onSelect={this.handleSelect}
              expandedKeys={expandedKeys}
              defaultExpandedKeys={[treeNodes[0].deptid]}
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
