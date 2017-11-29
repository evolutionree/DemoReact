import React, { PropTypes, Component } from 'react';
import { Icon } from 'antd';
import ImgIcon from '../../components/ImgIcon';
import { formatTime } from '../../utils';
import styles from './MailContent.less';

class MailContent extends Component {
  static propTypes = {
    isPreview: PropTypes.bool,
    data: PropTypes.shape({
      mailid: PropTypes.string,
      title: PropTypes.string,
      receivers: PropTypes.array,
      time: PropTypes.string,
      attachments: PropTypes.array,
      content: PropTypes.string
    })
  };
  static defaultProps = {
    isPreview: false
  };

  constructor(props) {
    super(props);
    this.state = {
      attachmentsVisible: false,
      headerVisible: true
    };
  }

  toggleAttachments = () => {
    this.setState({
      attachmentsVisible: !this.state.attachmentsVisible
    });
  };

  download = file => {
    window.open(`/api/fileservice/download?fileid=${file.fileid}`);
  };

  toggleHeader = () => {
    this.setState({ headerVisible: !this.state.headerVisible });
  };

  showMailDetail = () => {
    this.props.onShowDetail(this.props.data);
  };

  render() {
    const { isPreview, data } = this.props;
    if (!data) return null;
    const { title, sender, receivers, ccers, bccers, receivedtime, senttime, attachinfo, summary, mailbody, attachcount } = data;
    const strPersons = persons => persons && persons.map(item => item.displayname).join(', ');
    return (
      <div className={styles.wrap}>
        <ImgIcon
          name={this.state.headerVisible ? 'arrow-down-bordered' : 'arrow-up-bordered'}
          size="small"
          style={{ position: 'absolute', top: '10px', right: '10px' }}
          onClick={this.toggleHeader}
        />
        <div className={styles.title}>{title}</div>
        {this.state.headerVisible && <div className={styles.header}>
          <p className={styles.meta}>
            <span>发件人</span>
            <span>{strPersons(sender && [sender])}</span>
          </p>
          <p className={styles.meta}>
            <span>收件人</span>
            <span>{strPersons(receivers)}</span>
          </p>
          {!!(ccers && ccers.length) && <p className={styles.meta}>
            <span>抄送人</span>
            <span>{strPersons(ccers)}</span>
          </p>}
          {bccers && <p className={styles.meta}>
            <span>密送人</span>
            <span>{strPersons(bccers)}</span>
          </p>}
          <p className={styles.meta}>
            <span>时&nbsp;&nbsp;&nbsp;&nbsp;间</span>
            <span>{formatTime(receivedtime) || formatTime(senttime)}</span>
          </p>
          <div className={styles.stuff}>
            {isPreview && (
              <p style={{ display: 'inline-block', marginRight: '20px' }}>
                <ImgIcon name="mail-read" />
                <a href="javascript:;" onClick={this.showMailDetail}>邮件正文</a>
              </p>
            )}
            {attachcount > 0 && (
              <p style={{ display: 'inline-block' }}>
                共{attachcount}个附件
                {attachinfo && attachinfo.length > 0 && <span>(<Icon type="file" />{attachinfo[0].filename}等)</span>}
                <a href="javascript:;" style={{ marginLeft: '5px' }}
                   onClick={isPreview ? this.showMailDetail : this.toggleAttachments}>查看附件</a>
              </p>
            )}
            {this.state.attachmentsVisible && data.status === 'loaded' && (
              <ul className={styles.attachlist} style={{ paddingLeft: isPreview ? '170px' : '70px' }}>
                {(attachinfo || []).map(item => (
                  <li key={item.fileid}>
                    {/*<Icon type="paper-clip" style={{ marginRight: '5px', verticalAlign: 'middle', color: '#999' }} />*/}
                    <ImgIcon name="attachment" style={{ marginRight: '3px' }} />
                    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>{item.filename}</span>
                    <ImgIcon style={{ height: '14px' }} name="download" onClick={this.download.bind(this, item)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>}
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: mailbody || summary }} />
      </div>
    );
  }
}

export default MailContent;

