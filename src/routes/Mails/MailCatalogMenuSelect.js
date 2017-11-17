import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import * as _ from 'lodash';
import { treeForEach } from '../../utils';

class MailCatalogMenuSelect extends Component {
  static propTypes = {
    catalogData: PropTypes.array
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      treeData: this.getTreeData(props.catalogData)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.catalogData !== this.props.catalogData) {
      this.setState({ treeData: this.getTreeData(nextProps.catalogData) });
    }
  }

  getTreeData = catalogData => {
    const treeData = _.cloneDeep(catalogData);
    treeForEach(treeData, item => {
      item.value = item.recid;
      item.label = item.recname;
      item.children = item.subcatalogs;
    }, 'subcatalogs');
    return treeData;
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.subcatalogs) {
        return (
          <Tree.TreeNode title={item.recname} key={item.recid}>
            {this.renderTreeNodes(item.subcatalogs)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode title={item.recname} key={item.recid} isLeaf />;
    });
  };

  handleSelect = keys => {
    this.props.onSelect(keys[0]);
  };

  render() {
    return (
      <Tree
        selectedKeys={[]}
        onSelect={this.handleSelect}
      >
        {this.renderTreeNodes(this.state.treeData)}
      </Tree>
    );
  }
}

export default MailCatalogMenuSelect;
