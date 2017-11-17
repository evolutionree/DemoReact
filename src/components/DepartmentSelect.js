import React from 'react';
import { TreeSelect } from 'antd';
import connectBasicData from '../models/connectBasicData';
import styles from './DepartmentTree.less';
import { resolveTreeByPathSearch, treeForEach, matchPath } from '../utils';
import { blurByHelper } from './DynamicForm/controls/helpers';

const TreeNode = TreeSelect.TreeNode;

class DepartmentSelect extends React.Component {
  static propTypes = {
    departments: React.PropTypes.array,
    value: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string
    ]),
    onChange: React.PropTypes.func,
    width: React.PropTypes.string,
    multiple: React.PropTypes.bool
  };
  static defaultProps = {
    departments: [],
    placeholder: '请选择部门'
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
    if (props.departments.length) {
      this.setDataReady();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.departments.length && nextProps.departments.length) {
      setTimeout(this.setDataReady, 0);
    }
    // if (nextProps.value !== this.props.value) {
    //   setTimeout(blurByHelper, 10);
    // }
  }

  setDataReady = () => {
    this._dataReady = true;
    if (this._onDataReady) {
      this._onDataReady.forEach(fn => fn());
      this._onDataReady = [];
    }
  };
  ensureDataReady = callback => {
    return (...args) => {
      if (this._dataReady) return callback(...args);
      if (!this._onDataReady) this._onDataReady = [];
      this._onDataReady.push(callback.bind(this, ...args));
    };
  };

  renderTreeNodes(data) {
    const titleStyle = {
      display: 'inline-block',
      maxWidth: '15em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.deptid}
            key={item.deptid}
            title={<span title={item.deptname} style={titleStyle}>{item.deptname}</span>}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            className={item.recstatus === 0 ? styles.hiddenNode : ''}
            value={item.deptid}
            key={item.deptid}
            title={<span title={item.deptname} style={titleStyle}>{item.deptname}</span>}
            isLeaf
          />
        );
      }
    });
  }

  setValue = val => {
    if (!val) {
      this.props.onChange(this.props.multiple ? [] : '', true);
      return;
    }
    const arrVal = val.split(',');
    const treeData = this.getTreeData();
    const matchIds = arrVal.filter(id => {
      let flag = false;
      treeForEach(treeData, node => {
        if (node.deptid === id) flag = true;
      });
      return flag;
    });
    if (matchIds.length) {
      this.props.onChange(this.props.multiple ? matchIds : matchIds[0], true);
    }
  };

  setValueByName = valueName => {
    if (!valueName) {
      this.props.onChange(this.props.multiple ? [] : '', true);
      return;
    }
    const arrName = valueName.split(',');
    const treeData = this.getTreeData();
    const matchIds = arrName
      .map(name => {
        let matchNode;
        matchPath(treeData, name, 'deptname', node => matchNode = node);
        return matchNode && matchNode.deptid;
      })
      .filter(item => !!item);
    if (matchIds.length) {
      this.props.onChange(this.props.multiple ? matchIds : matchIds[0], true);
    }
  };

  getTreeData = () => {
    const { departments, designateNodes, designateFilterNodes } = this.props;
    let treeNodes = departments;
    if (designateNodes || designateFilterNodes) {
      treeNodes = resolveTreeByPathSearch(departments, designateNodes, designateFilterNodes);
    }
    return treeNodes;
  };

  handleChange = (value, nodes, evt) => {
    const labels = nodes.map(node => {
      return node.props && node.props.title;
    });
    this.props.onChange && this.props.onChange(value, labels, evt);
  };

  render() {
    const { width, value, onChange, onFocus, ...rest } = this.props;

    const treeNodes = this.getTreeData();
    const treeDefaultExpandedKeys = treeNodes.map(item => item.deptid).filter(item => !!item);

    return treeNodes ? (
      <TreeSelect
        allowClear
        showSearch={false}
        searchPlaceholder="输入团队名称搜索"
        treeNodeFilterProp="title"
        style={width ? { width } : {}}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        value={value}
        onChange={this.handleChange}
        onClick={onFocus}
        treeDefaultExpandedKeys={treeDefaultExpandedKeys}
        {...rest}
      >
        {this.renderTreeNodes(treeNodes)}
      </TreeSelect>
    ) : <div style={{ display: 'inline-block' }}>loading...</div>;
  }
}

export default connectBasicData('departments', DepartmentSelect);
