/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import styles from './index.less';

class PersonalDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <div className={styles.PersonalDetailWrap}>
        <div className={styles.header}>
          <Icon type="left" />
          <h3>查看资料</h3>
          <Icon type="close" />
        </div>
        <div className={styles.body}>
          <div className={styles.fl}>
            <img src="/img_img_card.png" />
            <div className={styles.usernameWrap}>
              <h4>杜丽</h4>
              <Icon type="star" />
            </div>
            <div className={styles.mobileWrap}>
              <Icon type="mobile" />
              15287983458
            </div>
          </div>
          <div className={styles.separateLine}></div>
          <div className={styles.fr}>
            <ul>
              <li>部门：产品开发</li>
              <li>性别：男</li>
              <li>职务：销售人员</li>
            </ul>
            <ul>
              <li>电话：020-8878965</li>
              <li>邮箱：zhirongyuan@163.com</li>
              <li>工号：未填写</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default PersonalDetail;
