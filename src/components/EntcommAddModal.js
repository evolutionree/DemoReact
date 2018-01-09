import React, { PropTypes, Component } from 'react';
import { Modal, Select, message, Radio } from 'antd';
import * as _ from 'lodash';
import { DynamicFormAdd, generateDefaultFormData } from './DynamicForm';
import { getGeneralProtocol, addEntcomm } from '../services/entcomm';
import { WorkflowCaseForAddModal } from "./WorkflowCaseModal";

const Option = Select.Option;

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
    isAddCase: PropTypes.bool
  };
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      showTypeModal: false,
      showFormModal: false,
      showWorkflowCaseModal: false,
      selectedEntityType: '',
      protocolFields: [], // 协议字段
      formData: props.initFormData || {}, // 表单数据
      confirmLoading: false,
      dataModel: undefined,
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (!_.isEqual(this.props.initFormData, nextProps.initFormData)) {
      this.setState({ formData: nextProps.initFormData || {} });
    }
    if (isOpening) {
      if (nextProps.initFormData && Object.keys(nextProps.initFormData).length) {
        this.setState({ formData: nextProps.initFormData || {} }); //关闭的时候  formdat被清空了  需要重新得到initFormData
      }
      const { entityTypes, entityId } = nextProps;
      // 实体只有一个类型时，跳过类型选择
      if (!entityTypes || entityTypes.length === 1) {
        this.setState({
          showFormModal: true,
          selectedEntityType: entityId
        });
        this.fetchProtocol(entityId);
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

  resetState = () => {
    this.setState({
      showTypeModal: false,
      showFormModal: false,
      showWorkflowCaseModal: false,
      selectedEntityType: '',
      protocolFields: [], // 协议字段
      formData: {}, // 表单数据
      confirmLoading: false,
      dataModel: undefined,
      key: new Date().getTime()
    });
  };

  onTypeModalCancel = () => {
    this.props.cancel();
  };

  onTypeModalConfirm = () => {
    this.setState({
      showFormModal: true
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

  onFormModalConfirm = () => {
    if (this.props.flow && this.props.flow.flowid) {
      this.onFormModalConfirmAddCase();
      return;
    }
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const params = {
        typeid: this.state.selectedEntityType,
        // flowid: this.props.flow ? this.props.flow.flowid : undefined,
        relentityid: this.props.refEntity,
        relrecid: this.props.refRecord,
        fielddata: values,
        extradata: this.props.extraData
      };
      this.setState({ confirmLoading: true });
      addEntcomm(params).then(result => {
        this.setState({ confirmLoading: false });
        message.success('新增成功');
        this.props.done(result);
      }).catch(e => {
        this.setState({ confirmLoading: false });
        console.error(e);
        message.error(e.message || '新增失败');
      });
    });
  };

  onFormModalConfirmAddCase = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      let dataModel;
      if (this.props.isAddCase) {
        dataModel = {
          entityid: this.state.selectedEntityType,
          flowid: this.props.flow.flowid,
          recid: this.props.recId,
          relentityid: this.props.refEntity,
          relrecid: this.props.refRecord,
          casedata: values
        };
      } else {
        dataModel = {
          typeid: this.state.selectedEntityType,
          flowid: this.props.flow.flowid,
          relentityid: this.props.refEntity,
          relrecid: this.props.refRecord,
          fielddata: values,
          extradata: this.props.extraData
        };
      }
      this.setState({ dataModel, showWorkflowCaseModal: true, showFormModal: false });
    });
  };
  onWorkflowCaseCancel = () => {
    this.setState({ showWorkflowCaseModal: false, showFormModal: true });
  };
  onWorkflowCaseDone = (result) => {
    this.props.done(result);
  };

  // onFormModalConfirmAddCase = () => {
  //   this.form.validateFields((err, values) => {
  //     if (err) {
  //       return message.error('请检查表单');
  //     }
  //
  //     const params = {
  //       entityid: this.state.selectedEntityType,
  //       flowid: this.props.flow ? this.props.flow.flowid : undefined,
  //       recid: this.props.recId,
  //       relentityid: this.props.refEntity,
  //       relrecid: this.props.refRecord,
  //       casedata: values
  //     };
  //     this.setState({ confirmLoading: true });
  //     addCase(params).then(result => {
  //       this.setState({ confirmLoading: false });
  //       message.success('新增成功');
  //       this.props.done(result);
  //     }).catch(e => {
  //       this.setState({ confirmLoading: false });
  //       console.error(e);
  //       message.error(e.message || '新增失败');
  //     });
  //   });
  // };

  fetchProtocol = (typeId) => {
    const params = {
      typeId,
      OperateType: 0
    };
    getGeneralProtocol(params).then(result => {
      const protocolFields = result.data;
      this.setState({
        protocolFields: this.props.processProtocol ? this.props.processProtocol(protocolFields) : protocolFields,
        formData: generateDefaultFormData(protocolFields, this.state.formData)
      });
    });
  };

  render() {
    const { entityTypes, footer, refRecord } = this.props;
    const {
      showTypeModal,
      showFormModal,
      selectedEntityType,
      protocolFields,
      formData,
      confirmLoading
    } = this.state;

    const hasTable = protocolFields.some(field => {
      return (field.controltype === 24 && field.fieldconfig.isVisible === 1)
        || (field.controltype === 5 && field.fieldconfig.textType === 1 && field.fieldconfig.isVisible === 1);
    });

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
          {/*<Select*/}
            {/*value={selectedEntityType}*/}
            {/*onChange={val => this.setState({ selectedEntityType: val })}*/}
          {/*>*/}
            {/*{entityTypes.map(type => (*/}
              {/*<Option key={type.categoryid}>{type.categoryname}</Option>*/}
            {/*))}*/}
          {/*</Select>*/}
        </Modal>}
        <Modal
          title={this.props.modalTitle || `新增${this.props.entityName || '表单'}`}
          visible={showFormModal}
          onCancel={this.onFormModalCancel}
          onOk={this.onFormModalConfirm}
          confirmLoading={confirmLoading}
          width={hasTable ? 900 : 550}
        >
          <DynamicFormAdd
            entityTypeId={selectedEntityType}
            fields={protocolFields}
            value={formData}
            refEntity={this.props.refEntity}
            refRecord={refRecord}
            onChange={val => { this.setState({ formData: val }); }}
            ref={form => { this.form = form; }}
          />
          {/*{JSON.stringify(this.state.formData)}*/}
        </Modal>
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

export default EntcommAddModal;
