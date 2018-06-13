/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon } from 'antd';
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
    return (
      <div className={styles.OriginGroupWrap}>
        <div className={styles.header}>
          <Icon type="left" />
          <h3>发起群聊</h3>
          <Icon type="close" />
        </div>
      </div>
    );
  }
}

export default OriginGroup;
