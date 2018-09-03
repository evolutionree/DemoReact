import React, { PropTypes, Component } from 'react';
import { Tree } from 'antd';
import * as _ from 'lodash';
import ImgIcon from '../../../components/ImgIcon';
import { queryDeptMailCatalog, queryMailCatalog, queryMailBoxList } from '../../../services/mails';
import { treeForEach, treeFilter2 } from '../../../utils';
import styles from '../styles.less';

const TreeNode = Tree.TreeNode;

const Title = ({ text, type, unread, total }) => {
  const iconMap = {
    0: 'folder',
    1001: 'box',
    1002: 'unread-box',
    1003: 'box-send',
    1004: 'box-sended',
    1005: 'draft',
    1006: 'trash',
    1008: 'stared-box',
    1009: 'share-g'
  };
  const icon = iconMap[type];
  const textStyl = {
    display: 'inline-block',
    maxWidth: '14em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  };
  let count = unread;
  if (type > 1002 && type < 2000) {
    count = total;
  }
  return (
    <div>
      {!!icon && <ImgIcon name={icon} />}
      <span style={textStyl} title={text}>{text}</span>
      {!!count && <span style={{ color: '#3398db', verticalAlign: 'middle', marginLeft: '4px' }}>({count})</span>}
    </div>
  );
};

class CatalogTree extends Component {
  static propTypes = {
    isDeptTree: PropTypes.bool,
    data: PropTypes.array,
    onDataChange: PropTypes.func,
    selected: PropTypes.string,
    onSelect: PropTypes.func,
    searchString: PropTypes.string
  };
  static defaultProps = {
    isDeptTree: false,
    data: [],
    searchString: ''
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
      if (dataRef.boxid) { //请求的是 人员下邮箱下的数据
        return queryMailCatalog({ searchuserid: +dataRef.parentid, BoxId: dataRef.boxid }).then(result => {
          const data = result.data.filter(i => i.ctype === 1001 || i.ctype === 1004);
          dataRef.subcatalogs = this.transformData(data);
          this.props.onDataChange(this.props.data);
        });
      } else { //如果到了人员一级  需要去查询人员下的邮箱
        return queryMailBoxList({ FetchUserId: dataRef.treeid }).then(result => {
          const data = result.data.datalist.map(item => {
            return { //前端组合出树形结构的数据
              treeid: item.accountid,
              parentid: dataRef.treeid,
              treename: item.accountid,
              boxid: item.recid,
              nodetype: 1
            };
          });
          dataRef.subcatalogs = data;
          this.props.onDataChange(this.props.data);
        });
      }
    }
  };

  transformData(data) {
    return data.map(item => {
      if (item.subcatalogs && item.subcatalogs.length) {
        this.transformData(item.subcatalogs);
      }
      item.uuid = this.uuid();
      return item;
    });
  }

  getNodeById = id => {
    const { data } = this.props;
    let node;
    treeForEach(data, item => { //同一下属不同邮箱下的数据的recid会一致  所以前端生成唯一key值uuid
      if (item.treeid === id || item.recid === id || item.uuid === id) node = item;
    }, 'subcatalogs');
    return node;
  };

  handleSelect = (selectedKeys, event) => {
    const { selectedNodes } = event;
    if (!selectedKeys.length) {
      this.props.onSelect();
      return;
    }
    const value = selectedNodes[0].key;
    this.props.onSelect(value, this.getNodeById(value));
  };

  getDefaultExpandedKeys = () => {
    const { isDeptTree, data, selected } = this.props;
    if (isDeptTree) return [];
    const expandedKeys = [];
    const nodes = [];
    treeForEach(data, item => {
      if (item.ctype === 1001 || item.ctype === 2001 || item.ctype === 2002) {
        nodes.push(item);
        expandedKeys.push(item.uuid || item.recid);
      }
    }, 'subcatalogs');
    if (selected) expandedKeys.push(selected);
    return expandedKeys;
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (this.props.isDeptTree && item.treeid) {
        return this.renderDeptTreeNode(item);
      }

      if (item.subcatalogs && item.subcatalogs.length) {
        return (
          <TreeNode key={item.uuid || item.recid} title={<Title type={item.ctype} text={item.recname} unread={item.unreadcount} total={item.mailcount} />}>
            {this.renderTreeNodes(item.subcatalogs)}
          </TreeNode>
        );
      } else { //同一下属不同邮箱下的数据的recid会一致  所以前端生成唯一key值uuid
        return <TreeNode key={item.uuid || item.recid} title={<Title type={item.ctype} text={item.recname} unread={item.unreadcount} total={item.mailcount} />} isLeaf />;
      }
    });
  };

  renderDeptTreeNode = item => {
    const label = <Title type={item.nodetype} text={item.treename} unread={item.unreadcount} total={item.mailcount} />;
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

  uuid() { //生成uuid
    let s = [];
    let hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    let uuid = s.join('');
    return uuid;
  }

  render() {
    let treeNodes = this.props.data;
    if (treeNodes && treeNodes.length && this.props.searchString) {
      treeNodes = treeFilter2(treeNodes, node => {
        return node.recname.indexOf(this.props.searchString) !== -1;
      }, { reservePath: true, childrenKey: 'subcatalogs' });
      if (!treeNodes.length) {
        return (
          <div className={styles.treewrap}>
            <div>(暂无数据)</div>
          </div>
        );
      }
    }
    if (!treeNodes) {
      return (
        <div className={styles.treewrap}>加载中...</div>
      );
    } else if (!treeNodes.length) {
      return (
        <div className={styles.treewrap}>(暂无数据)</div>
      );
    }
    return (
      <div className={styles.treewrap}>
        <Tree
          loadData={this.onLoadData}
          selectedKeys={[this.props.selected]}
          defaultExpandedKeys={this.getDefaultExpandedKeys()}
          onSelect={this.handleSelect}
        >
          {this.renderTreeNodes(treeNodes)}
        </Tree>
      </div>
    );
  }
}

export default CatalogTree;
