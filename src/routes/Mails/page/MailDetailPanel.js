/**
 * Created by 0291 on 2018/4/10.
 */
import React, { PropTypes, Component } from 'react';
import { Spin } from 'antd';
import MailContent from '../MailContent';
import MailActionBar from '../MailActionBar';
import styles from './MailDetailPanel.less';
import { queryMailDetail } from '../../../services/mails';

class MailDetailTab extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      mailDetailData: {}
    };
  }

  componentWillMount() {
    this.queryMailDetail();
  }

  queryMailDetail() {
    const mail = this.props.mailInfo;
    this.setState({
      mailDetailData: {
        status: 'loading',
        mailId: mail.mailid,
        mailInfo: mail
      }
    })
    queryMailDetail(this.props.mailInfo.mailid).then(result => {
      let { data } = result;
      data.maildetail.catalogtype = mail.catalogtype;
      data.maildetail.ctype = mail.ctype;
      this.setState({
        mailDetailData: {
          status: 'loaded',
          mailId: mail.mailid,
          mailInfo: mail,
          ...data
        }
      });
    }, e => {
      this.setState({
        mailDetailData: {
          status: 'error',
          mailId: mail.mailid,
          mailInfo: mail,
          error: e.message
        }
      });
    });
  }

  render() {
    const { status, maildetail, mailInfo } = this.state.mailDetailData || {};
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
      <div className={styles.wrap}>
        <Spin spinning={status === 'loading' ? true : false}>
          <div className={styles.head}>
            <MailActionBar mails={[mailInfo]} style={actionBarStyle} />
          </div>
          <MailContent data={mailData} />
        </Spin>
      </div>
    );
  }
}

export default MailDetailTab;
