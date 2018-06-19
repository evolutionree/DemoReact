/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon, Button } from 'antd';
import ButtonGroup from '../../Component/ButtonGroup';
import Search from '../../Component/Search';
import styles from './index.less';

class OriginGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    const buttonModel = [{
      name: 'contact',
      title: '联系人',
      active: true
    }, {
      name: 'dept',
      title: '部门',
      active: false
    }];

    return (
      <div className={styles.OriginGroupWrap}>
        <div className={styles.header}>
          <Icon type="left" />
          <h3>发起群聊</h3>
          <Icon type="close" />
        </div>
        <div className={styles.body}>
          <div className={styles.fl}>
            <div className={styles.operateWrap}>
              <ButtonGroup model={buttonModel} />
              <Search />
            </div>
            <div className={styles.contactlistWrap}>
              <h3>Y</h3>
              <ul>
                <li>
                  <img src="./img_demo_avatar.png" />
                  <span>余萍</span>
                </li>
                <li>
                  <img src="./img_demo_avatar.png" />
                  <span>余萍</span>
                </li>
                <li>
                  <img src="./img_demo_avatar.png" />
                  <span>余萍</span>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.fr}>
            <div className={styles.frHeader}>
              <h2>已选择</h2>
              <h3>清空</h3>
            </div>
            <div className={styles.categoryList}>
              <h4>联系人（2）</h4>
              <ul>
                <li>余萍<Icon type="close-circle" /></li>
                <li>何德生<Icon type="close-circle" /></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OriginGroup;
