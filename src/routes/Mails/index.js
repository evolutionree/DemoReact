import React, { PropTypes, Component } from 'react';
import { Button, Modal, message } from 'antd';
import { connect } from 'dva';
import MainLayout from './MainLayout';
import MailList from './MailList';
import MailContent from './MailContent';
import RelatedInfoPanel from './RelatedInfoPanel';
import CatalogManager from './CatalogManager';
import MailCatalogMenuSelect from './MailCatalogMenuSelect';
import Toolbar from '../../components/Toolbar';
import ActionButton from '../../components/ActionButton';
import Search from '../../components/Search';
import ImgIcon from '../../components/ImgIcon';
import EditMailPanel from './page/EditMailPanel';
import SendMailSuccess from './page/SendMailSuccess';
import MailDetailPanel from './page/MailDetailPanel';
import { treeForEach } from '../../utils';

class Mails extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      height: document.body.clientHeight
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/toggleSider', payload: true });
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight
    });
  }

  componentWillReceiveProps(nextProps) {

  }

  onAction = type => {
    const { mailSelected } = this.props;
    if (type === 'editMail') {
      this.props.openEditMail(type);
      return;
    }
    if (!mailSelected.length) {
      return message.error('请选择邮件');
    }
    if (type === 'replay' || type === 'replay-attach' || type === 'reply-all' || type === 'replay-all-attach' || type === 'send' || type === 'send-attach') {
      if (mailSelected.length === 1) {
        this.props.openEditMail(type);
        return;
      } else {
        return message.warning('请选择一封邮件进行操作');
      }
    }
    switch (type) {
      case 'delete':
        Modal.confirm({
          title: '确定要删除选中的邮件吗？',
          onOk: () => {
            this.props.delMails(mailSelected);
          }
        });
        break;
      case 'delete-completely':
        Modal.confirm({
          title: '确定要彻底删除选中的邮件吗？',
          onOk: () => {
            this.props.delMails(mailSelected, true);
          }
        });
        break;
      case 'mark-read':
        this.props.markMails(mailSelected, 3);
        break;
      case 'mark-unread':
        this.props.markMails(mailSelected, 2);
        break;
      case 'mark-stared':
        this.props.markMails(mailSelected, 1);
        break;
      case 'mark-unstared':
        this.props.markMails(mailSelected, 0);
        break;
      default:
        console.error('Matching error');
    }
  };

  handleMoveMail = catalogId => {
    const { mailSelected } = this.props;
    if (!mailSelected.length) {
      return message.error('请选择邮件');
    }
    this.props.moveMails(mailSelected, catalogId);
  };

  renderMidtop = () => {
    const styl = {
      position: 'relative',
      minWidth: '860px',
      minHeight: '100%',
      paddingBottom: '40px'
    };
    const { myCatalogData, selectedCatalogNode: cat, mailSearchKey } = this.props;
    const catName = cat ? cat.recname : '--';
    const renderOverlay = dropdownCallback => (
      <div style={{
        background: '#fff',
        boxShadow: '0 1px 6px rgba(0, 0, 0, 0.2)',
        borderRadius: '3px',
        maxHeight: '400px',
        maxWidth: '200px',
        overflow: 'auto',
        padding: '0 15px 0 10px'
      }}>
        <MailCatalogMenuSelect
          catalogData={myCatalogData}
          onSelect={catalogId => { dropdownCallback(); this.handleMoveMail(catalogId); }}
        />
      </div>
    );
    return (
      <div style={styl}>
        <Toolbar style={{ paddingTop: '10px', paddingLeft: '10px' }}>
          <ActionButton icon="write" actions="editMail" onAction={this.onAction}>写信</ActionButton>
          <ActionButton
            icon="reply"
            actions={[
              { key: 'replay', label: '回复', isDefault: true },
              { key: 'replay-attach', label: '回复(带附件)' }
            ]}
            onAction={this.onAction}
          >
            回复
          </ActionButton>
          <ActionButton
            icon="reply-all"
            actions={[
              { key: 'reply-all', label: '全部回复', isDefault: true },
              { key: 'replay-all-attach', label: '全部回复(带附件)' }
            ]}
            onAction={this.onAction}
          >
            全部回复
          </ActionButton>
          <ActionButton
            icon="send"
            actions={[
              { key: 'send', label: '转发', isDefault: true },
              { key: 'send-attach', label: '转发(带附件)' }
            ]}
            onAction={this.onAction}
          >
            转发
          </ActionButton>
          <ActionButton icon="share-g" actions="share" onAction={this.onAction}>内部分发</ActionButton>
          <ActionButton icon="delete" actions="delete" onAction={this.onAction}>删除</ActionButton>
          <ActionButton icon="delete-danger" actions="delete-completely" onAction={this.onAction}>彻底删除</ActionButton>
          <ActionButton icon="transfer" actions="transfer" onAction={this.onAction}>转移</ActionButton>
          <ActionButton
            icon="mark"
            actions={[
              { key: 'mark-read', label: '已读邮件' },
              { key: 'mark-unread', label: '未读邮件' },
              { key: 'mark-stared', label: '星标邮件' },
              { key: 'mark-unstared', label: '取消星标' }
            ]}
            onAction={this.onAction}
          >
            标记为
          </ActionButton>
          <ActionButton icon="folder-move" actions={[]} onAction={this.onAction} renderOverlay={renderOverlay}>移动到</ActionButton>
        </Toolbar>
        <Toolbar style={{ paddingLeft: '10px', paddingRight: '30px' }}>
          <span>{catName}</span>
          {!!cat && <span>(未读 {cat.unreadcount} 封)</span>}
          <Toolbar.Right>
            <Search
              mode="icon"
              placeholder={`搜索 ${catName}`}
              value={mailSearchKey}
              onSearch={val => this.props.search({ mailSearchKey: val })}
            />
            <ImgIcon name="refresh" onClick={this.props.refreshList} style={{ marginLeft: '8px', height: '20px' }} />
          </Toolbar.Right>
        </Toolbar>
        <MailList />
      </div>
    );
  };

  renderMidbottom = () => {
    return (
      <div>
        <MailContent
          isPreview
          data={this.props.mailDetailData}
          onShowDetail={this.props.showMailDetail}
        />
      </div>
    );
  };

  getTransformReceivers(data) {
    let returnString = '';
    data && data instanceof Array && data.map((item) => {
      returnString += item.displayname + " '&nbsp; &lt;'" + item.mailaddress + "'&gt;";
    });

    return returnString;
  }

  getInitMailContent() {
    if (this.props.showingModals === 'editMail') {
      return '';
    }

    const { mailSelected } = this.props;
    let mailbody = '';
    let senttime = '';
    let sender = {};
    let title = '';
    let receivers = '';
    let ccers = '';

    if (mailSelected && mailSelected instanceof Array && mailSelected.length === 1) {
      senttime = mailSelected[0].senttime;
      sender = mailSelected[0].sender;
      title = mailSelected[0].title;
      mailbody = mailSelected[0].mailbody;
      receivers = this.getTransformReceivers(mailSelected[0].receivers);
      ccers = this.getTransformReceivers(mailSelected[0].ccers);
    }

    let initHtmlString = '<br/><br/><br/><br/><br/><br/>' +
      '<div style="background: #f2f2f2; padding: 10px">' +
      '<h4><span style="font-size:12px"></span></h4>' +
      '<h4><span style="font-size:12px"></span></h4>' +
      '<h4 style="white-space: normal;">-------------------<span style="font-size:12px">原始邮件</span>-------------------</h4>' +
      '<h4><span style="font-size:12px"></span>' +
      '<span style="font-size:12px"><strong>发件人: </strong>&quot;' + sender.displayname + '&nbsp; &lt;' + sender.mailaddress + '&gt;&quot;;<br/></span>' +
      '<span style="font-size:12px"><strong>发送时间: </strong>' + senttime + '<br/></span>' +
      '<span style="font-size:12px"><strong>收件人: </strong>&quot;' + receivers + ';<br/></span>';

    if (ccers) {
      initHtmlString += '<span style="font-size:12px"><strong>抄送: </strong>&quot;' + ccers + ';<br/></span>';
    }
    initHtmlString += '<span style="font-size:12px"><strong>主题:</strong> ' + title + '</span><br/></h4></div>';

    initHtmlString += mailbody;
    return initHtmlString;
  }

  render() {
    return (
      <div style={{ height: this.state.height - 60, padding: '10px 10px 0' }}>
        <MainLayout
          left={<CatalogManager />}
          right={<RelatedInfoPanel />}
          midtop={this.renderMidtop()}
          midbottom={this.renderMidbottom()}
        />
        <EditMailPanel type={this.props.showingModals} initContent={this.getInitMailContent()} />
        <SendMailSuccess visible={this.props.showingModals === 'sendMailSuccess' ? true : false} />
        <MailDetailPanel />
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      openEditMail(showModalsName) {
        dispatch({ type: 'mails/showModals', payload: showModalsName });
      },
      delMails(mails, completely) {
        dispatch({ type: 'mails/delMails', payload: { mails, completely } });
      },
      moveMails(mails, catalogId) {
        dispatch({ type: 'mails/moveMails', payload: { mails, catalogId } });
      },
      markMails(mails, mark) {
        dispatch({ type: 'mails/markMails', payload: { mails, mark } });
      },
      showMailDetail(mail) {
        dispatch({ type: 'mails/showMailDetail', payload: mail });
      },
      search(searchObj) {
        dispatch({ type: 'mails/search', payload: searchObj });
      },
      refreshList() {
        dispatch({ type: 'mails/queryMailList' });
      },
      dispatch
    };
  }
)(Mails);

