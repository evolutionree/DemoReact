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
          </div>
          <div className={styles.fr}>

          </div>
        </div>
      </div>
    );
  }
}

export default OriginGroup;
