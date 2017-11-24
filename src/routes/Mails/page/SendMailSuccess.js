/**
 * Created by 0291 on 2017/11/22.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import Styles from './SendMailSuccess.less';


class SendMailSuccess extends Component {
  static propTypes = {

  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {

  }

  closePage() {
    this.props.dispatch({ type: 'mails/putState', payload: { showingModals: '' } });
  }

  openEditEmailPanel() {
    this.props.dispatch({ type: 'mails/putState', payload: { showingModals: 'editMail' } });
  }

  render() {
    return (
      <div className={Styles.Wrap} style={{ width: 'calc(100% - 10px)', height: 'calc(100% - 10px)', display: this.props.visible ? 'block' : 'none' }}>
        <div className={Styles.info}>
          <b>您的邮件已发送</b>
          <div>此邮件发送成功，并已保存到“已发送”文件夹。</div>
          <div className={Styles.btnWrap}>
            <Button onClick={this.closePage.bind(this)}>返回邮箱首页</Button>
            <Button className="grayBtn" onClick={this.openEditEmailPanel.bind(this)}>再写一封</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return { ...state.mails };
  },
  dispatch => {
    return {
      dispatch
    };
  }
)(SendMailSuccess);
