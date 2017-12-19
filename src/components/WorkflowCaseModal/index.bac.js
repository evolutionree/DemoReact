import React, { PropTypes, Component } from 'react';
import { Modal, Form, message, Button } from 'antd';
import { queryNextNodeData, submitCaseItem } from '../../services/workflow';
import WorkflowCaseForm from './WorkflowCaseForm';

class WorkflowCaseModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    caseId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]),
    caseData: PropTypes.object, // 需要提交到下一节点的数据
    choiceStatus: PropTypes.oneOf([0, 1, 2, 3, 4]), // 审批操作类型，0拒绝 1通过 2退回 3中止 4编辑发起
    suggest: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  };
  static defaultProps = {
    choiceStatus: 4,
    suggest: ''
  };

  form = {};

  constructor(props) {
    super(props);
    this.state = {
      nextNodes: [], // [{ nodeinfo, approvers }] 会有多个节点(分支)
      selectedNode: null, // 保存选中的nextNodes元素
      modalPending: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.props.form.resetFields();
      this.fetchNextNodeData(nextProps.caseId).then((nextNodeData) => {
        this.setState({
          nextNodes: nextNodeData,
          selectedNode: nextNodeData[0]
        }, () => {
          if (this.checkFlowIsEnd(nextNodeData)) {
            // this.props.onDone();
            this.submitDirectly();
            return;
          }
        });
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.form.resetFields();
    this.setState({
      nextNodes: [],
      selectedNode: null,
      modalPending: false
    });
  };

  fetchNextNodeData = caseId => {
    const _caseId = typeof caseId === 'string' ? caseId : caseId[0];
    return queryNextNodeData(_caseId).then(result => result.data);
  };

  // 根据node数据，检查流程是否结束
  checkFlowIsEnd = nextNodes => {
    return nextNodes[0].nodeinfo.nodestate === 2;
  };

  getCaseData = () => {
    return this.props.caseData || { data: [] };
  };

  onOk = () => {
    this.form.validateFields((err, values) => {
      if (err) return;

      const params = {
        caseid: this.props.caseId,
        nodeid: this.state.selectedNode.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000',
        nodenum: this.state.selectedNode.nodeinfo.nodenum,
        choiceStatus: this.props.choiceStatus,
        suggest: this.props.suggest,
        handleuser: values.handleuser.join(','),
        copyuser: values.copyuser.join(','),
        // reamark: values.reamark,
        casedata: this.getCaseData()
      };
      this.setState({ modalPending: true });
      // TODO addCaseItemMultiple
      // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
      submitCaseItem(params).then(result => {
        this.setState({ modalPending: false });
        message.success('提交成功');
        this.props.onDone(result);
      }, err => {
        message.error(err.message || '提交审批数据失败');
        this.setState({ modalPending: false });
      });
    });
  };

  // 不用选审批人，直接提交数据
  submitDirectly = () => {
    const params = {
      caseid: this.props.caseId,
      nodeid: this.state.selectedNode.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000',
      nodenum: this.state.selectedNode.nodeinfo.nodenum,
      choiceStatus: this.props.choiceStatus,
      suggest: this.props.suggest,
      handleuser: '',
      copyuser: '',
      // reamark: values.reamark,
      casedata: this.getCaseData()
    };
    this.setState({ modalPending: true });
    // TODO addCaseItemMultiple
    // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
    submitCaseItem(params).then(result => {
      this.setState({ modalPending: false });
      message.success('提交成功');
      this.props.onDone(result);
    }, err => {
      message.error(err.message || '提交审批数据失败');
      this.setState({ modalPending: false });
    });
  };

  onCloseFlow = () => {
    this.setState({ modalPending: true });
    const params = {
      caseid: this.props.caseId,
      nodenum: -1,
      suggest: '',
      ChoiceStatus: 1
    };
    submitCaseItem(params).then(result => {
      this.setState({ modalPending: false });
      this.props.onDone(result);
    }, err => {
      message.error(err.message || '关闭流程失败');
      this.setState({ modalPending: false });
    });
  };

  onSelectedNodeChange = selectedNode => {
    this.setState({ selectedNode });
  };

  render() {
    const { nodeinfo = {} } = this.state.selectedNode || {};
    const footer = [
      <Button key="cancel" onClick={this.props.onCancel}>取消</Button>,
      <Button key="ok" onClick={this.onOk}>确定</Button>
    ];
    if (nodeinfo.flowtype === 0) { // 自由流程
      footer.push(<Button key="custom" onClick={this.onCloseFlow}>关闭流程</Button>);
    }
    return (
      <Modal
        title={nodeinfo.nodename || '选择审批和抄送人'}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
        footer={footer}
      >
        <WorkflowCaseForm
          ref={ref => this.form = ref}
          caseNodes={this.state.nextNodes}
          selectedNode={this.state.selectedNode}
          onSelectedNodeChange={this.onSelectedNodeChange}
        />
      </Modal>
    );
  }
}

export default Form.create()(WorkflowCaseModal);
