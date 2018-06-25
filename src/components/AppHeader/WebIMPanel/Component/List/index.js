/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import styles from './index.less';


class List extends Component {
  static propTypes = {
    onClick: PropTypes.func
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

  contextMenuHandler = (event) => {
    event.preventDefault();
    let pageX = event.pageX ? event.pageX : (event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft));
    let pageY = event.pageY ? event.pageY : (event.clientY + (document.body.scrollTop || document.documentElement.scrollTop));

    if (pageX + 160 > document.documentElement.clientWidth) {
      pageX = document.documentElement.clientWidth - 180;
    }

    this.props.onContextMenu && this.props.onContextMenu(pageX, pageY);
  }

  listClickHandler = () => {
    this.props.onClick && this.props.onClick();
  }

  render() {
    return (
      <div>
        <ul className={styles.listWrap}>
          <li onContextMenu={this.contextMenuHandler} onClick={this.listClickHandler}>
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
      </div>
    );
  }
}

export default List;
