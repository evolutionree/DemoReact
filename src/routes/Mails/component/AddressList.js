/**
 * Created by 0291 on 2017/11/10.
 */
import React, { Component } from 'react';
import { Input, Tree, Collapse, Icon, message } from 'antd';
const Panel = Collapse.Panel;
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
import Styles from './AddressList.less';
import request from '../../../utils/request';
import { queryInnerContact, queryDeptMailCatalog, queryMailCatalog } from '../../../services/mails';
import { connect } from 'dva';
import compare from '../lib/sortCompare';
import _ from 'lodash';

class AddressList extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      innerContact: this.props.innerContact,
      queryString: '',
      listData: [],
      foldAddress: true
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      innerContact: nextProps.innerContact
    });
    if (nextProps.showingPanel && nextProps.showingPanel !== this.props.showingPanel) {
      this.setState({
        foldAddress: true
      });
    }
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
    return data.map((item, index) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.treename} key={JSON.stringify({ treeid: item.treeid, email: item.mail, name: item.treename })} dataRef={item} selectable={false}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.treename} key={JSON.stringify({ treeid: item.treeid, email: item.mail, name: item.treename })} dataRef={item} isLeaf={item.nodetype === 1} selectable={item.nodetype === 1} />;
    });
  }

  selectContact(item) {
    this.props.onSelect && this.props.onSelect(item);
    if (this.props.focusTargetName) {
      const editEmailFormData = this.props.editEmailFormData || {};
      const oldData = editEmailFormData[this.props.focusTargetName] || [];
      const newEditEmailFormData = {
        ...editEmailFormData,
        [this.props.focusTargetName]: _.uniqBy([
          ...oldData,
          {
            name: item.name,
            email: item.emailaddress
          }
        ], 'email')
      };

      this.props.dispatch({ type: 'mails/putState', payload: { editEmailFormData: newEditEmailFormData } });
    }
  }

  treeSelectHandler(selectKeys) {
    if (this.props.focusTargetName) {
      const editEmailFormData = this.props.editEmailFormData || {};
      const oldData = editEmailFormData[this.props.focusTargetName] || [];
      const pushData = selectKeys && selectKeys instanceof Array && selectKeys.length > 0 && JSON.parse(selectKeys[0]);
      if (pushData) {
        const newEditEmailFormData = {
          ...editEmailFormData,
          [this.props.focusTargetName]: _.uniqBy([
            ...oldData,
            {
              name: pushData.name,
              email: pushData.email
            }
          ], 'email')
        };

        this.props.dispatch({ type: 'mails/putState', payload: { editEmailFormData: newEditEmailFormData } });
      }
    } else {
      message.info('请先选择需要填充的焦点行');
    }
  }

  queryListData(value) {
    Promise.all([
      request('/api/mail/getcontactbykeyword', {
        method: 'post', body: JSON.stringify({ keyword: value, count: 50 })
      }),
      request('/api/mail/getinnerpersoncontact', {
        method: 'post', body: JSON.stringify({ keyword: value, PageIndex: 1, pageSize: 50 })
      })
    ]).then((result) => {
      const [customContact, innerContact] = result;
      const innerContactData = innerContact.data.datalist.map((item) => {
        return {
          name: item.treename,
          emailaddress: item.mail
        };
      });
      this.setState({
        listData: [
          ...customContact.data,
          ...innerContactData
        ]
      });
    });
  }


  onChangeQueryString(e) {
    if (e.target.value.length < 21) {
      this.setState({ queryString: e.target.value }, this.queryListData(e.target.value));
    }
  }

  emitEmptyQueryString() {
    this.setState({ queryString: '' }, this.queryListData(''));
  }

  setFoldAddress() {
    this.setState({
      foldAddress: false
    });
  }

  render() {
    const { queryString } = this.state;
    const customerContact = this.props.customerContact && this.props.customerContact instanceof Array && this.props.customerContact.sort(compare);
    const suffix = queryString ? <Icon type="close-circle" onClick={this.emitEmptyQueryString.bind(this)} /> : null;
    return (
      <div className={Styles.addressListWrap}>
        <div>通讯录</div>
        <div>
          <Input
            placeholder="查找联系人..."
            suffix={suffix}
            value={queryString}
            onChange={this.onChangeQueryString.bind(this)}
            ref={node => this.userNameInput = node}
          />
        </div>
        <div style={{ overflow: 'auto', height: 'calc(100% - 84px)' }}>
          {
            this.state.queryString ? <div className={Styles.queryListDataWrap}>
              <div>查找的数据:</div>
              <ul>
                {
                  this.state.listData && this.state.listData instanceof Array && this.state.listData.length > 0 ? this.state.listData.map((item, index) => {
                    return (
                      <li key={index} onClick={this.selectContact.bind(this, item)}>{item.name ? item.name : item.emailaddress}</li>
                    );
                  }) : <li>没有符合条件的联系人</li>
                }
              </ul>
            </div> :
              <div style={{ borderTop: '1px solid #f0f0f0' }}>
                <Collapse defaultActiveKey={['1']}>
                  <Panel header="最近联系人" key="1">
                    <ul className={Styles.recentContactsWrap}>
                      {
                        this.props.recentContact && this.props.recentContact instanceof Array && this.props.recentContact.map((item, index) => {
                          if (index === 9 && this.state.foldAddress) {
                            return (
                              <li key={index} onClick={this.setFoldAddress.bind(this)} style={{ textAlign: 'center', fontWeight: 'bold' }}>点击显示更多...</li>
                            );
                          } else if (index > 9 && this.state.foldAddress) {
                            return null;
                          } else {
                            return <li key={index} onClick={this.selectContact.bind(this, item)}>{item.name ? item.name : item.emailaddress}</li>;
                          }
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
                    <Tree loadData={this.onLoadData} onSelect={this.treeSelectHandler.bind(this)}>
                      {this.renderTreeNodes(this.state.innerContact)}
                    </Tree>
                  </Panel>
                </Collapse>
              </div>
          }
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      dispatch
    };
  }
)(AddressList);
