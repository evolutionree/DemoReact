import React, { PropTypes, Component } from 'react';
import { Button, Modal, message } from 'antd';
import { connect } from 'dva';
import CatalogManager from './CatalogManager';
import SendMailSuccess from './page/SendMailSuccess';
import DistributeMailsModal from './component/DistributeMailsModal';
import TransferCatalogModal from './component/TransferCatalogModal';
import MailSignatureModal from './MailSignatureModal';
import MailTabs from './component/MailTabs';

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
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    this.setState({
      height: document.body.clientHeight
    });
  }

  render() {
    return (
      <div style={{ height: this.state.height - 60, padding: '10px 10px 0', minWidth: '700px', overflow: 'auto' }}>
        <CatalogManager />
        <MailTabs />
        <SendMailSuccess visible={this.props.showingPanel === 'sendMailSuccess'} />
        <DistributeMailsModal />
        <TransferCatalogModal />
        <MailSignatureModal />
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

