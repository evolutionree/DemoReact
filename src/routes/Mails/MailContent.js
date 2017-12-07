import React, { PropTypes, Component } from 'react';
import { Icon, message } from 'antd';
import { connect } from 'dva';
import ImgIcon from '../../components/ImgIcon';
import { formatTime } from '../../utils';
import { markMails } from '../../services/mails';
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
      headerVisible: true,
      iframeHeight: 100
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

  toggleTag = () => {
    const tag = this.props.data.istag ? 0 : 1;
    this.props.tagMailsInDetail(tag);
  };

  showMailDetail = () => {
    this.props.onShowDetail(this.props.data);
  };

  onIframeLoad = (event) => {
    const iframe = event.target;
    const idoc = (iframe.contentWindow || iframe.contentDocument.parentWindow).document;
    let height = 300;
    // if (idoc.body) {
    //   height = Math.max(idoc.body.scrollHeight, idoc.body.offsetHeight);
    // } else if (idoc.documentElement) {
    //   height = Math.max(idoc.documentElement.scrollHeight, idoc.documentElement.offsetHeight);
    // }
    if (idoc.documentElement) {
      height = idoc.documentElement.offsetHeight;
    }
    this.setState({ iframeHeight: height });
  };

  render() {
    const { isPreview, data } = this.props;
    if (!data) return null;
    const { title, sender, receivers, ccers, bccers, receivedtime,
      senttime, attachinfo, summary, mailbody, attachcount, istag, catalogtype } = data;
    let mailtime = receivedtime;
    if (receivedtime === '0001-01-01 00:00:00' || !receivedtime) {
      mailtime = senttime === '0001-01-01 00:00:00' ? '' : senttime;
    }
    const strPersons = persons => {
      if (!persons) return null;
      return persons.map((item, index) => {
        const name = item.displayname || item.nickname || item.address;
        // const address = item.address ? <span style={{ color: '#7f7f7f', paddingLeft: '3px' }}>&lt;{item.address}&gt;</span> : null;
        const address = null;
        return (
          <span key={index} style={{ marginLeft: '3px' }}>{name}{address};</span>
        );
      });
    };
    return (
      <div className={styles.wrap}>
        <ImgIcon
          name={this.state.headerVisible ? 'arrow-down-bordered' : 'arrow-up-bordered'}
          size="small"
          style={{ position: 'absolute', top: '10px', right: '10px' }}
          onClick={this.toggleHeader}
        />
        <div className={styles.title} title={title}>
          {catalogtype !== 'dept' &&
            <Icon
              type={istag ? 'star' : 'star-o'}
              style={{ color: '#ff9a2e', marginRight: '5px', cursor: 'pointer' }}
              onClick={this.toggleTag}
            />}
          {title}
        </div>
        {this.state.headerVisible && <div className={styles.header}>
          <p className={styles.meta}>
            <span>发件人</span>
            <span>{strPersons(sender && (Array.isArray(sender) ? sender : [sender]))}</span>
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
            <span>{mailtime}</span>
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
            {this.state.attachmentsVisible && (
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
        {/*<div className={styles.body} dangerouslySetInnerHTML={{ __html: mailbody || summary }} />*/}
        <div className={styles.iframewrap}>
          <iframe
            className={styles.iframe}
            frameBorder={0}
            scrolling="no"
            height={this.state.iframeHeight}
            width="100%"
            srcDoc={mailbody || summary}
            onLoad={this.onIframeLoad}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => {
    return {
      tagMailsInDetail(tag) {
        dispatch({ type: 'mails/tagMailsInDetail__', payload: tag });
      }
    };
  }
)(MailContent);

