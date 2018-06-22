/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import List from '../../Component/List';
import styles from '../index.less';

class GroupPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <div className={styles.group_tabPanel}>
        <div className={styles.title}>群聊</div>
        <List />
      </div>
    );
  }
}

export default GroupPanel;
