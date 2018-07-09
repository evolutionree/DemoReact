/**
 * Created by 0291 on 2018/6/25.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import styles from './index.less';


class ContextMenuPanel extends Component {
  static propTypes = {
    left: PropTypes.number,
    top: PropTypes.number,
    visible: PropTypes.bool
  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  openPersonalDetail = () => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: 'PersonalDetail',
        panelInfo: this.props.data
      }
    });
  }

  render() {
    return (
      <ul className={classnames(styles.contextMenuWrap, { [styles.showMenuList]: this.props.visible })}
          style={{ position: 'fixed', left: this.props.left + 'px', top: this.props.top + 'px' }}>
        <li>设为星标同事</li>
        <li>取消星标同事</li>
        <li onClick={this.openPersonalDetail}>查看资料</li>
        <li>打开聊天窗口</li>
        <li>退出群聊</li>
      </ul>
    );
  }
}

export default connect(
  state => {
    const { visible, top, left } = state.webIM.contextMenuInfo
    return {
      visible,
      top,
      left
    };
  },
  dispatch => {
    return {
      dispatch
    };
  }
)(ContextMenuPanel);
