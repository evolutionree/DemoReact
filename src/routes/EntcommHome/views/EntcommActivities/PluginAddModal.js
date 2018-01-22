import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import EntcommAddModal from '../../../../components/EntcommAddModal';
import EntcommDetailModal from '../../../../components/EntcommDetailModal';
import EntcommCopyModal from '../../../../components/EntcommCopyModal';
import EntcommTransferModal from '../../../../components/EntcommTransferModal';
import { WorkflowCaseForAddModal } from '../../../../components/WorkflowCaseModal';
import { getEntcommDetail } from '../../../../services/entcomm';

class PluginAddModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    currPlugin: PropTypes.shape({
      //normal 普通动态实体， flow 填表单+提交审批,audit 提交审批,transform 单据转换按钮,upatebutton更新事件按钮 ,copybutton 复制按钮
      type: PropTypes.oneOf(['normal', 'flow', 'audit','transform','upatebutton','copybutton']).isRequired,
      entity: PropTypes.object,
      flowid: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.string,
      recid: PropTypes.string
    }),
    cancel: PropTypes.func,
    done: PropTypes.func,
    refreshPlugins: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      caseId: '',
      dstEntityId:'',
      routePath:'',
      buttoncode:'',
      initAddFormData: null,
      showAddModal: false,
      showCopyModal:false,
      showDetailModal: false,
      showTransferModal: false,
      showFlowCaseModal: false,
      copyData:null,
      dataModel: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { currPlugin,entityId,recordId} = nextProps;
      if (!currPlugin) return;
      if (currPlugin.type === 'normal' || currPlugin.type === 'flow') {
        this.setState({
          showAddModal: true
        });
        // 客户基础资料审批，需要填充数据
        if (currPlugin.type === 'flow' && currPlugin.recid) {
          this.fetchInitFormData(currPlugin.entity.entityid, currPlugin.recid).then(detailData => {
            this.setState({
              initAddFormData: detailData
            });
          });
        }
      }else if (currPlugin.type === 'transform'){
        let dstEntityId='';
        if(currPlugin.entity.extradata)
          dstEntityId=currPlugin.entity.extradata.dstentityid;
        this.setState({
          showTransferModal: true,
          routePath:currPlugin.entity.routepath,
          buttoncode:currPlugin.entity.buttoncode,
          dstEntityId:dstEntityId
        });
      }else if (currPlugin.type === 'copybutton'){
          this.fetchCopyFormData(entityId, recordId).then(detailData => {
            this.setState({
              showCopyModal:true,
              copyData:detailData
            });
          });
      }else if (currPlugin.type === 'upatebutton'){
        this.props.cancel();
      }else if (currPlugin.type === 'CallService'){
        this.props.cancel();
      }else {
        this.setState({
          showDetailModal: true
        });
      }
    } else if (isClosing) {
      this.setState({
        caseId: '',
        dstEntityId:'',
        routePath:'',
        buttoncode:'',
        initAddFormData: null,
        showAddModal: false,
        showCopyModal: false,
        showDetailModal: false,
        showTransferModal: false,
        showFlowCaseModal: false,
        copyData:null,
        dataModel: undefined
      });
    }
  }

  fetchInitFormData = (entityId, recordId) => {
    return getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: 1 // TODO 跑权限
    }).then(result => result.data.detail);
  };

  fetchCopyFormData = (entityId, recordId) => {
    return getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: 0
    }).then(result => result.data.detail);
  };

  onAddDone = (result) => {
    const { entityId,recordId } = this.props;
    if (this.props.currPlugin.type === 'normal') {
      this.props.done();
    } else if (this.props.currPlugin.type === 'flow') {
      // const caseId = result.data;
      // this.setState({
      //   caseId,
      //   showAddModal: false,
      //   showFlowCaseModal: true
      // });
      this.props.auditDone(entityId, recordId);
      this.props.done();
    } else {
      this.props.auditDone(entityId, recordId);
      this.props.done();
    }
  };

  onDetailConfirm = () => {
    // const params = {
    //   flowId: this.props.currPlugin.flowid,
    //   entityId: this.props.entityId,
    //   recId: this.props.recordId
    // };
    // addCase(params).then(result => {
    //   const caseId = result.data;
    //   this.setState({
    //     caseId,
    //     showDetailModal: false,
    //     showFlowCaseModal: true
    //   });
    //   const { entityId,recordId } = this.props;
    //   this.props.auditDone(entityId,recordId);
    // }, err => {
    //   message.error(err.message || '提交审批失败');
    // });

    this.setState({
      dataModel: {
        flowId: this.props.currPlugin.flowid,
        entityId: this.props.entityId,
        recId: this.props.recordId
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
    const { currPlugin, cancel, done, recordId ,entityTypes} = this.props;
    const { buttoncode,showCopyModal,showAddModal, showDetailModal, showTransferModal,showFlowCaseModal, caseId,dstEntityId,routePath,copyData} = this.state;
    const entityId = currPlugin && currPlugin.entity && currPlugin.entity.entityid;
    const entityName = currPlugin && currPlugin.entity && currPlugin.entity.entityname;
    const flowId = currPlugin && currPlugin.flowid;
    let modalTitle;
    if (currPlugin && currPlugin.name === '客户资料审批') {
      modalTitle = '客户资料审批';
    }
    return (
      <div>
        <EntcommAddModal
          modalTitle={modalTitle}
          visible={showAddModal}
          entityId={entityId}
          entityName={entityName}
          refRecord={recordId}
          refEntity={this.props.entityId}
          initFormData={this.state.initAddFormData}
          flow={flowId ? { flowid: flowId } : undefined}
          cancel={() => {
            self.props.cancel();
          }}
          done={this.onAddDone}
          isAddCase={!!(currPlugin && currPlugin.recid)}
          recId={currPlugin && currPlugin.recid}
        />
        <EntcommDetailModal
          visible={showDetailModal}
          entityId={this.props.entityId}
          entityName={this.props.entityName}
          recordId={this.props.recordId}
          onCancel={this.props.cancel}
          onOk={this.onDetailConfirm}
          footer={[
            <Button key="cancel" type="default" onClick={this.props.cancel}>关闭</Button>,
            <Button key="ok" onClick={this.onDetailConfirm}>下一步</Button>
          ]}
        />
        <EntcommTransferModal
          visible={showTransferModal}
          dstEntityId={dstEntityId}
          routePath={routePath}
          buttoncode={buttoncode}
          entityId={this.props.entityId}
          recordId={this.props.recordId}
          onCancel={() => {
            this.props.cancel();
            this.props.refreshPlugins();
            this.props.refreshActivities();
            this.props.refreshRecordDetail();
          }}
        />
        <EntcommCopyModal
          visible={showCopyModal}
          entityId={this.props.entityId}
          entityTypes={entityTypes}
          copyData={copyData}
          currentUser={this.props.currentUser}
          onCancel={this.props.cancel}
          onDone={this.props.done}
        />
        {/*<WorkflowCaseModal*/}
          {/*visible={showFlowCaseModal}*/}
          {/*caseId={caseId}*/}
          {/*onCancel={cancel}*/}
          {/*onDone={this.props.done}*/}
        {/*/>*/}
        <WorkflowCaseForAddModal
          visible={showFlowCaseModal}
          isAddCase
          dataModel={this.state.dataModel}
          onCancel={cancel}
          onDone={this.onAddDone}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals, currPlugin, entityId, entityName, recordId, entityTypes } = state.entcommActivities;
    return {
      visible: /pluginAdd/.test(showModals),
      currPlugin,
      entityTypes,
      entityId,
      entityName,
      currentUser: state.app.user,
      recordId
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommActivities/pluginAddCancel', payload: '' });
      },
      done() {
        dispatch({ type: 'entcommActivities/pluginAddDone' });
      },
      auditDone(entityId, recordId) {
        dispatch({ type: 'entcommActivities/init',payload: {entityId, recordId} });
        dispatch({ type: 'entcommHome/fetchRecordDetail' });
      },
      refreshPlugins() {
        dispatch({ type: 'entcommActivities/fetchPlugins' });
      },
      refreshRecordDetail() {
        dispatch({ type: 'entcommHome/fetchRecordDetail' });
      },
      refreshActivities() {
        dispatch({ type: 'entcommActivities/loadMore__', payload: true });
      }
    };
  }
)(PluginAddModal);
