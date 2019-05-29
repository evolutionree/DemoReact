import React, { PropTypes, Component } from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'dva';
import CodeEditor from '../../../../components/CodeEditor';
import DynamicLoadModal from '../../../../components/Modal/DynamicLoadModal';
import HistoryModal from '../../../../components/Modal/HistoryModal';

const SPACENAME = 'entityFields';

class ExpandJSModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      expandJS: '',
      visibleHistory: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { expandJSType, editingRecord } = nextProps;
      this.setState({
        expandJS: expandJSType ? editingRecord.filterJS : editingRecord.expandJS
      });
    } else if (isClosing) {
      this.setState({ expandJS: '' });
    }
  }

  handleOk = () => {
    const params = {
      expandJS: this.state.expandJS,
      fieldId: this.props.editingRecord.fieldId,
      type: this.props.expandJSType
    };
    this.props.save(params, this.props.onCancel);
  };

  onExpandJSChange = val => {
    this.setState({ expandJS: val });
  };

  onShow = () => {
    this.setState({ visibleHistory: true });
  }

  handleCancel = () => {
    this.setState({ visibleHistory: false });
  }

  render() {
    const { 
      expandJSType, visible, onCancel, modalPending,
      initParams, showModals
    } = this.props;
    const { visibleHistory } = this.state;

    const title = '6666';
    const value = '6666';
    const orig = '6666';
    const allScripts = [];

    return (
      <Modal
        title={expandJSType ? '配置过滤脚本' : '配置脚本'}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={modalPending}
        wrapClassName="code-editor-modal"
        width={750}
        footer={[
          <Button key="history" onClick={this.onShow}>历史纪录</Button>,
          <Button key="back" onClick={onCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>
        ]}
      >
        <CodeEditor
          value={this.state.expandJS}
          onChange={this.onExpandJSChange}
        />
        <DynamicLoadModal
          width={'90%'}
          title={title}
          value={value}
          orig={orig}
          spaceName={SPACENAME}
          showModals={showModals}
          allScripts={allScripts}
          initParams={initParams}
          visible={visibleHistory}
          cancel={() => this.handleCancel}
          WrapComponent={HistoryModal}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, visible, modalPending, editingRecord } = state[SPACENAME];
    return {
      modalPending,
      editingRecord,
      showModals,
      visible: /ExpandJSModal$/.test(visible),
      expandJSType: /filter$/.test(visible) ? 1 : 0
    };
  },
  dispatch => {
    return {
      save(params, callback) {
        dispatch({ type: `${SPACENAME}/saveExpandJS`, payload: { params, callback } });
      }
    };
  }
)(ExpandJSModal);

