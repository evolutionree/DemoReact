/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon, message, Spin } from 'antd';
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
    //this.closeIMPanel();
  };

  componentWillReceiveProps(nextProps) {

  }

  listClickHandler = (data) => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: this.props.showPanel === 'IMPanel' ? 'IMPanel' : 'miniIMPanel',
        panelInfo: data
      }
    });
  }

  closeIMPanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel', payload: '' });
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
    const { recent_list_loading, recentChatList, spotNewMsgList } = this.props;
    const spotLayout = this.props.showPanel === 'miniIMPanel' ? 'start' : 'end';
    return (
      <div className={styles.recent_tabPanel}>
        <div className={styles.title}>最近聊天</div>
        <div className={styles.listWrap}>
          <Spin spinning={recent_list_loading}>
            <List onClick={this.listClickHandler} onContextMenu={this.onContextMenu} dataSource={recentChatList} spotLayout={spotLayout} spotNewMsgList={spotNewMsgList} />
          </Spin>
        </div>
        <div className={classnames(styles.Recent_IMPanelWrap, { [styles.visible]: this.props.showPanel === 'miniIMPanel' })} id="IMPanel">
          <IMPanel />
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
