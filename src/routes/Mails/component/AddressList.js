/**
 * Created by 0291 on 2017/11/10.
 */
import React, { Component } from 'react';
import { Input, Tree, Collapse } from 'antd';
const Panel = Collapse.Panel;
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
import Styles from './AddressList.less';
import request from '../../../utils/request';
import { queryInnerContact, queryDeptMailCatalog, queryMailCatalog } from '../../../services/mails';
import { connect } from 'dva';
import compare from '../lib/sortCompare';

class AddressList extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      innerContact: this.props.innerContact
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      innerContact: nextProps.innerContact
    });
  }

  componentDidMount() {

  }

  componentDidUpdate() {

  }

  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      const dataRef = treeNode.props.dataRef;
      return queryInnerContact({ treeid: dataRef.treeid }).then(result => {
        dataRef.children = result.data;
        this.setState({
          innerContact: [...this.state.innerContact]
        });
        resolve();
      });
    });
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.treename} key={item.treeid} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.treename} key={item.treeid} dataRef={item} />;
    });
  }


  selectContact(item) {
    this.props.onSelect && this.props.onSelect(item);

    console.log(document.activeElement)
  }

  render() {
    const customerContact = this.props.customerContact && this.props.customerContact instanceof Array && this.props.customerContact.sort(compare);
    return (
      <div className={Styles.addressListWrap}>
        <div>通讯录</div>
        <div>
          <Search
            placeholder="查找联系人"
            onSearch={value => console.log(value)}
          />
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0' }}>
          <Collapse defaultActiveKey={['1']}>
            <Panel header="最近联系人" key="1">
              <ul className={Styles.recentContactsWrap}>
                {
                  this.props.recentContact && this.props.recentContact instanceof Array && this.props.recentContact.map((item, index) => {
                    return <li key={index} onClick={this.selectContact.bind(this, item)}>{item.name ? item.name : item.emailaddress}</li>;
                  })
                }
              </ul>
            </Panel>
            <Panel header="客户联系人" key="2">
              <ul className={Styles.recentContactsWrap}>
                {
                  customerContact && customerContact instanceof Array && customerContact.map((item, index) => {
                    return <li key={index} onClick={this.selectContact.bind(this, item)}>{item.customer ? item.customer : item.emailaddress}</li>;
                  })
                }
              </ul>
            </Panel>
            <Panel header="企业内部联系人" key="3">
              <Tree loadData={this.onLoadData}>
                {this.renderTreeNodes(this.state.innerContact)}
              </Tree>
            </Panel>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.mails
)(AddressList);
