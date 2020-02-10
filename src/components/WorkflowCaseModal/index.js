import React, { PropTypes, Component } from 'react'
import { Modal, Checkbox, message, Button } from 'antd'
import { submitCaseItem, submitPreCaseItem } from '../../services/workflow'
import { dynamicRequest } from '../../services/common'
import SelectUser from '../../components/DynamicForm/controls/SelectUser'
import WorkflowCaseForm from './WorkflowCaseForm'

export WorkflowCaseForAddModal from './WorkflowCaseForAddModal'

// export WorkflowCaseForAddModal = WorkflowCaseForAddModal;

// 1. 预提交审批 => 提交审批(不用选审批人) => resolve
// 2. 预提交审批 => 弹出审批选人界面(需要选审批人) => resolve
// nodestate // -1已结束 0下一步审批 1会审等待 2到达结束(将直接提交审批，然后返回提交成功200/失败201)
export function autoSubmitCaseItem({
  caseid,
  nodenum = 0,
  choicestatus = 4,
  suggest = '',
  casedata,
  files
}) {
  const params = {
    caseid,
    nodenum,
    choicestatus,
    suggest,
    casedata,
    files
  }
  // 预提交
  return submitPreCaseItem(params).then(result => {
    const { approvers, cpusers, nodeinfo } = result.data
    // 判断是否需要选人，不需要则提交审批
    if (nodeinfo.nodestate === -1) {
      return {}
    } else if (nodeinfo.nodestate !== 0) {
      const nextParams = {
        ...params,
        nodeid: nodeinfo.nodeid
      }
      return submitCaseItem(nextParams).then(
        result => {
          return result
        },
        error => {
          throw error
        }
      )
    }
    return { approvers, cpusers, nodeinfo }
  })
}

class WorkflowCaseModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    caseId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    nodenum: PropTypes.number,
    caseData: PropTypes.object, // 需要提交到下一节点的数据
    choiceStatus: PropTypes.oneOf([-1, 0, 1, 2, 3, 4, 5, 6, 7]), // 审批操作类型，0拒绝 1通过 2退回 3中止 4编辑发起 5转办 6加签
    suggest: PropTypes.string,
    // nodeData: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  }
  static defaultProps = {
    choiceStatus: 4,
    suggest: ''
  }

  form = {}

  constructor(props) {
    super(props)
    this.state = {
      nodeData: null,
      modalPending: false,
      modalVisible: false,
      transferUser: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible
    const isClosing = this.props.visible && !nextProps.visible
    const { choiceStatus } = nextProps

    if (isOpening) {
      if (![5, 6].includes(choiceStatus)) {
        const params = {
          caseid: nextProps.caseId,
          nodenum: nextProps.nodenum || 0,
          choicestatus: nextProps.choiceStatus,
          suggest: nextProps.suggest || '',
          casedata: nextProps.caseData,
          files: nextProps.files || []
        }
        autoSubmitCaseItem(params).then(
          result => {
            const { approvers, cpusers, nodeinfo } = result
            if (approvers) {
              this.setState({
                nodeData: { approvers, cpusers, nodeinfo },
                modalVisible: true
              })
            } else {
              message.success('提交成功')
              this.props.onDone()
            }
          },
          err => {
            this.props.onCancel()
            message.error(err.message)
          }
        )
      } else {
        this.setState({ modalVisible: true })
      }
    } else if (isClosing) {
      this.resetState()
    }
  }

  resetState = () => {
    this.setState(
      {
        nodeData: null,
        modalPending: false,
        modalVisible: false
      },
      () => {
        this.form &&
          typeof this.form.resetFields === 'function' &&
          this.form.resetFields()
      }
    )
  }

  getCaseData = () => {
    return this.props.caseData
    // return this.props.caseData || { data: [] };
  }

  onOk = () => {
    this.form.validateFields((err, values) => {
      if (err) return

      const params = {
        caseid: this.props.caseId,
        nodeid: this.state.nodeData.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000',
        nodenum: this.state.nodeData.nodeinfo.nodenum,
        choiceStatus: this.props.choiceStatus,
        suggest: this.props.suggest,
        handleuser: [...new Set(values.handleuser)].join(','),
        copyuser: [...new Set(values.copyuser)].join(','),
        // reamark: values.reamark,
        casedata: this.getCaseData(),
        files: this.props.files || []
      }
      this.setState({ modalPending: true })
      // TODO addCaseItemMultiple
      // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
      submitCaseItem(params).then(
        result => {
          this.setState({ modalPending: false })
          message.success('提交成功')
          this.props.onDone(result)
        },
        err => {
          message.error(err.message || '提交审批数据失败')
          this.setState({ modalPending: false })
        }
      )
    })
  }

  onTransferOk = () => {
    const { caseitemid, caseId, suggest, files, currentUser, isLunch, nodenum, nodeid, choiceStatus, nodetype, jointUsers, showNextSign, checkedSign } = this.props
    const { transferUser } = this.state

    if (!transferUser) return message.error(`请选择${choiceStatus === 5 ? '转办' : '加签'}人`)
    if (currentUser.userid === parseInt(transferUser, 10)) {
      this.setState({ transferUser: '' })
      return message.error(`请选择其他${choiceStatus === 5 ? '转办' : '加签'}人`)
    }
    if (nodetype === 1 && jointUsers.includes(parseInt(transferUser, 10))) {
      this.setState({ transferUser: '' })
      return message.error(`会审列表已存在该${choiceStatus === 5 ? '转办' : '加签'}人，请重新选择`)
    }
    this.setState({ modalPending: true })

    const params = {
      caseitemid,
      caseid: caseId,
      suggest,
      userid: transferUser,
      files,
      issignortransfer: choiceStatus === 5 ? 0 : 1
    }

    if (nodetype !== 2 && isLunch) {
      params.nodenum = nodenum
      params.choicestatus = 4
      params.copyuser = ''
      params.nodeid = nodeid
    }

    if (showNextSign) params.signstatus = checkedSign

    // console.log('onTransferOk', params)
    // return
    dynamicRequest('api/workflow/transfer', params).then(res => {
      const { error_msg } = res
      this.props.onDone()
      this.setState({ modalVisible: false, modalPending: false })
      message.success(error_msg || '操作成功')
    }).catch(e => {
      message.error(e.message || '操作失败')
      console.error(e.message || '操作失败')
      this.setState({ modalPending: false })
      this.props.onDone()
    })
  }

  // 不用选审批人，直接提交数据
  submitDirectly = () => {
    const params = {
      caseid: this.props.caseId,
      nodeid:
        this.state.selectedNode.nodeinfo.nodeid ||
        '00000000-0000-0000-0000-000000000000',
      nodenum: this.state.selectedNode.nodeinfo.nodenum,
      choiceStatus: this.props.choiceStatus,
      suggest: this.props.suggest,
      handleuser: '',
      copyuser: '',
      // reamark: values.reamark,
      casedata: this.getCaseData()
    }
    this.setState({ modalPending: true })
    // TODO addCaseItemMultiple
    // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
    submitCaseItem(params).then(
      result => {
        this.setState({ modalPending: false })
        message.success('提交成功')
        this.props.onDone(result)
      },
      err => {
        message.error(err.message || '提交审批数据失败')
        this.setState({ modalPending: false })
      }
    )
  }

  onCloseFlow = () => {
    this.setState({ modalPending: true })
    const params = {
      caseid: this.props.caseId,
      nodenum: -1,
      suggest: this.props.suggest || '',
      ChoiceStatus: 1
    }
    submitCaseItem(params).then(
      result => {
        this.setState({ modalPending: false })
        message.success('提交成功')
        this.props.onDone(result)
      },
      err => {
        message.error(err.message || '关闭流程失败')
        this.setState({ modalPending: false })
      }
    )
  }

  render() {
    const { choiceStatus, showNextSign } = this.props
    const { transferUser, modalPending } = this.state

    const { nodeinfo = {} } = this.state.nodeData || {}
    const footer = [
      <Button key='cancel' onClick={this.props.onCancel}>
        取消
      </Button>,
      <Button key='ok' loading={modalPending} onClick={![5, 6].includes(choiceStatus) ? this.onOk : this.onTransferOk}>
        确定
      </Button>
    ]
    if (nodeinfo.flowtype === 0) {
      // 自由流程
      footer.push(
        <Button key='custom' onClick={this.onCloseFlow}>
          关闭流程
        </Button>
      )
    }

    let title = nodeinfo.nodename || '选择审批和抄送人'

    if (choiceStatus === 5) title = '选择转办人'
    if (choiceStatus === 6) title = '选择加签人'

    return (
      <Modal
        title={title}
        visible={this.state.modalVisible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
        footer={footer}
      >
        {
          ![5, 6].includes(choiceStatus) ? (
            <WorkflowCaseForm
              ref={ref => (this.form = ref)}
              caseNodes={this.state.nodeData ? [this.state.nodeData] : []}
              selectedNode={this.state.nodeData}
              dataRange={1} // 获取全部人员
            />
          ) : (
              <SelectUser dataRange={1} value={transferUser} onChange={(transferUser) => this.setState({ transferUser })} />
            )
        }
      </Modal>
    )
  }
}

export default WorkflowCaseModal
