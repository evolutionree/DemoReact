import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import EntcommAddModal from '../../../../components/EntcommAddModal';
import EntcommDetailModal from '../../../../components/EntcommDetailModal';
import EntcommCopyModal from '../../../../components/EntcommCopyModal';
import EntcommTransferModal from '../../../../components/EntcommTransferModal';
import { WorkflowCaseForAddModal } from '../../../../components/WorkflowCaseModal';
import IsneedtorepeatapproveModal from './IsneedtorepeatapproveModal';
import { getEntcommDetail, queryvaluefornewdata } from '../../../../services/entcomm';
import { queryTypes, queryEntityDetail } from '../../../../services/entity';
import { getAfterFilterEntityTypes } from '../../../../routes/EntityHome/views/EntityScripts';


class PluginAddModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    currPlugin: PropTypes.shape({
      // normal 普通动态实体， flow 填表单+提交审批,audit 提交审批,transform 单据转换按钮,upatebutton更新事件按钮 ,copybutton 复制按钮
      type: PropTypes.oneOf(['normal', 'flow', 'audit', 'transform', 'AddRelEntityData', 'upatebutton', 'copybutton', 'FunctionButton']).isRequired,
      entity: PropTypes.object,
      flowid: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.string,
      recid: PropTypes.string
    }),
    cancel: PropTypes.func,
    done: PropTypes.func,
    refreshPlugins: PropTypes.func
  }
  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {
      caseId: '',
      dstEntityId: '',
      routePath: '',
      buttoncode: '',
      initAddFormData: null,
      showAddModal: false,
      showCopyModal: false,
      showDetailModal: false,
      showTransferModal: false,
      showFlowCaseModal: false,
      copyData: null,
      dataModel: undefined,
      isneedtorepeatapproveVisible: false,
      hasAudit: false // 是否已存在有审批数据
    };
  }

  async componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;

    if (isOpening) {
      const { currPlugin, entityId, recordId } = nextProps;
      if (!currPlugin) return;

      if (['normal', 'flow'].includes(currPlugin.type)) {
        // 客户基础资料审批，需要填充数据
        if (currPlugin.type === 'flow' && currPlugin.recid) {
          const res = await getEntcommDetail({ entityId, recId: recordId, needPower: 1 });
          this.setState({ initAddFormData: res.data.detail, showAddModal: true });
        } else {
          this.setState({ showAddModal: true, relEntityTypes: undefined });
        }
      } else if (['AddRelEntityData'].includes(currPlugin.type)) {
        const relid = currPlugin.entity && currPlugin.entity.relid;
        const relentityid = currPlugin.entity && currPlugin.entity.relentityid;
        const relfieldid = currPlugin.entity && currPlugin.entity.relfieldid;
        const relfieldname = currPlugin.entity && currPlugin.entity.relfieldname;
        if (!relid && !(relentityid && relfieldid && relfieldname)) {
          message.error('请检查配置');
          return;
        }
        const res = await getEntcommDetail({ entityId, recId: recordId, needPower: 1 });
        this.fetchRelEntityFromInitData(relid, relentityid, relfieldid, relfieldname, res.data.detail);
      } else if (currPlugin.type === 'transform') {
        let dstEntityId = '';
        if (currPlugin.entity.extradata) dstEntityId = currPlugin.entity.extradata.dstentityid;
        this.setState({
          showTransferModal: true,
          routePath: currPlugin.entity.routepath,
          buttoncode: currPlugin.entity.buttoncode,
          dstEntityId: dstEntityId
        });
      } else if (currPlugin.type === 'copybutton') {
        const res = await getEntcommDetail({ entityId, recId: recordId, needPower: 0 });
        this.setState({ showCopyModal: true, copyData: res.data.detail });
      } else if (currPlugin.type === 'upatebutton') {
        this.props.cancel();
      } else if (currPlugin.type === 'CallService') {
        this.props.cancel();
      } else if (currPlugin.type === 'FunctionButton') {
        this.props.cancel();
      } else {
        this.setState({
          showDetailModal: true
        });
      }
    } else if (isClosing) {
      this.setState({
        caseId: '',
        dstEntityId: '',
        routePath: '',
        buttoncode: '',
        initAddFormData: null,
        showAddModal: false,
        showCopyModal: false,
        showDetailModal: false,
        showTransferModal: false,
        showFlowCaseModal: false,
        copyData: null,
        dataModel: undefined
      });
    }
  }

  fetchRelEntityFromInitData = (relid, relentityid, relfieldid, relfieldname, originDetail) => {
    const { relTabs, entityId, recordId, cancel } = this.props;
    if (!(Array.isArray(relTabs) && relTabs.length) && relid) {
      message.error('页签数据异常');
      return;
    }

    let relTabInfo = {};
    if (relid && relid.length > 0) {
      relTabInfo = relTabs.find(item => item.relid === relid);
    }
    if (!(relTabInfo && relTabInfo.relid)) {
      //通过RelId找不到页签，或者压根没有传入relid，则根据relentityid和relfieldid来计算
      relTabInfo = {
        relentityid: relentityid,
        fieldid: relfieldid,
        fieldname: relfieldname
      };
    }
    const params = {
      EntityId: entityId,
      RecId: recordId,
      FieldId: relTabInfo && relTabInfo.fieldid
    };

    this.setState({ relTabInfo });
    queryTypes({ entityId: relTabInfo.relentityid }).then(res1 => {
      const { data: { entitytypepros: entityTypes } } = res1;
      if (entityTypes) {
        queryEntityDetail(relTabInfo.relentityid).then(relRes => {
          const filterTypeJsCode = relRes.data.entityproinfo[0].rectypeload;
          const originData = {
            entityid: entityId,
            recid: recordId,
            rectype: originDetail.rectype,
            originDetail
          };
          const relEntityTypes = getAfterFilterEntityTypes(entityTypes, originData, filterTypeJsCode);
          this.setState({ relEntityTypes });
        });

        queryvaluefornewdata(params).then(res => {
          const { data } = res;
          if (data) {
            this.setState({ showAddModal: true, initAddFormData: { [relTabInfo && relTabInfo.fieldname]: data } });
          } else {
            cancel();
            message.error('您没有数据权限或不能进行操作');
          }
        }).catch(e => {
          message.error(e.message);
          console.error(e.message);
        });
      } else {
        cancel();
        message.error('参数异常');
      }
    }).catch(e => {
      message.error(e.message);
      console.error(e.message);
    });
  }

  onAddDone = result => {
    const { entityId, recordId } = this.props;
    if (this.props.currPlugin.type === 'normal') {
      this.props.auditDone(entityId, recordId);
      this.props.done();
    } else if (this.props.currPlugin.type === 'flow') {
      this.props.auditDone(entityId, recordId);
      this.props.done();
    } else {
      this.props.auditDone(entityId, recordId);
      this.props.done();
    }
  }

  onDetailConfirm = (isneedtorepeatapprove, entitymodel) => {
    if (isneedtorepeatapprove === 1) {
      this.setState({ dataModel: entitymodel || {}, isneedtorepeatapproveVisible: true });
    } else {
      this.setState({
        dataModel: {
          flowId: this.props.currPlugin.flowid,
          entityId: this.props.entityId,
          recId: this.props.recordId
        },
        showDetailModal: false,
        showFlowCaseModal: true
      });
    }
  }

  onCancel = () => {
    this.props.cancel();
  }

  cancelDetail = () => {
    const { cancel, refreshActivities, recordId } = this.props;
    if (cancel) cancel();
    if (refreshActivities) refreshActivities();
  }


  processProtocol = fields => {
    let fields_ = fields;
    const readOnlyFieldKeys = Object.keys(this.state.initAddFormData);
    if (readOnlyFieldKeys.length) {
      fields_ = fields.map(field => {
        if (_.includes(readOnlyFieldKeys, field.fieldname)) {
          return {
            ...field,
            fieldconfig: {
              ...field.fieldconfig,
              isReadOnly: 1
            }
          };
        }
        return field;
      });
    }
    return fields_;
  };

  render() {
    const self = this;
    const { currPlugin, cancel, done, recordId, entityTypes } = this.props;
    const {
      buttoncode,
      showCopyModal,
      showAddModal,
      showDetailModal,
      showTransferModal,
      showFlowCaseModal,
      caseId,
      dstEntityId,
      routePath,
      copyData,
      relTabInfo,
      initAddFormData,
      isneedtorepeatapproveVisible,
      relEntityTypes,
      hasAudit
    } = this.state;

    let entityId = currPlugin && currPlugin.entity && currPlugin.entity.entityid;
    const entityName = currPlugin && currPlugin.entity && currPlugin.entity.entityname;
    const flowId = currPlugin && currPlugin.flowid;
    let modalTitle;
    const isAddRelEntityData = currPlugin && currPlugin.type === 'AddRelEntityData';
    const isneedtorepeatapprove = currPlugin && currPlugin.isneedtorepeatapprove;

    if (currPlugin && currPlugin.name === '客户资料审批') modalTitle = '客户资料审批';
    if (isAddRelEntityData) entityId = relTabInfo && relTabInfo.relentityid;

    return (
      <div>
        <EntcommAddModal
          approval
          isplugin
          modalTitle={modalTitle}
          visible={showAddModal}
          entityId={entityId}
          entityName={entityName}
          refRecord={recordId}
          hasAudit={hasAudit}
          refEntity={this.props.entityId}
          initFormData={initAddFormData}
          dataModel={this.state.dataModel}
          isneedtorepeatapprove={isneedtorepeatapprove}
          flow={flowId ? { flowid: flowId } : undefined}
          cancel={() => self.props.cancel()}
          done={this.onAddDone}
          isAddCase={!!(currPlugin && currPlugin.recid)}
          recId={currPlugin && currPlugin.recid}
          processProtocol={isAddRelEntityData ? this.processProtocol : undefined}
          entityTypes={relEntityTypes}
        />

        <EntcommDetailModal
          visible={showDetailModal}
          entityId={this.props.entityId}
          flowId={flowId}
          hasAudit={hasAudit}
          isneedtorepeatapprove={isneedtorepeatapprove}
          entityName={this.props.entityName}
          recordId={this.props.recordId}
          onCancel={this.props.cancel}
          onOk={this.onDetailConfirm}
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
        {/* <WorkflowCaseModal */}
        {/* visible={showFlowCaseModal} */}
        {/* caseId={caseId} */}
        {/* onCancel={cancel} */}
        {/* onDone={this.props.done} */}
        {/* /> */}
        <WorkflowCaseForAddModal
          visible={showFlowCaseModal}
          isAddCase
          dataModel={this.state.dataModel}
          onCancel={cancel}
          onDone={this.onAddDone}
        />
        <IsneedtorepeatapproveModal
          entityId={entityId}
          flowId={flowId}
          dataModel={this.state.dataModel}
          visible={isneedtorepeatapproveVisible}
          onOk={this.onDetailConfirm}
          onCancel={() => this.setState({ isneedtorepeatapproveVisible: false })}
          cancelDetail={this.cancelDetail}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    const { relTabs } = state.entcommHome;
    const { showModals, currPlugin, entityId, entityName, recordId, entityTypes } = state.entcommActivities;

    return {
      relTabs,
      visible: /pluginAdd$/.test(showModals),
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
        dispatch({ type: 'entcommActivities/init', payload: { entityId, recordId } });
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
