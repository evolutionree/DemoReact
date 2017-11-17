import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import MailContent from '../MailContent';
import styles from './MailDetailPanel.less';

class MailDetailPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={styles.wrap} style={{ display: this.props.visible ? 'block' : 'none' }}>
        <div className={styles.head}>
          <Button type="default" icon="left" onClick={this.props.cancel}>
            返回
          </Button>
        </div>
        <MailContent
          data={this.props.mailDetailData}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    const { showingModals, mailDetailData } = state.mails;
    return {
      visible: /mailDetail/.test(showingModals),
      mailDetailData
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'mails/showModals', payload: '' });
      }
    };
  }
)(MailDetailPanel);

