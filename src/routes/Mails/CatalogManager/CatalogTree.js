import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import * as _ from 'lodash';
import ImgIcon from '../../../components/ImgIcon';
import { queryDeptMailCatalog, queryMailCatalog } from '../../../services/mails';
import { treeForEach } from '../../../utils';
import styles from '../styles.less';

const TreeNode = Tree.TreeNode;

const Title = ({ text, type, count }) => {
  const iconMap = {
    0: 'folder',
    1001: 'box',
    1003: 'box-send',
    1004: 'box-sended',
    1006: 'trash'
  };
  const icon = iconMap[type];
  return (
    <div>
      {!!icon && <ImgIcon name={icon} />}
      <span>{text}</span>
      {!!count && <span style={{ color: '#3398db' }}>({count})</span>}
    </div>
  );
};

class CatalogTree extends Component {
  static propTypes = {
    isDeptTree: PropTypes.bool,
    data: PropTypes.array,
    onDataChange: PropTypes.func,
    selected: PropTypes.string,
    onSelect: PropTypes.func
  };
  static defaultProps = {
    isDeptTree: false,
    data: []
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onLoadData = treeNode => {
    if (treeNode.props.children) {
      return Promise.resolve();
    }
    const dataRef = treeNode.props.dataRef;
    if (dataRef.nodetype === 0) {
      return queryDeptMailCatalog({ treeid: dataRef.treeid }).then(result => {
        dataRef.subcatalogs = result.data;
        this.props.onDataChange(this.props.data);
      });
    } else {
      return queryMailCatalog({ searchuserid: +dataRef.treeid }).then(result => {
        dataRef.subcatalogs = result.data;
        this.props.onDataChange(this.props.data);
      });
    }
  };

  getNodeById = id => {
    const { data } = this.props;
    let node;
    treeForEach(data, item => {
      if (item.treeid === id || item.recid === id) node = item;
    }, 'subcatalogs');
    return node;
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    const value = selectedNodes[0].key;
    this.props.onSelect(value, this.getNodeById(value));
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (this.props.isDeptTree && item.treeid) {
        return this.renderDeptTreeNode(item);
      }

      if (item.subcatalogs && item.subcatalogs.length) {
        return (
          <TreeNode key={item.recid} title={<Title type={item.ctype} text={item.recname} count={item.unreadcount} />}>
            {this.renderTreeNodes(item.subcatalogs)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.recid} title={<Title type={item.ctype} text={item.recname} count={item.unreadcount} />} isLeaf />;
      }
    });
  };

  renderDeptTreeNode = item => {
    const label = <Title type={item.nodetype} text={item.treename} count={item.unreadcount} />;
    if (item.subcatalogs && item.subcatalogs.length) {
      return (
        <TreeNode key={item.treeid} title={label} dataRef={item}>
          {this.renderTreeNodes(item.subcatalogs)}
        </TreeNode>
      );
    } else {
      return <TreeNode key={item.treeid} title={label} dataRef={item} />;
    }
  };

  render() {
    const treeNodes = this.props.data;
    return (
      <div className={styles.treewrap}>
        {(treeNodes && treeNodes.length)
          ? (
            <Tree
              loadData={this.onLoadData}
              selectedKeys={[this.props.selected]}
              defaultExpandedKeys={[treeNodes[0].productsetid]}
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

export default CatalogTree;
