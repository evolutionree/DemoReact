import React, { PropTypes, Component } from 'react';
import { Modal, message, Form, Select } from 'antd'
import { connect } from 'dva';
import InputRichText from '../../components/DynamicForm/controls/InputRichText';
import { queryMailSignature, updateMailSignature } from '../../services/mails';


class MailSignatureModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      mailAccount: this.props.currentBoxId,
      signatureHtml: '',
      pending: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      let mailAccount = nextProps.currentBoxId;
      this.onMailAccountChange(mailAccount);
    }
  }

  onMailAccountChange = val => {
    this.setState({
      mailAccount: val,
      signatureHtml: ''
    }, () => {
      if (!this.state.mailAccount) return;
      queryMailSignature({ mailid: this.state.mailAccount }).then(result => {
        this.setState({
          signatureHtml: result.data || ''
        });
      }, err => {
        message.error(err.message || '获取签名失败');
      });
    });
  };

  handleOk = () => {
    if (!this.state.mailAccount) {
      message.error('请选择邮箱账号');
      return;
    }
    const params = {
      mailid: this.state.mailAccount,
      signature: this.state.signatureHtml
    };
    this.setState({ pending: true });
    updateMailSignature(params).then(result => {
      this.setState({ pending: false });
      message.success('设置签名成功');
      this.props.ok();
    }, err => {
      this.setState({ pending: false });
      message.error(err.message || '设置签名失败');
    });
  };

  render() {
    return (
      <Modal
        wrapClassName="ant-modal-custom-large"
        title="设置签名"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.cancel}
      >
        <Form>
          <Form.Item label="邮箱账号" required>
            <Select value={this.state.mailAccount} onChange={this.onMailAccountChange}>
              {this.props.mailBoxList.map(item => (
                <Select.Option key={item.recid}>{item.accountid}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="签名">
            <InputRichText
              value={this.state.signatureHtml}
              onChange={val => this.setState({ signatureHtml: val })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showingModals, mailBoxList, currentBoxId } = state.mails;
    return {
      visible: /mailSignature/.test(showingModals),
      mailBoxList: mailBoxList,
      currentBoxId
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'mails/showModals', payload: '' });
      },
      ok() {
        dispatch({ type: 'mails/showModals', payload: '' });
        dispatch({ type: 'mails/fetchMailboxlist' });
      }
    }
  }
)(MailSignatureModal);

