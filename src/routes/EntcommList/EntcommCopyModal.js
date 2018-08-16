import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, message, Radio } from 'antd';
import { DynamicFormAdd, generateDefaultFormData } from '../../components/DynamicForm';
import { getGeneralProtocol, addEntcomm } from '../../services/entcomm';

const Option = Select.Option;

class EntcommCopyModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityTypes: PropTypes.array.isRequired,
    cancel: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    copyData: PropTypes.object
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
      fetchDataSucced: false,
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
      console.log(nextProps)
        this.setState({
          showFormModal: true,
          selectedEntityType: nextProps.copyData.rectype
        });
        this.fetchProtocol(nextProps.copyData.rectype);
    } else if (isClosing) {
      this.resetState();
    }
  }

  onFormModalCancel = () => {

      this.props.cancel();
  };


  onFormModalConfirm = () => {
    this.form.validateFields({ force: true }, (err, values) => {
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
      fetchDataSucced: false,
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

      // fix 表格控件，加typeid
      function genEditData(recordDetail, protocol) {
        const retData = { ...recordDetail };
        protocol.forEach(field => {
          const { controltype, fieldname, fieldconfig } = field;
          if (controltype === 24 && retData[fieldname]) {
            retData[fieldname] = retData[fieldname].map(item => {
              return {
                TypeId: fieldconfig.entityId,
                FieldData: item
              };
            });
          }
        });
        return retData;
      }


      const formData = genEditData(this.props.copyData, protocolFields)
      //基础的数据重新获取
/*      const baseFormData = generateDefaultFormData(protocolFields);
      const baseFormDataFields = Object.keys(baseFormData);
        baseFormDataFields.map((item) => {
            formData[item] = baseFormData[item]
          }
        );*/
      if (protocolFields.some(field => field.fieldname === 'recmanager')) {
        const { currentUser } = this.props;
        formData.recmanager = currentUser && currentUser.userid;
        formData.recmanager_name = currentUser && currentUser.username;
      }

      this.setState({
        protocolFields,
        formData: formData,
        fetchDataSucced: true
      });
    });
  };

/*  fetchDetailAndProtocol = (entityId, recordId) => {
    let detailData = {};
    let typeId = entityId;
    getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: 1 // TODO 跑权限
    }).then(result => {
      let { detail } = result.data;
      if (detail instanceof Array) {
        detail = detail[0];
      }
      detailData = detail;
      if (detail.rectype) {
        typeId = detail.rectype;
      }
      return getGeneralProtocol({
        typeId,
        OperateType: 1
      });
    }).then(result => {
      const protocol = result.data;
      this.setState({
        typeId,
        protocol,
        detailData,
        formData: genEditData(detailData, protocol)
      });
    }).catch(err => {
      message.error('获取协议或数据失败');
    });
    // fix 表格控件，加typeid
    function genEditData(recordDetail, protocol) {
      const retData = { ...recordDetail };
      protocol.forEach(field => {
        const { controltype, fieldname, fieldconfig } = field;
        if (controltype === 24 && retData[fieldname]) {
          retData[fieldname] = retData[fieldname].map(item => {
            return {
              TypeId: fieldconfig.entityId,
              FieldData: item
            };
          });
        }
      });
      return retData;
    }
  };
*/
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
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });

    return (
      <div key={this.state.key}>
        <Modal
          title={this.state.commonid ? '客户引用' : '新增表单'}
          visible={showFormModal}
          onCancel={this.onFormModalCancel}
          onOk={this.onFormModalConfirm}
          confirmLoading={confirmLoading}
          width={document.body.clientWidth > 1400 ? 1200 : 800}
          wrapClassName="DynamicFormModal"
        >
          {this.state.fetchDataSucced && <DynamicFormAdd
            entityId={entityId}
            entityTypeId={selectedEntityType}
            fields={protocolFields}
            value={formData}
            onChange={val => { this.setState({ formData: val }); }}
            ref={form => { this.form = form; }}
            setExtraData={this.setExtraData}
            setFieldsConfig={this.setFieldsConfig}
          />}
          {/*{JSON.stringify(this.state.formData)}*/}
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityTypes, copyData, entityId } = state.entcommList;
    return {
      visible: /copy/.test(showModals),
      entityId,
      entityTypes,
      copyData,
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
)(EntcommCopyModal);
