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
    this.props.save(params, this.props.onCancel);
  };

  onExpandJSChange = val => {
    this.setState({ expandJS: val });
  };

  render() {
    const { 
      expandJSType, visible, onCancel, modalPending, editingRecord,
      initParams, showModals, historyList, toggleHistory, fetchDataLoading
    } = this.props;

    const { expandJS } = this.state;

    const title = editingRecord ? editingRecord.fieldlabel : '(空)';
    const origRight = editingRecord ? (expandJSType ? editingRecord.filterJS : editingRecord.expandJS) : '';
    const allScripts = [];

    return (
      <Modal
        title={expandJSType ? '配置过滤脚本' : '配置脚本'}
        visible={!!visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={modalPending}
        wrapClassName="code-editor-modal"
        width={750}
        footer={[
          <Button key="history" onClick={() => toggleHistory('HistoryModal')}>历史纪录</Button>,
          <Button key="back" onClick={onCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>
        ]}
      >
        <CodeEditor
          value={expandJS}
          onChange={this.onExpandJSChange}
        />
        {
          showModals && showModals.HistoryModal ? <DynamicLoadModal
            width={1120}
            title={title}
            value={expandJS}
            origRight={origRight}
            rowKey="id"
            recid={editingRecord.fieldId}
            keyname={visible === 'filter' ? 'EntityFieldFilter' : 'EntityFieldChange'}
            spaceName={SPACENAME}
            historyList={historyList}
            showModals={showModals}
            allScripts={allScripts}
            detailapi="api/entitypro/getucodedetail"
            initParams={initParams}
            visible={showModals && showModals.HistoryModal}
            listLoading={fetchDataLoading && fetchDataLoading.HistoryModal}
            WrapComponent={HistoryModal}
          /> : null
        }
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, ...rest } = state[SPACENAME];
    return {
      ...rest,
      showModals,
      visible: showModals.ExpandJSModal,
      expandJSType: /filter$/.test(showModals.ExpandJSModal) ? 1 : 0
    };
  },
  dispatch => {
    return {
      save(params, callback) {
        dispatch({ type: `${SPACENAME}/saveExpandJS`, payload: { params, callback } });
      },
      toggleHistory(payload) {
        dispatch({ type: `${SPACENAME}/showHistoryModal`, payload });
      }
    };
  }
)(ExpandJSModal);

