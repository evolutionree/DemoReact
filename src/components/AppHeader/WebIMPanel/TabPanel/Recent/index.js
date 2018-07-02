/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon, message } from 'antd';
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

  componentDidMount() {
    document.body.addEventListener('click', this.onRecentPanelClick, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.onRecentPanelClick);
  }

  onRecentPanelClick = (event) => {
    if ($(event.target).closest('#IMPanel').length) {
      return;
    }
    this.closeIMPanel();
  };

  componentWillReceiveProps(nextProps) {

  }

  listClickHandler = (data) => {
    // this.props.dispatch({
    //   type: 'webIM/showPanel',
    //   payload: {
    //     showPanel: 'IMPanel',
    //     panelInfo: data
    //   }
    // });
    this.setState({
      IMPanelVisible: true
    });
  }

  closeIMPanel = () => {
    this.setState({
      IMPanelVisible: false
    });
  }

  onContextMenu = (left, top, data) => {
    this.props.dispatch({ type: 'webIM/setContextMenu', payload: {
      visible: true,
      type: 1,
      left,
      top,
      data
    } });
  }

  render() {
    return (
      <div className={styles.recent_tabPanel}>
        <div className={styles.title}>最近聊天</div>
        <div className={styles.listWrap}>
          <List onClick={this.listClickHandler} onContextMenu={this.onContextMenu} dataSource={this.props.recentChatList} />
        </div>
        <div className={classnames(styles.Recent_IMPanelWrap, { [styles.visible]: this.state.IMPanelVisible })} id="IMPanel">
          <IMPanel panelInfo={{ username: 'test' }} close={this.closeIMPanel} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.webIM
    };
  },
  dispatch => {
    return {
      dispatch
    };
  })(ReactPanel);
