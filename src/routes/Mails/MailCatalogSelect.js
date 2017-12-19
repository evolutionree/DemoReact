import React, { PropTypes, Component } from 'react';
import { TreeSelect } from 'antd';
import * as _ from 'lodash';
import { treeForEach } from '../../utils';

class MailCatalogSelect extends Component {
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
    let retTreeData;
    treeForEach(treeData, item => {
      item.value = item.recid;
      item.label = item.recname;
      item.children = item.subcatalogs;
      if (item.ctype === 2002) {
        retTreeData = item;
      }
    }, 'subcatalogs');
    return [retTreeData];
  };

  render() {
    return (
      <TreeSelect
        allowClear
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={this.state.treeData}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
        disabled={this.props.disabled}
      />
    );
  }
}

export default MailCatalogSelect;

