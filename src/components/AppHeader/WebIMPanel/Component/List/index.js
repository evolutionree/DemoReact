/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import styles from './index.less';


class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false,
      menuLeft: 0,
      menuTop: 0
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  contextMenuHandler = (event) => {
    event.preventDefault();
    let pageX = event.pageX ? event.pageX : (event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft));
    let pageY = event.pageY ? event.pageY : (event.clientY + (document.body.scrollTop || document.documentElement.scrollTop));

    if (pageX + 160 > document.documentElement.clientWidth) {
      pageX = document.documentElement.clientWidth - 180;
    }

    this.setState({
      menuVisible: true,
      menuLeft: pageX,
      menuTop: pageY
    });
  }

  hideMenuPanel = () => {
    this.setState({
      menuVisible: false
    });
  }

  render() {
    return (
      <div>
        <ul className={styles.listWrap} onClick={this.hideMenuPanel}>
          <li onContextMenu={this.contextMenuHandler}>
            <div className={styles.fl}>
              <div>杜丽</div>
              <div>2017/01/08</div>
            </div>
            <div className={styles.fr}>
              <div>陈晓明：明天有时间吗？我准备和你去拜访一</div>
              <div>余苹：您好，我是市场部跟你对接的余苹</div>
            </div>
          </li>
          <li onContextMenu={this.contextMenuHandler}>
            <div className={styles.fl}>
              <div>Test</div>
              <div>2017/01/08</div>
            </div>
            <div className={styles.fr}>
              <div>陈晓明：明天有时间吗？我准备和你去拜访一</div>
              <div>余苹：您好，我是市场部跟你对接的余苹</div>
            </div>
          </li>
        </ul>
        <ul className={classnames(styles.contextMenuWrap, { [styles.showMenuList]: this.state.menuVisible })}
            style={{ position: 'fixed', left: this.state.menuLeft + 'px', top: this.state.menuTop + 'px' }}>
          <li>设为星标同事</li>
          <li>查看资料</li>
          <li>隐藏该会话</li>
        </ul>
      </div>
    );
  }
}

export default Search;
