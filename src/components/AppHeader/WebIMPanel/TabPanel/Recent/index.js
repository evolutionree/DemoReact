/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import List from '../../Component/List';
import styles from '../index.less';

class ReactPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <div className={styles.recent_tabPanel}>
        <div className={styles.title}>最近聊天</div>
        <List />
      </div>
    );
  }
}

export default ReactPanel;
