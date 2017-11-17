/**
 * Created by 0291 on 2017/11/10.
 */
import React, { Component } from 'react';
import { Input, Tree } from 'antd';
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
import Styles from './AddressList.less';
import request from '../../../utils/request';
import { connect } from 'dva';

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


      setTimeout(() => {
        treeNode.props.dataRef.children = [
          { treename: 'Child Node', treeid: `${treeNode.props.eventKey}-0` },
          { treename: 'Child Node', treeid: `${treeNode.props.eventKey}-1` }
        ];
        this.setState({
          innerContact: [...this.state.innerContact]
        });
        resolve();
      }, 1000);
    });
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.treename} key={item.treeid} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.treename} key={item.treeid} dataRef={item} />;
    });
  }

  render() {
    return (
      <div className={Styles.addressListWrap}>
        <div>通讯录</div>
        <div>
          <Search
            placeholder="查找联系人"
            onSearch={value => console.log(value)}
          />
        </div>
        <div className={Styles.recentContacts}>
          <div className={Styles.title}>最近联系人</div>
          <ul className={Styles.body}>
            <li>陈佳明</li>
            <li>张三</li>
            <li>李四</li>
          </ul>
        </div>
        <div className={Styles.categoryWrap}>
          <div className={Styles.title}>客户联系人</div>
          <Tree loadData={this.onLoadData}>
            {this.renderTreeNodes(this.state.innerContact)}
          </Tree>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.mails
)(AddressList);
