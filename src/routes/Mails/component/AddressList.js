/**
 * Created by 0291 on 2017/11/10.
 */
import React, { Component } from 'react';
import { Input, Tree, Collapse, Icon } from 'antd';
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
      innerContact: this.props.innerContact,
      queryString: '',
      listData: []
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
          <TreeNode title={item.treename} key={item.treeid} dataRef={item} selectable={false}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.treename} key={item.treeid} dataRef={item} isLeaf={item.nodetype === 1} selectable={item.nodetype === 1} />;
    });
  }

  selectContact(item) {
    this.props.onSelect && this.props.onSelect(item);
    if (this.props.focusTargetName) {
      const editEmailFormData = this.props.editEmailFormData || {};
      const oldData = editEmailFormData[this.props.focusTargetName] || [];
      const newEditEmailFormData = {
        ...editEmailFormData,
        [this.props.focusTargetName]: [
          ...oldData,
          {
            name: item.name,
            email: item.emailaddress
          }
        ]
      };

      this.props.dispatch({ type: 'mails/putState', payload: { editEmailFormData: newEditEmailFormData } });
    }
  }

  treeSelectHandler(selectKeys, { selected, selectedNodes, node, event }) {
    const selectItem = this.state.innerContact && this.state.innerContact instanceof Array && this.state.innerContact.filter((item, index) => {
      return item.treeid === (selectKeys && selectKeys instanceof Array && selectKeys.length > 0 && selectKeys[0]);
    });

    if (this.props.focusTargetName) {
      const editEmailFormData = this.props.editEmailFormData || {};
      const oldData = editEmailFormData[this.props.focusTargetName] || [];
      const pushData = selectItem && selectItem instanceof Array && selectItem[0];

      if (pushData) {
        const newEditEmailFormData = {
          ...editEmailFormData,
          [this.props.focusTargetName]: [
            ...oldData,
            {
              name: pushData.treename,
              email: pushData.mail
            }
          ]
        };

        let filterEditEmailFormData = {};
        this.props.model && this.props.model instanceof Array && this.props.model.map((item) => { //筛选出当前表单显示的数据
          filterEditEmailFormData[item.name] = newEditEmailFormData[item.name];
        });

        this.props.dispatch({ type: 'mails/putState', payload: { editEmailFormData: filterEditEmailFormData } });
      }
    }
  }

  queryListData(value) {
    request('/api/mail/getcontactbykeyword', {
      method: 'post', body: JSON.stringify({ keyword: value, count: 9999 })
    }).then((result) => {
      this.setState({
        listData: result && result.data
      });
    });
  }


  onChangeQueryString(e) {
    this.setState({ queryString: e.target.value }, this.queryListData(e.target.value));
  }

  emitEmptyQueryString() {
    this.setState({ queryString: '' }, this.queryListData(''));
  }

  render() {
    console.log(this.state.listData)
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
                  <Tree loadData={this.onLoadData} onSelect={this.treeSelectHandler.bind(this)}>
                    {this.renderTreeNodes(this.state.innerContact)}
                  </Tree>
                </Panel>
              </Collapse>
            </div>
        }
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
