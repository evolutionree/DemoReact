import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, message } from 'antd';
import Toolbar from '../../components/Toolbar';
import ActionButton from '../../components/ActionButton';
import MailCatalogMenuSelect from './MailCatalogMenuSelect';

class MailActionBar extends Component {
  static propTypes = {
    mails: PropTypes.array,
    style: PropTypes.object
  };
  static defaultProps = {
    style: {}
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onAction = type => {
    if (type === 'signature') {
      this.props.showModals('mailSignature');
      return;
    }
    const mailSelected = this.props.mails;
    const hasDeptCatalogMail = mailSelected.some(item => item.catalogtype === 'dept');
    const isDistributedMail = mailSelected.some(item => item.ctype === 1009);
    const isDraftMail = mailSelected.some(item => item.ctype === 1005);
    const isDeletedMail = mailSelected.some(item => item.ctype === 1006);
    if (type === 'editMail') return this.props.openEditMail(type, mailSelected, '');
    if (!mailSelected.length) return message.error('请选择邮件');
    // 草稿箱只允许删除
    if (isDraftMail && type !== 'delete' && type !== 'delete-completely') {
      return message.error('无法对草稿箱的邮件执行此项操作');
    }
    // 已删除的邮件只能移动、恢复、彻底删除
    if (isDeletedMail && type === 'delete') {
      return message.error('邮件已删除');
    }
    if (isDeletedMail && type !== 'recover' && type !== 'delete-completely') {
      return message.error('无法对已删除的邮件执行此项操作');
    }
    if (type === 'replay' || type === 'replay-attach' || type === 'reply-all' || type === 'replay-all-attach' || type === 'send' || type === 'send-attach') {
      if (hasDeptCatalogMail) return message.error('只能对属于自己的邮件执行此项操作');
      if (isDistributedMail) return message.error('无法对内部分发的邮件执行此项操作');
      if (mailSelected.length === 1) return this.props.openEditMail(type, mailSelected, mailSelected[0].mailid);
      return message.warning('请选择一封邮件进行操作');
    }
    if (hasDeptCatalogMail) return message.error('只能对属于自己的邮件执行此项操作');
    if (type === 'distribute') return this.props.showModals('distributeMails', mailSelected);
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
      case 'recover':
        if (mailSelected.some(item => item.ctype !== 1006)) {
          return message.error('只能恢复已删除的邮件');
        }
        this.props.recoverMails(mailSelected);
        break;
      default:
        console.error('Matching error');
    }
  };

  handleMoveMail = catalogId => {
    const { mails } = this.props;
    if (!mails.length) {
      return message.error('请选择邮件');
    }
    if (mails.some(item => item.catalogtype === 'dept')) {
      return message.error('只能对属于自己的邮件执行此项操作');
    }
    if (mails.some(item =>item.ctype === 1003)) return message.error('不能移动此文件夹的邮件');
    if (mails.some(item =>item.ctype === 1008)) return message.error('不能移动此文件夹的邮件');
    if (mails.some(item =>item.ctype === 1009)) return message.error('不能移动此文件夹的邮件');
    if (mails.some(item =>item.ctype === 1005)) return message.error('不能移动此文件夹的邮件');
    if (mails.some(item =>item.ctype === 1002)) return message.error('不能移动此文件夹的邮件'); // 未读邮件目录
    if (mails.some(item =>item.ctype === 1006)) return message.error('不能移动此文件夹的邮件');
    this.props.moveMails(mails, catalogId);
  };

  render() {
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
          catalogData={this.props.myCatalogDataAll}
          onSelect={catalogId => { dropdownCallback(); this.handleMoveMail(catalogId); }}
        />
      </div>
    );
    return (
      <Toolbar style={{ paddingTop: '10px', paddingLeft: '10px', ...this.props.style }}>
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
        <ActionButton icon="share-g" actions="distribute" onAction={this.onAction}>内部分发</ActionButton>
        <ActionButton icon="delete" actions="delete" onAction={this.onAction}>删除</ActionButton>
        <ActionButton icon="delete-danger" actions="delete-completely" onAction={this.onAction}>彻底删除</ActionButton>
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
        <ActionButton icon="recover" actions="recover" onAction={this.onAction}>恢复</ActionButton>
        <ActionButton icon="recover" actions="signature" onAction={this.onAction}>签名</ActionButton>
      </Toolbar>
    );
  }
}

export default connect(
  state => {
    return {
      myCatalogDataAll: state.mails.myCatalogDataAll
    };
  },
  dispatch => {
    return {
      openEditMail(showModalsName, mails, currentMailId) {
        dispatch({ type: 'mails/putState',
          payload: { showingPanel: showModalsName, modalMailsData: mails } });
        dispatch({ type: 'mails/openNewTab',
          payload: { tabType: 2, showingPanel: showModalsName, mailId: currentMailId, modalMailsData: mails } });
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
      recoverMails(mails) {
        dispatch({ type: 'mails/recoverMails', payload: mails });
      },
      showModals(modalName, mails) {
        dispatch({ type: 'mails/putState', payload: { modalMailsData: mails } });
        dispatch({ type: 'mails/showModals', payload: modalName });
      }
    };
  }
)(MailActionBar);

