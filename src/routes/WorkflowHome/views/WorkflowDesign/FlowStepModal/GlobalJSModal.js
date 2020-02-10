import React, { PropTypes, Component } from 'react'
import { connect } from 'dva'
import { Modal, Button } from 'antd'
import CodeEditor from '../../../../../components/CodeEditor'
import DynamicLoadModal from '../../../../../components/Modal/DynamicLoadModal'
import HistoryModal from '../../../../../components/Modal/HistoryModal'

const NAMESPACE = 'jshistory'

class GlobalJSModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: props.value || ''
    }
  }

  // componentDidMount() {
  //   const { onInit, initParams, otherParams = {} } = this.props;
  //   onInit({ ...initParams, ...otherParams });
  // }

  componentWillReceiveProps(nextProps) {
    const { value: oldValue } = this.props
    const { value: newValue } = nextProps

    if (oldValue !== newValue) this.setState({ currentValue: value })
  }

  handleChange = (currentValue) => this.setState({ currentValue })

  handleOk = () => {
    const { onOk, onChange } = this.props
    const { currentValue } = this.state

    if (onChange) onChange(currentValue)
    if (onOk) onOk()
  }

  render() {
    const {
      visible, onCancel, value, initParams, otherParams = {},
      showModals, list, fetchDataLoading, toggleModal, flowName
    } = this.props

    const { currentValue } = this.state

    const origRight = value || ''

    return (
      <Modal
        title="全局JS"
        visible={visible}
        onCancel={onCancel}
        wrapClassName="code-editor-modal"
        width={750}
        footer={[
          <Button key="history" onClick={() => toggleModal(showModals, 'HistoryModal')}>历史纪录</Button>,
          <Button key="back" onClick={onCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>
        ]}
      >
        <CodeEditor value={currentValue} onChange={this.handleChange} />
        {
          (showModals && showModals.HistoryModal) ? <DynamicLoadModal
            width={1120}
            title={flowName}
            value={currentValue}
            origRight={origRight}
            rowKey="id"
            keyname="WorkFlowJS"
            spaceName={NAMESPACE}
            historyList={list}
            showModals={showModals}
            detailapi="api/entitypro/getucodedetail"
            initParams={{ ...initParams, ...otherParams }}
            onCancel={toggleModal.bind(this, showModals, 'HistoryModal', '')}
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
    return {
      ...state[NAMESPACE],
      flowName: `审批流程 - ${state.workflowHome.flowName || '(空)'}`
    }
  },
  dispatch => ({
    onInit(params) {
      dispatch({ type: `${NAMESPACE}/Init`, payload: params });
    },
    toggleModal(showModals, modal, action) {
      dispatch({ type: `${NAMESPACE}/showModals`, payload: { ...showModals, [modal]: (action === undefined ? modal : action) } });
    },
    onDel(params) {
      dispatch({ type: `${NAMESPACE}/Del`, payload: params });
    },
    onSeach(params) {
      dispatch({ type: `${NAMESPACE}/Search`, payload: params });
    },
    onSelectRow(selectedRows) {
      dispatch({ type: `${NAMESPACE}/putState`, payload: { selectedRows } });
    },
    dispatch
  })
)(GlobalJSModal)
