import React, { PropTypes, Component } from 'react';
import { Modal, Input } from 'antd';
import { connect } from 'dva';
import CodeEditor from '../../../../components/CodeEditor';

class ExpandJSModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      expandJS: ''
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
    this.props.save(params);
  };

  onExpandJSChange = val => {
    this.setState({ expandJS: val });
  };

  render() {
    return (
      <Modal
        title={this.props.expandJSType ? '配置过滤脚本' : '配置脚本'}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.cancel}
        confirmLoading={this.props.modalPending}
        wrapClassName="code-editor-modal"
        width={750}
      >
        {/*<Input*/}
          {/*type="textarea"*/}
          {/*value={this.state.expandJS}*/}
          {/*onChange={e => this.setState({ expandJS: e.target.value })}*/}
          {/*autosize={{ minRows: 4, maxRows: 25 }}*/}
          {/*placeholder="请输入js脚本"*/}
        {/*/>*/}
        <CodeEditor
          value={this.state.expandJS}
          onChange={this.onExpandJSChange}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending, editingRecord } = state.entityFields;
    return {
      modalPending,
      editingRecord,
      visible: /expandJS/.test(showModals),
      expandJSType: /expandJS-filter/.test(showModals) ? 1 : 0
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entityFields/hideModal' });
      },
      save(payload) {
        dispatch({ type: 'entityFields/saveExpandJS', payload });
      }
    };
  }
)(ExpandJSModal);

