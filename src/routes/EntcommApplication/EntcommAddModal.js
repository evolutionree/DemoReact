/*
TODO: 2018-07-24 增加了  审批流  改文件不再使用   看后期系统使用是否正常  一段时间后 删除该文件
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, message, Radio } from 'antd';
import { DynamicFormAdd, generateDefaultFormData } from '../../components/DynamicForm';
import { getGeneralProtocol, addEntcomm } from '../../services/entcomm';

const Option = Select.Option;

class EntcommAddModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string.isRequired,
    entityTypes: PropTypes.array.isRequired,
    cancel: PropTypes.func.isRequired,
    currentUser: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showTypeModal: false,
      showFormModal: false,
      selectedEntityType: '',
      protocolFields: [], // 协议字段
      formData: {}, // 表单数据
      confirmLoading: false,
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { entityTypes } = nextProps;
      // 实体只有一个类型时，跳过类型选择
      if (entityTypes.length === 1) {
        this.setState({
          showFormModal: true,
          selectedEntityType: entityTypes[0].categoryid
        });
        this.fetchProtocol(entityTypes[0].categoryid);
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
    const skipTypeModal = this.props.entityTypes.length === 1;
    if (skipTypeModal) {
      this.props.cancel();
    } else {
      this.setState({
        showFormModal: false,
        protocolFields: [],
        formData: {}
      });
    }
  };

  onFormModalConfirm = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const params = {
        typeid: this.state.selectedEntityType,
        fieldData: values
      };
      this.setState({ confirmLoading: true });
      addEntcomm(params).then(result => {
        this.setState({ confirmLoading: false });
        message.success('新增成功');
        this.props.done();
      }).catch(e => {
        this.setState({ confirmLoading: false });
        console.error(e);
        message.error(e.message || '新增失败');
      });
    });
  };

  resetState = () => {
    this.setState({
      showTypeModal: false,
      showFormModal: false,
      selectedEntityType: '',
      protocolFields: [], // 协议字段
      formData: {}, // 表单数据
      confirmLoading: false,
      key: new Date().getTime()
    });
  };

  fetchProtocol = (typeId) => {
    const params = {
      typeId,
      OperateType: 0
    };
    getGeneralProtocol(params).then(result => {
      const protocolFields = result.data;
      const formData = generateDefaultFormData(protocolFields);
      if (protocolFields.some(field => field.fieldname === 'recmanager')) {
        const { currentUser } = this.props;
        formData.recmanager = currentUser && currentUser.userid;
        formData.recmanager_name = currentUser && currentUser.username;
      }
      this.setState({
        protocolFields,
        formData
      });
    });
  };

  render() {
    const { entityTypes, entityId } = this.props;
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
        <Modal
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
        </Modal>
        <Modal
          title={this.props.modalTitle || `新增${this.props.entityName || '表单'}`}
          visible={showFormModal}
          onCancel={this.onFormModalCancel}
          onOk={this.onFormModalConfirm}
          confirmLoading={confirmLoading}
          width={hasTable ? 900 : 550}
        >
          <DynamicFormAdd
            entityId={entityId}
            entityTypeId={selectedEntityType}
            fields={protocolFields}
            value={formData}
            onChange={val => { this.setState({ formData: val }); }}
            ref={form => { this.form = form; }}
          />
          {/*{JSON.stringify(this.state.formData)}*/}
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityId, entityTypes, entityName } = state.entcommApplication;
    return {
      visible: /add/.test(showModals),
      entityName,
      entityId,
      entityTypes,
      currentUser: state.app.user
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommApplication/showModals', payload: '' });
      },
      done() {
        dispatch({ type: 'entcommApplication/addDone' });
      }
    };
  }
)(EntcommAddModal);
