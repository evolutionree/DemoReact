/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { Spin } from 'antd';
import { connect } from 'dva';
import List from '../../Component/List';
import IMPanel from '../../OtherPanel/IMPanel';
import classnames from 'classnames';
import styles from '../index.less';

class GroupPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  listClickHandler = (data) => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: this.props.showPanel === 'IMPanel' ? 'IMPanel' : 'miniIMPanel',
        panelInfo: {
          ...data,
          chattype: 1
        }
      }
    });
  }

  render() {
    const { group_list_loading, groupList } = this.props;
    return (
      <div className={styles.group_tabPanel}>
        <div className={styles.title}>群聊</div>
        <div className={styles.listWrap}>
          <Spin spinning={group_list_loading}>
            <List onClick={this.listClickHandler} onContextMenu={this.onContextMenu} dataSource={groupList} />
          </Spin>
        </div>
        <div className={classnames(styles.Group_IMPanelWrap, { [styles.visible]: this.props.showPanel === 'miniIMPanel' })} id="IMPanel">
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
  })(GroupPanel);
