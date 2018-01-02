import React, { PropTypes, Component } from 'react';
import { Button, message } from 'antd';
import EntcommAddModal from '../../components/EntcommAddModal';
import EntcommDetailModal from '../../components/EntcommDetailModal';
import { WorkflowCaseForAddModal } from '../../components/WorkflowCaseModal';

class StageFlowModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    typeId: PropTypes.string,
    relentityid: PropTypes.string,
    relrecid: PropTypes.string,
    salesstageids: PropTypes.string,
    currPlugin: PropTypes.shape({
      // normal 普通动态实体， flow 填表单+提交审批， audit 提交审批
      type: PropTypes.oneOf(['normal', 'flow', 'audit']).isRequired,
      entity: PropTypes.object,
      flowid: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.string
    }),
    cancel: PropTypes.func,
    done: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      caseId: '',
      showAddModal: false,
      showDetailModal: false,
      showFlowCaseModal: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { currPlugin } = nextProps;
      if (!currPlugin) return;
      if (currPlugin.type === 'normal' || currPlugin.type === 'flow') {
        this.setState({
          showAddModal: true
        });
      } else {
        this.setState({
          showDetailModal: true
        });
      }
    } else if (isClosing) {
      this.setState({
        caseId: '',
        showAddModal: false,
        showDetailModal: false,
        showFlowCaseModal: false
      });
    }
  }

  onAddDone = (result) => {
    if (this.props.currPlugin.type === 'normal') {
      this.props.done();
    } else if (this.props.currPlugin.type === 'flow') {
      // const caseId = result.data;
      // this.setState({
      //   caseId,
      //   showAddModal: false,
      //   showFlowCaseModal: true
      // });
      this.props.done();
    }
  };

  onDetailConfirm = () => {
    // console.log(this.props);
    // const params = {
    //   casedata: { salesstageids: this.props.salesstageids },
    //   flowId: this.props.currPlugin.flowid,
    //   entityId: this.props.entityId,
    //   // entityId: this.props.entityType,
    //   recId: this.props.recordId,
    //   relentityid: this.props.relentityid,
    //   relrecid: this.props.relrecid,
    //   typeid: this.props.typeId
    // };
    // addCase(params).then(result => {
    //   const caseId = result.data;
    //   this.setState({
    //     caseId,
    //     showDetailModal: false,
    //     showFlowCaseModal: true
    //   });
    // }, err => {
    //   message.error(err.message || '提交审批失败');
    // });

    this.setState({
      dataModel: {
        casedata: { salesstageids: this.props.salesstageids },
        flowId: this.props.currPlugin.flowid,
        entityId: this.props.entityId,
        // entityId: this.props.entityType,
        recId: this.props.recordId,
        relentityid: this.props.relentityid,
        relrecid: this.props.relrecid,
        typeid: this.props.typeId
      },
      showDetailModal: false,
      showFlowCaseModal: true
    })
  };

  onCancel = () => {
    this.props.cancel();
  };

  render() {
    const self = this;
    const { currPlugin, cancel, done, recordId, entityName } = this.props;
    const { showAddModal, showDetailModal, showFlowCaseModal, caseId } = this.state;
    const entityId = currPlugin && currPlugin.entity && currPlugin.entity.entityid;
    const flowId = currPlugin && currPlugin.flowid;
    return (
      <div>
        <EntcommAddModal
          visible={showAddModal}
          entityId={entityId}
          entityName={entityName}
          refRecord={recordId}
          flow={flowId ? { flowid: flowId } : undefined}
          cancel={() => {
            self.props.cancel();
          }}
          done={this.onAddDone}
        />
        <EntcommDetailModal
          visible={showDetailModal}
          entityId={this.props.entityId}
          entityName={entityName}
          recordId={this.props.recordId}
          onCancel={this.props.cancel}
          onOk={this.onDetailConfirm}
          footer={[
            <Button key="cancel" type="default" onClick={this.props.cancel}>关闭</Button>,
            <Button key="ok" onClick={this.onDetailConfirm}>下一步</Button>
          ]}
          title="提交审批"
        />
        {/*<WorkflowCaseModal*/}
          {/*visible={showFlowCaseModal}*/}
          {/*caseId={caseId}*/}
          {/*onCancel={cancel}*/}
          {/*onDone={this.props.done}*/}
          {/*caseData={{ salesstageids: this.props.salesstageids }}*/}
        {/*/>*/}
        <WorkflowCaseForAddModal
          visible={showFlowCaseModal}
          isAddCase
          dataModel={this.state.dataModel}
          onCancel={cancel}
          onDone={this.props.done}
        />
      </div>
    );
  }
}

export default StageFlowModal;
