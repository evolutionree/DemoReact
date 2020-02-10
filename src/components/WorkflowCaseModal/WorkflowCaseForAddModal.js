import React, { PropTypes, Component } from 'react';
import { Modal, message, Button } from 'antd';
import { preAddCase, addCase } from '../../services/workflow';
import { addDocumentCase } from '../../services/document';
import WorkflowCaseForm from './WorkflowCaseForm';
import FlowChartViewer from '../../components/FlowChartViewer';

// 1. 预提交审批 => 提交审批(不用选审批人) => resolve
// 2. 预提交审批 => 弹出审批选人界面(需要选审批人) => resolve
// nodestate // -1已结束 0下一步审批 1会审等待 2到达结束(将直接提交审批，然后返回提交成功200/失败201)
export function autoAddCaseItem(isAddCase, dataModel) {
  const params = isAddCase ? {
    datatype: 1,
    casemodel: dataModel
  } : {
    datatype: 0,
    entitymodel: dataModel
  };
  // 预提交
  return preAddCase(params).then(result => {
    const { approvers, cpusers, nodeinfo } = result.data;
    // 判断是否需要选人，不需要则提交审批
    if (nodeinfo.nodestate !== 0) {
      const nextParams = {
        ...params,
        nodeid: nodeinfo.nodeid
      };
      return addCase(nextParams).then(result => {
        return result;
      }, error => {
        throw error;
      });
    }
    return { approvers, cpusers, nodeinfo };
  });
}

class WorkflowCaseForAddModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.any,
    isAddCase: PropTypes.bool,
    dataModel: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  };

  form = {};

  constructor(props) {
    super(props);
    this.state = {
      nodeData: null,
      modalPending: false,
      modalVisible: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { editPage } = nextProps;
    const isOpening = !this.props.visible && nextProps.visible && (editPage ? /^WorkflowCaseForAddModal$/.test(nextProps.visible) : true);
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { isAddCase, dataModel } = nextProps;
      autoAddCaseItem(isAddCase, dataModel).then(result => {
        const { approvers, cpusers, nodeinfo } = result;
        if (approvers) {
          this.setState({ nodeData: { approvers, cpusers, nodeinfo }, modalVisible: true });
        } else {
          message.success('提交成功');
          this.props.onDone();
        }
      }, err => {
        this.props.onCancel();
        message.error(err.message);
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      nodeData: null,
      modalPending: false,
      modalVisible: false
    }, () => {
      this.form && typeof this.form.resetFields === 'function' && this.form.resetFields();
    });
  };

  getCaseData = () => {
    return this.props.caseData;
    // return this.props.caseData || { data: [] };
  };

  onOk = () => {
    if (this.state.modalPending) return;
    this.form.validateFields((err, values) => {
      if (err) return;

      const { isAddCase, dataModel, isAddDocumentCase } = this.props;
      const params = {
        nodeid: this.state.nodeData.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000',
        handleuser: [...new Set(values.handleuser)].join(','),
        copyuser: [...new Set(values.copyuser)].join(',')
      };
      if (isAddCase) {
        params.datatype = 1;
        params.casemodel = dataModel;
      } else {
        params.datatype = 0;
        params.entitymodel = dataModel;
      }
      this.setState({ modalPending: true });
      // TODO addCaseItemMultiple
      // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
      const fun = isAddDocumentCase ? addDocumentCase : addCase;
      fun(params).then(result => {
        this.setState({ modalPending: false });
        message.success('提交成功');
        this.props.onDone(result);
      }, err => {
        message.error(err.message || '提交审批数据失败');
        this.setState({ modalPending: false });
      });
    });
  };

  render() {
    const { zIndex = 1000, dataModel = {} } = this.props;
    const { nodeinfo = {} } = this.state.nodeData || {};
    const footer = [
      <FlowChartViewer key={dataModel.flowid} flowId={dataModel.flowid} />,
      <Button key="cancel" onClick={this.props.onCancel}>取消</Button>,
      <Button key="ok" onClick={this.onOk} loading={this.state.modalPending}>确定</Button>
    ];
    return (
      <Modal
        title={nodeinfo.nodename || '选择审批和抄送人'}
        visible={this.state.modalVisible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
        footer={footer}
        zIndex={zIndex}
      >
        <WorkflowCaseForm
          ref={ref => this.form = ref}
          caseNodes={this.state.nodeData ? [this.state.nodeData] : []}
          selectedNode={this.state.nodeData}
          dataRange={1} // 获取全部人员
        />
      </Modal>
    );
  }
}

export default WorkflowCaseForAddModal;
