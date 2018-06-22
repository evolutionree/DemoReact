/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, PureComponent } from 'react';
import { Dropdown, Menu, Input, Icon } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import styles from './index.less';

class IMPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendMessage: ''
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  closePanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel', payload: '' });
  }

  usernameClickHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: { showChildrenPanel: 'PersonalDetail', childrenPanelInfo: this.props.panelInfo } });
  }

  sendMessageChangeHandler = (e) => {
    this.setState({
      sendMessage: e.target.value
    });
  }

  sendMessage = () => {
    const { webIMSocket } = this.props;
    webIMSocket.send(JSON.stringify({
      Cmd: 3,
      data: {
        ctype: 0,
        gid: '00000000-0000-0000-0000-000000000000',
        ct: 1,
        cont: this.state.sendMessage,
        rec: this.props.panelInfo.userid
      }
    }));
  }

  render() {
    const { panelInfo, messagelist } = this.props;
    console.log(messagelist)
    return (
      <div className={styles.IMPanelWrap}>
        <div className={styles.header}>
          <h3 onClick={this.usernameClickHandler}>{panelInfo.username}</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          <div className={classnames(styles.chatItem, styles.itemLeft)}>
            <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={30} />
            <div className={styles.message}>昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗昨天下午我们拜访的客户联系方式你有吗？</div>
          </div>
          <div className={classnames(styles.chatItem, styles.itemLeft)}>
            <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={30} />
            <div className={styles.message}>我要他的电话就可以了</div>
          </div>
          <div className={classnames(styles.chatItem, styles.itemRight)}>
            <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={30} />
            <div className={styles.message}>对方电话是18166980982</div>
          </div>
          {
            messagelist && messagelist instanceof Array && messagelist.map(item => {
              return (
                <div className={classnames(styles.chatItem, styles.itemLeft)} key={item.CustomContent.mid}>
                  <Avatar image={`/api/fileservice/read?fileid=${panelInfo.usericon}`} width={30} />
                  <div className={styles.message}>{item.Message}</div>
                </div>
              );
            })
          }
        </div>
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            <Icon type="picture" />
            <Icon type="folder-open" />
            <Icon type="smile-o" />
          </div>
          <div className={styles.inputWrap}>
            <textarea onChange={this.sendMessageChangeHandler} />
          </div>
          <div className={styles.submitWrap}>
            <div className={styles.buttonWrap}>
              <div onClick={this.sendMessage}>发送</div>
              <div>
                <i></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.webIM,
  dispatch => {
    return {
      dispatch
    };
  }
)(IMPanel);
