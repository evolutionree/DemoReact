import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import MailContent from '../MailContent';
import MailActionBar from '../MailActionBar';
import styles from './MailDetailPanel.less';

class MailDetailPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { status, maildetail, mailInfo } = this.props.mailDetailData || {};
    const mailData = status === 'loaded' ? maildetail : mailInfo;
    const actionBarStyle = {
      padding: '0',
      fontSize: '14px',
      display: 'inline-block',
      verticalAlign: 'middle',
      lineHeight: '1',
      marginLeft: '10px'
    };
    return (
      <div className={styles.wrap} style={{ display: this.props.visible ? 'block' : 'none' }}>
        <div className={styles.head}>
          <Button type="default" icon="left" onClick={this.props.cancel}>
            返回
          </Button>
          <MailActionBar mails={[mailInfo]} style={actionBarStyle} />
        </div>
        <MailContent data={mailData} />
      </div>
    );
  }
}

export default connect(
  state => {
    const { showingPanel, mailDetailData, myCatalogDataAll } = state.mails;
    return {
      visible: /mailDetail/.test(showingPanel),
      mailDetailData,
      myCatalogDataAll
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'mails/putState', payload: { showingPanel: '' } });
      }
    };
  }
)(MailDetailPanel);

