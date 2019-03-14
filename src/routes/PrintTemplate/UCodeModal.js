import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import CodeEditor from '../../components/CodeEditor';

const NAMESPACE = 'printTemplate';

class UCodeModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      title: '配置U-Code',
      configJS: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { currentObj } = nextProps;
      this.setState({
        configJS: currentObj.extjs // 设置值
      });
    } else if (isClosing) {
      this.setState({ configJS: '' });
    }
  }

  handleOk = () => {
    const { save, currentObj } = this.props;
    const { configJS } = this.state;
    const ucode = configJS;
    const recid = currentObj.recid;
    if (!(ucode && recid)) {
      message.info('缺少必要参数');
      return;
    }
    const params = { ucode, recid };
    save(params);
  };

  onConfigJSChange = val => {
    this.setState({ configJS: val });
  };

  render() {
    const { visible, cancel, modalPending } = this.props;
    const { title, configJS } = this.state;
    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
        confirmLoading={modalPending}
        wrapClassName="code-editor-modal"
        width={750}
      >
        <CodeEditor
          value={configJS}
          onChange={this.onConfigJSChange}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending, currentItems } = state[NAMESPACE];
    return {
      modalPending,
      currentObj: currentItems.length ? currentItems[0] : {},
      visible: /UCodeModal/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: `${NAMESPACE}/showModals`, payload: '' });
      },
      save(payload) {
        dispatch({ type: `${NAMESPACE}/saveconfigJS`, payload });
      }
    };
  }
)(UCodeModal);

