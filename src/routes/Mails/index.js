import React, { PropTypes, Component } from 'react';
import { Button, Modal, message } from 'antd';
import { connect } from 'dva';
import MainLayout from './MainLayout';
import MailList from './MailList';
import MailContent from './MailContent';
import RelatedInfoPanel from './RelatedInfoPanel';
import CatalogManager from './CatalogManager';
import MailActionBar from './MailActionBar';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import ImgIcon from '../../components/ImgIcon';
import EditMailPanel from './page/EditMailPanel';
import SendMailSuccess from './page/SendMailSuccess';
import MailDetailPanel from './page/MailDetailPanel';
import DistributeMailsModal from './component/DistributeMailsModal';
import TransferCatalogModal from './component/TransferCatalogModal';

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

  renderMidtop = () => {
    const styl = {
      position: 'relative',
      minWidth: '855px',
      minHeight: '100%',
      paddingBottom: '40px'
    };
    const { mailSelected, selectedCatalogNode: cat, mailSearchKey, mailTotal } = this.props;
    const catName = cat ? (cat.recname || cat.treename) : '--';
    return (
      <div style={styl}>
        <MailActionBar mails={mailSelected} />
        <Toolbar style={{ paddingLeft: '10px', paddingRight: '30px' }}>
          <span style={{ marginRight: '5px' }}>{catName}</span>
          {!!cat && <span>
            (共<span style={{ color: '#3499db' }}>{mailTotal}</span>封 / 未读<span style={{ color: '#ff6c68' }}>{cat.unreadcount}</span>封)
          </span>}
          <Toolbar.Right>
            <Search
              mode="icon"
              placeholder={`搜索 ${'主题' || catName}`}
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
    const { status, maildetail, mailInfo } = this.props.mailDetailData || {};
    const mailData = status === 'loaded' ? maildetail : mailInfo;
    return (
      <div>
        <MailContent
          isPreview
          data={mailData}
          onShowDetail={this.props.showMailDetail}
        />
      </div>
    );
  };

  render() {
    return (
      <div style={{ height: this.state.height - 60, padding: '10px 10px 0' }}>
        <MainLayout
          left={<CatalogManager />}
          right={<RelatedInfoPanel />}
          midtop={this.renderMidtop()}
          midbottom={this.renderMidbottom()}
        />
        <EditMailPanel type={this.props.showingPanel} mailId={this.props.currentMailId} />
        <SendMailSuccess visible={this.props.showingPanel === 'sendMailSuccess'} />
        <MailDetailPanel />
        <DistributeMailsModal />
        <TransferCatalogModal />
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      showMailDetail(mail) {
        dispatch({ type: 'mails/showMailDetail', payload: mail });
      },
      search(searchObj) {
        dispatch({ type: 'mails/search', payload: searchObj });
      },
      refreshList() {
        dispatch({ type: 'mails/queryMailList' });
      }
    };
  }
)(Mails);

