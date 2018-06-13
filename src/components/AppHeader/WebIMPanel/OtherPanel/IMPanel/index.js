/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Input, Icon } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

class IMPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <div className={styles.IMPanelWrap}>
        <div className={styles.header}>
          <Icon type="left" />
          <h3>杜丽</h3>
          <Icon type="close" />
        </div>
        <div className={styles.body}>
          <div className={classnames(styles.chatItem, styles.itemLeft)}>
            <img src="/img_img_card.png" />
            <div className={styles.message}>昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗？</div>
          </div>
          <div className={classnames(styles.chatItem, styles.itemLeft)}>
            <img src="/img_img_card.png" />
            <div className={styles.message}>我要他的电话就可以了</div>
          </div>
          <div className={classnames(styles.chatItem, styles.itemRight)}>
            <img src="/img_img_card.png" />
            <div className={styles.message}>对方电话是18166980982</div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            <Icon type="picture" />
            <Icon type="folder-open" />
            <Icon type="smile-o" />
          </div>
          <div className={styles.inputWrap}>
            <textarea />
          </div>
          <div className={styles.submitWrap}>
            <div className={styles.buttonWrap}>
              <div>发送</div>
              <div>
                <i></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default IMPanel;
