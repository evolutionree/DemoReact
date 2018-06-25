/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import List from '../../Component/List';
import IMPanel from '../../OtherPanel/IMPanel';
import classnames from 'classnames';
import styles from '../index.less';

class ReactPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      IMPanelVisible: false
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  listClickHandler = () => {
    this.setState({
      IMPanelVisible: true
    });
  }

  render() {
    return (
      <div className={styles.recent_tabPanel}>
        <div className={styles.title}>最近聊天</div>
        <List onClick={this.listClickHandler} />
        <div className={classnames(styles.Recent_IMPanelWrap, { [styles.visible]: this.state.IMPanelVisible })}>
          <IMPanel panelInfo={{ username: 'test' }} />
        </div>
      </div>
    );
  }
}

export default ReactPanel;
