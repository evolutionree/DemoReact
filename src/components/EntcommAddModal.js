import React, { PropTypes, Component } from 'react';
import { Modal, message, Radio, Button, Checkbox, Spin } from 'antd';
import * as _ from 'lodash';
import { connect } from 'dva';
import { hashHistory } from 'dva/router';
import { DynamicFormAdd, generateDefaultFormData } from './DynamicForm';
import { getGeneralProtocol, addEntcomm, temporarysave } from '../services/entcomm';
import { queryEntityDetail } from '../services/entity';
import { preAddCase } from '../services/workflow';
import { WorkflowCaseForAddModal } from "./WorkflowCaseModal";
import { frontEndData_to_BackEndData } from '../components/AppHeader/TemporaryStorage/formStorageUtils';
import uuid from 'uuid';

class EntcommAddModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string,
    entityTypes: PropTypes.array, // 可以不传，跳过实体类型选择
    entityName: PropTypes.string,
    modalTitle: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    done: PropTypes.func, // 完成提交表单后的回调函数
    flow: PropTypes.object, // 若需接入流程才需要传
    refRecord: PropTypes.string, // 当前记录对象recid
    refEntity: PropTypes.string, // 关联主实体id
    footer: PropTypes.arrayOf(PropTypes.node),
    extraData: PropTypes.object, // 提交表单的额外参数
    initFormData: PropTypes.object,
    processProtocol: PropTypes.func,
    isAddCase: PropTypes.bool,
    entityTypeId: PropTypes.string, //暂存表单时  默认选中当前暂存表单的 实体类型
    cacheId: PropTypes.string //新增 暂存表单数据时  需要带上暂存id
  };
  static defaultProps = {
    entityTypeId: '',
    entityModelType: '' //当前实体类型0独立实体1嵌套实体2应用实体3动态实体';
  };

  constructor(props) {
    super(props);
    const entityFormDoneLink = JSON.parse(localStorage.getItem('entityFormDoneLink')) || {};
    this.state = {
      showTypeModal: false,
      showFormModal: false,
      showWorkflowCaseModal: false,
      selectedEntityType: this.props.entityTypeId,
      protocolFields: [], // 协议字段
      formData: props.initFormData || {}, // 表单数据
      confirmLoading: false,
      storageLoading: false,
      dataModel: undefined,
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      commonid: '',
      entityFormDoneLink: entityFormDoneLink[this.props.entityId] !== false,
      fetchProtocolLoading: false,
      excutingJSLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    const entityFormDoneLink = JSON.parse(localStorage.getItem('entityFormDoneLink')) || {};
    if (!_.isEqual(this.props.initFormData, nextProps.initFormData)) {
      this.setState({ formData: nextProps.initFormData || {} });
    }
    if (isOpening) {
      const { entityTypes, entityId } = nextProps;
      this.queryEntityinfo(entityId);
      this.setState({
        entityFormDoneLink: entityFormDoneLink[this.props.entityId] !== false
      })
      if (nextProps.initFormData && Object.keys(nextProps.initFormData).length) {
        this.setState({ formData: nextProps.initFormData || {} }); //关闭的时候  formdat被清空了  需要重新得到initFormData
      }
      if (nextProps.entityTypeId) { //暂存 新增表单
        this.setState({
          showFormModal: true,
          selectedEntityType: nextProps.entityTypeId
        });
        this.fetchProtocol(nextProps.entityTypeId);
      } else if (!entityTypes || entityTypes.length === 1) { // 实体只有一个类型时，跳过类型选择
        const selectedEntityType = Array.isArray(entityTypes) ? entityTypes[0].categoryid : entityId;
        this.setState({
          showFormModal: true,
          selectedEntityType: selectedEntityType
        });
        this.fetchProtocol(selectedEntityType);
      } else if (entityTypes.length > 1) {
        this.setState({
          showTypeModal: true,
          selectedEntityType: entityTypes[0].categoryid
        });
      }
    } else if (isClosing) {
      this.resetState();
    }
  }

  queryEntityinfo = (entityId) => {
    queryEntityDetail(entityId).then(data => {
      this.setState({
        entityModelType: data.data.entityproinfo[0].modeltype,
        flowid: data.data.entityproinfo[0].flowid
      });
    });
  }

  resetState = () => {
    this.setState({
      showTypeModal: false,
      showFormModal: false,
      showWorkflowCaseModal: false,
      selectedEntityType: '',
      protocolFields: [], // 协议字段
      formData: {}, // 表单数据
      confirmLoading: false,
      storageLoading: false,
      dataModel: undefined,
      key: new Date().getTime(),
      commonid: '',
      excutingJSLoading: false
    });
  };

  onTypeModalCancel = () => {
    this.props.cancel();
  };

  onTypeModalConfirm = () => {
    this.setState({
      showFormModal: true,
      commonid: ''
    });
    this.fetchProtocol(this.state.selectedEntityType);
  };

  onFormModalCancel = () => {
    const skipTypeModal = !this.props.entityTypes || this.props.entityTypes.length === 1;
    if (skipTypeModal) {
      this.props.cancel();
    } else {
      this.setState({
        showFormModal: false,
        protocolFields: [],
        formData: this.props.initFormData || {}
      });
    }
  };

  getRelObjectConfig = (fields) => { //TODO: 获取到所有引用对象的字段
    let RelObjectConfig = [];
    fields.map(item => {
      if (item.controltype === 31) {  //引用对象
        RelObjectConfig.push(item);
      }
    });
    return RelObjectConfig;
  }

  onFormModalStorage = () => {
    const formValue = this.form.formInst.getFieldsValue();
    const fieldJson = frontEndData_to_BackEndData(this.form);

    const relObjectFields = this.getRelObjectConfig(this.form.props.fields);
    relObjectFields.map(item => { //TODO: 引用对象 新增的时候  表单不会传值给后端  但是暂存的时候 需要传
      const relObjectRef = this.form.formRef.getFieldComponentInstance(item.fieldname);
      if (relObjectRef && relObjectRef.getValue) {
        formValue[`${item.fieldname}_name`] = relObjectRef.getValue();
      }
    });

    const params = {
      cacheid: this.props.cacheId || uuid.v4(),
      datajson: JSON.stringify({
        extraData: { commonid: this.state.commonid }, //客户引用 新增 存在extraData
        expandfields: formValue
      }),
      fieldjson: JSON.stringify(fieldJson),
      typeid: this.state.selectedEntityType,
      title: `新增${this.props.modalTitle && this.props.modalTitle.replace(/新增/, '') || this.props.entityName}`,
      entityId: this.props.entityId,
      recrelateid: this.props.refRecord,
      relateentityid: this.props.refEntity
    };
    this.setState({
      storageLoading: true
    })
    temporarysave(params).then(result => {
      this.setState({ storageLoading: false });
      message.success('暂存成功');
      this.props.done(result, 'storage');
    }).catch(e => {
      this.setState({ storageLoading: false });
      console.error(e);
      message.error(e.message || '暂存失败');
    });
  }

  onFormModalConfirm = () => {
    const { flow, approval } = this.props;
    const { flowid } = this.state;
    if (flowid) {
      this.onFormModalConfirmAddCase(flowid);
    } else if (flow && flow.flowid && approval) {
      this.onFormModalConfirmAddCase();
    } else {
      this.onSubmitForm();
    }
  };

  onSubmitForm = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const params = {
        cacheid: this.props.cacheId,
        typeid: this.state.selectedEntityType,
        flowid: this.props.flow ? this.props.flow.flowid : undefined,
        relentityid: this.props.refEntity,
        relrecid: this.props.refRecord,
        fielddata: values,
        extradata: this.props.extraData
      };
      if (this.state.commonid) { //客户引用 新增
        params.extraData = { commonid: this.state.commonid };
      }
      this.setState({ confirmLoading: true });
      addEntcomm(params).then(result => {
        this.setState({ confirmLoading: false });
        message.success('新增成功');
        if (this.state.entityModelType === 0 && this.state.entityFormDoneLink) {
          this.props.done(result);
          const addRecid = result.data;
          hashHistory.push(`/entcomm/${this.props.entityId}/${addRecid}`);
        } else {
          this.props.done(result);
        }
      }).catch(e => {
        this.setState({ confirmLoading: false });
        console.error(e);
        message.error(e.message || '新增失败');
      });
    });
  }

  onFormModalConfirmAddCase = (flowid) => {
    const { isAddCase } = this.props;
    this.form.validateFields((err, values) => {
      if (err) return message.error('请检查表单');
      let dataModel;
      if (isAddCase) {
        dataModel = {
          cacheid: this.props.cacheId,
          entityid: this.state.selectedEntityType,
          flowid: flowid || this.props.flow.flowid,
          recid: this.props.recId,
          relentityid: this.props.refEntity,
          relrecid: this.props.refRecord,
          casedata: values
        };
      } else {
        dataModel = {
          cacheid: this.props.cacheId, //暂存的表单数据  重新提交 需要传cacheid
          typeid: this.state.selectedEntityType,
          flowid: flowid || this.props.flow.flowid,
          relentityid: this.props.refEntity,
          relrecid: this.props.refRecord,
          fielddata: values,
          extradata: this.props.extraData
        };
      }
      this.setState({ dataModel, showWorkflowCaseModal: true, showFormModal: true });
    });
  };

  onWorkflowCaseCancel = () => {
    this.setState({ showWorkflowCaseModal: false, showFormModal: true });
  };

  onWorkflowCaseDone = (result) => {
    this.props.done(result);
  };

  fetchProtocol = (typeId) => {
    this.setState({
      fetchProtocolLoading: true
    });
    const params = {
      typeId,
      OperateType: 0
    };
    getGeneralProtocol(params).then(result => {
      const protocolFields = result.data;
      const formData = generateDefaultFormData(protocolFields, this.state.formData);
      if (protocolFields.some(field => field.fieldname === 'recmanager')) { //负责人组件设置 默认值
        const { currentUser } = this.props;
        formData.recmanager = currentUser && currentUser.userid;
        formData.recmanager_name = currentUser && currentUser.username;
      }
      this.setState({
        protocolFields: this.props.processProtocol ? this.props.processProtocol(protocolFields) : protocolFields,
        formData: formData,
        fetchProtocolLoading: false
      });
    }).catch(e => {
      this.setState({
        fetchProtocolLoading: false
      });
    });
  };

  setExtraData = (type, value) => {
    this.setState({
      commonid: value
    });
  };
  setFieldsConfig = (formData) => { //客户引用时 需要对部分字段(引用后填充值得字段)做禁用处理
    let protocolFields = this.state.protocolFields;
    for (let i = 0; i < protocolFields.length; i++) {
      for (let key in formData) {
        if (protocolFields[i].fieldname === key) {
          protocolFields[i].fieldconfig.isReadOnly = 1;
        }
      }
    }
    this.setState({
      protocolFields: protocolFields
    });
  }

  checkboxChange = (e) => {
    //TODO: 独立实体新增后  根据用户个人意愿 系统可直接跳转到页签页
    const { entityId } = this.props;
    let entityFormDoneLink = JSON.parse(localStorage.getItem('entityFormDoneLink')) || {};
    entityFormDoneLink[entityId] = e.target.checked;
    localStorage.setItem('entityFormDoneLink', JSON.stringify(entityFormDoneLink));
    this.setState({
      entityFormDoneLink: e.target.checked
    });
  }

  excutingJSStatusChange = (status) => {
    this.setState({
      excutingJSLoading: status
    });
  }

  render() {
    const { entityTypes, footer, refRecord, entityId } = this.props;
    const {
      showTypeModal,
      showFormModal,
      selectedEntityType,
      protocolFields,
      formData,
      confirmLoading,
      storageLoading,
      entityFormDoneLink,
      fetchProtocolLoading,
      entityModelType,
      excutingJSLoading
    } = this.state;

    return (
      <div key={this.state.key}>
        {entityTypes && <Modal
          title="请选择类型"
          visible={showTypeModal}
          onCancel={this.onTypeModalCancel}
          onOk={this.onTypeModalConfirm}
        >
          <Radio.Group
            value={selectedEntityType}
            onChange={event => this.setState({ selectedEntityType: event.target.value })}
          >
            {entityTypes.map(type => (
              <Radio key={type.categoryid} value={type.categoryid}>{type.categoryname}</Radio>
            ))}
          </Radio.Group>
        </Modal>}
        {
          showFormModal ? <Modal
            title={this.state.commonid ? '客户引用' : (this.props.modalTitle || `新增${this.props.entityName || '表单'}`)}
            visible={showFormModal}
            onCancel={this.onFormModalCancel}
            onOk={this.onFormModalConfirm}
            width={document.body.clientWidth * 0.95}
            wrapClassName="DynamicFormModal"
            footer={[
              entityModelType === 0 ? <Checkbox key={entityId} onChange={this.checkboxChange} checked={entityFormDoneLink}>新增后跳转到页签</Checkbox> : null,
              <Button key="back" type="default" onClick={this.onFormModalCancel}>取消</Button>,
              <Button key="storage" loading={storageLoading || excutingJSLoading} onClick={this.onFormModalStorage}>暂存</Button>,
              <Button key="submit" loading={confirmLoading || excutingJSLoading} onClick={this.onFormModalConfirm}>提交</Button>
            ]}
          >
            <Spin spinning={fetchProtocolLoading}>
              <DynamicFormAdd
                entityId={entityId}
                entityTypeId={selectedEntityType}
                fields={protocolFields}
                value={formData}
                refEntity={this.props.refEntity}
                refRecord={refRecord}
                onChange={val => { this.setState({ formData: val }); }}
                ref={form => { this.form = form; }}
                setExtraData={this.setExtraData}
                setFieldsConfig={this.setFieldsConfig}
                excutingJSStatusChange={this.excutingJSStatusChange}
              />
            </Spin>
          </Modal> : null
        }
        <WorkflowCaseForAddModal
          visible={this.state.showWorkflowCaseModal}
          isAddCase={this.props.isAddCase}
          dataModel={this.state.dataModel}
          onCancel={this.onWorkflowCaseCancel}
          onDone={this.onWorkflowCaseDone}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      currentUser: state.app.user
    };
  }
)(EntcommAddModal);
