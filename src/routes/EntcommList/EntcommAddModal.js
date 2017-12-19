import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, message, Radio } from 'antd';
import { DynamicFormAdd, generateDefaultFormData } from '../../components/DynamicForm';
import { getGeneralProtocol, addEntcomm } from '../../services/entcomm';

const Option = Select.Option;

class EntcommAddModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
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
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      commonid: ""
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
    this.form.validateFields({ force: true }, (err, values) => {
      // console.log('entcommadd validate callbacked err: ', err);
      if (err) {
        return message.error('请检查表单');
      }
      const params = {
        typeid: this.state.selectedEntityType,
        fieldData: values
      };
      if(this.state.commonid){//客户引用 新增
        params.extraData = {commonid:this.state.commonid};
      }
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
  setExtraData= (type, value) => {
    this.setState({
      commonid: value
    })
  };
  setFieldsConfig = (formData) => { //客户引用时 需要对部分字段(引用后填充值得字段)做禁用处理
    let protocolFields = this.state.protocolFields;
    for (let i = 0 ; i < protocolFields.length ; i++) {
      for (let key in formData) {
        if (protocolFields[i].fieldname === key) {
          protocolFields[i].fieldconfig.isReadOnly = 1;
        }
      }
    }
    this.setState({
      protocolFields : protocolFields
    })
  }

  render() {
    const { entityTypes } = this.props;
    const {
      showTypeModal,
      showFormModal,
      selectedEntityType,
      protocolFields,
      formData,
      confirmLoading
    } = this.state;

    const hasTable = protocolFields.some(field => {
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });

    return (
      <div key={this.state.key}>
        <Modal
          title={this.props.modalTitle || `新增${this.props.entityName || '表单'}`}
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
          title={this.state.commonid ? '客户引用' : (this.props.modalTitle || `新增${this.props.entityName || '表单'}`)}
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
            onChange={val => { this.setState({ formData: val }); }}
            ref={form => { this.form = form; }}
            setExtraData={this.setExtraData}
            setFieldsConfig={this.setFieldsConfig}
          />
          {/*{JSON.stringify(this.state.formData)}*/}
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityTypes, entityName } = state.entcommList;
    return {
      visible: /recordAdd/.test(showModals),
      entityTypes,
      entityName,
      currentUser: state.app.user
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommList/showModals', payload: '' });
      },
      done() {
        dispatch({ type: 'entcommList/addDone' });
      }
    };
  }
)(EntcommAddModal);
