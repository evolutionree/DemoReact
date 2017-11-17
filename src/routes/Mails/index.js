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
import EditMailPanel from './page/EditMailPanel';
import MailDetailPanel from './page/MailDetailPanel';
import { treeForEach } from '../../utils';

class Mails extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/toggleSider', payload: true });
  }

  componentWillReceiveProps(nextProps) {

  }

  onAction = type => {
    const { mailSelected } = this.props;
    if (type === 'editMail') {
      this.props.openEditMail();
      return;
    }
    if (!mailSelected.length) {
      return message.error('请选择邮件');
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
    const { myCatalogData, selectedCatalogNode: cat, queries: { catalogType, searchKey } } = this.props;
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
          {cat ? (
            <span>{cat.recname} (未读 {cat.unreadcount} 封)</span>
          ) : (catalogType === 'dept' ? '下属邮箱' : '--')}
          <Toolbar.Right>
            <Search
              mode="icon"
              placeholder="输入标题搜索"
              value={searchKey}
              onSearch={val => this.props.search({ searchKey: val })}
            />
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

  render() {
    return (
      <div style={{ height: 'calc(100vh - 60px)', padding: '10px 10px 0' }}>
        <MainLayout
          left={<CatalogManager />}
          right={<RelatedInfoPanel />}
          midtop={this.renderMidtop()}
          midbottom={this.renderMidbottom()}
        />
        <EditMailPanel visible={this.props.showingModals === 'editMailPanel' ? true : false} />
        <MailDetailPanel />
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      openEditMail() {
        dispatch({ type: 'mails/showModals', payload: 'editMailPanel' });
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
      dispatch
    };
  }
)(Mails);

