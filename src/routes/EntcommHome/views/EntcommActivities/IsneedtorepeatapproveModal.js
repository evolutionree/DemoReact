import React, { Component } from 'react'
import { Modal, Radio, message } from 'antd'
import { dynamicRequest } from '../../../../services/common'

class IsneedtorepeatapproveModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentValue: 1,
      loading: false
    }
  }

  onChange = (e) => this.setState({ currentValue: e.target.value })

  onOk = () => {
    const { entityId, flowId, onOk, onCancel, cancelDetail, dataModel } = this.props
    const { currentValue } = this.state

    if (onOk && currentValue === 1) {
      if (onCancel) onCancel()
      return onOk()
    }

    const params = {
      entityid: entityId,
      flowid: flowId,
      entitymodel: dataModel
    }

    this.setState({ loading: true })
    dynamicRequest('/api/workflow/repeatapprove', params).then(res => {
      const { error_msg } = res

      this.setState({ loading: false })
      if (onCancel) onCancel()
      if (cancelDetail) cancelDetail()
      message.success(error_msg || "操作成功")
    }).catch(e => {
      this.setState({ loading: false })
      console.error(e.message)
      message.error(e.message)
    })
  }

  render() {
    const { title = '流程选择', visible, onCancel, zIndex = 1001 } = this.props
    const { currentValue, loading } = this.state

    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        zIndex={zIndex}
        confirmLoading={loading}
      >
        <Radio.Group onChange={this.onChange} value={currentValue}>
          <Radio value={1}>重新发起</Radio>
          <Radio value={2}>从上次审批不通过的节点开始</Radio>
        </Radio.Group>
      </Modal>
    )
  }
}

export default IsneedtorepeatapproveModal
