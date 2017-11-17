/**
 * Created by 0291 on 2017/11/10.
 */
import React, { Component } from 'react';
import { Input, Tree } from 'antd';
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
import Styles from './AddressList.less';
import request from '../../../utils/request';

class AddressList extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {

  }

  componentDidUpdate() {

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
          <Tree>
            <TreeNode title="客户A" key="0-0">
              <TreeNode title="陈佳明" />
              <TreeNode title="张三" />
              <TreeNode title="李四" />
            </TreeNode>
            <TreeNode title="客户B" key="0-1">
              <TreeNode title="陈佳明" />
              <TreeNode title="张三" />
              <TreeNode title="李四" />
            </TreeNode>
          </Tree>
        </div>
      </div>
    );
  }
}

export default AddressList;
