import React, { PropTypes, Component } from 'react';
import { Modal, Select,Button,Radio,message} from 'antd';
import { DynamicFormEdit,DynamicFormAdd, generateDefaultFormData } from './DynamicForm';
import { getGeneralProtocol, getEntcommDetail,editEntcomm,addEntcomm } from '../services/entcomm';
import { queryrules,trnasfer } from '../services/entityTransfer';

class EntcommTransferModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    routePath:PropTypes.string,
    buttoncode:PropTypes.string,
    entityId: PropTypes.string,
    dstEntityId:PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func,
    title: PropTypes.string
  };
  static defaultProps = {
    title: '新增'
  };

  constructor(props) {
    super(props);
    this.state = {
      isAdd:false,
      recordId:'',
      entityId:'',
      routePath:'',
      selectedEntityType:'',
      selectedEntityRule: '',
      showTypeModal: false,
      showFormModal:false,
      confirmLoading: false,
      dstEntityId:'',
      nexttransfer:null,
      entityRules:[],
      detailData: {}, // 记录详情
      protocol: [], // 协议字段
      data: {}, // 表单数据
      title: '新增',
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      commonid: '',
      funccode: ''//发送消息用
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { entityId, recordId,dstEntityId,routePath,buttoncode } = nextProps;
      this.setState({
        entityId,
        recordId,
        routePath,
        dstEntityId,
        funccode:buttoncode
       });
      this.fetchQueryRules(entityId,dstEntityId);
    } else if (isClosing) {
      this.resetState();
    }
  }

  fetchQueryRules= (SrcEntityId,DstEntityId) => {
    // 获取实体类型
    queryrules({
      SrcEntityId,
      DstEntityId
    }).then(result => {
      let ruleArr = result.data;
      if(ruleArr.length>0){
        this.setState({
          showTypeModal:true,
          selectedEntityRule:ruleArr[0].recid,
          selectedEntityType:ruleArr[0].dstcategory,
          entityRules: ruleArr,
          title: ruleArr[0].dstentityname
        });
      } else {
        this.props.onCancel();
        message.error('没有获取到实体类型,无法操作');
      }
    })
  };

  onRuleModalConfirm = () => {
    this.trnasferEntity(this.state.selectedEntityRule,this.state.entityId,this.state.recordId);
  };

  trnasferEntity = (ruleId,srcEntityId,srcRecId) => {
    trnasfer({
      ruleId,
      srcEntityId,
      srcRecId
    }).then(result => {
      const { detail,nexttransfer } = result.data;
      this.fetchDetailAndProtocol(detail,nexttransfer);
    }).catch(result=>{
      message.error(result.message);
      this.setState({
        showFormModal:false
      })
    });
  };

  fetchDetailAndProtocol = (detail,nexttransfer) => {
    getGeneralProtocol({
        typeId: detail.rectype || this.state.dstEntityId,
        OperateType: detail.recid?1:0
    }).then(result => {
      let isAdd=false;
      if(!detail.recid)
        isAdd=true;
      this.setState({
        isAdd,
        detailData: detail,
        protocol: result.data,
        nexttransfer,
        data: genEditData(detail, result.data),
        showFormModal: true
      });
    }).catch(err => {
      message.error('获取协议或数据失败');
    });
    // fix 表格控件，加typeid
    function genEditData(recordDetail, protocol) {
      const retData = generateDefaultFormData(protocol, recordDetail);
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

  trnasferClose=()=>{
    this.setState({
      confirmLoading: false
    });
    message.success('提交数据成功');
    this.props.onCancel();
  };

  trnasferNext=()=>{
    const self=this;
        //下一个单据转换
    const { nexttransfer }=this.state;
    if(nexttransfer){
      if(nexttransfer.rules.length>0){
        Modal.confirm({
          title: '是否创建'+nexttransfer.rules[0].dstentityname+'?',
          onOk() {
            const dstEntityId=nexttransfer.rules[0].dstentity;
            self.setState({
              dstEntityId,
              showTypeModal: true,
              showFormModal: false,
              confirmLoading: false
            });
            self.fetchQueryRules(self.state.entityId,dstEntityId);
          },
          onCancel() {
            self.trnasferClose();
          }
        });
      }else{
        this.trnasferClose();
      }
    }else{
        this.trnasferClose();
    }
  };

  radioOnChange=(event)=>{
    if(this.state.entityRules.length>0){
       const selectedEntityRule=event.target.value;
       this.state.entityRules.forEach(rule=>{
          if(rule.recid==selectedEntityRule){
              this.setState({
                selectedEntityRule,
                selectedEntityType:rule.dstcategory,
                title: rule.dstentityname
              });
          }
       });
    }else
    {
          message.error('没有规则可转换');
    }
  };

  handleSubmit = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      this.setState({ confirmLoading: true });
      const {
       isAdd
      } = this.state;
      if(isAdd){
        const params = {
          typeid: this.state.selectedEntityType || this.props.dstEntityId,
          fielddata: values
        };
        if (this.state.commonid) { // 客户引用 新增
          params.extraData = { commonid: this.state.commonid };
        }
        if (this.state.funccode) { // 发送信息 新增
          params.extraData={ ...params.extraData,
                  funccode:this.state.funccode,
                  entityId:this.state.entityId,
                  recordId:this.state.recordId //源单据recid
                };
        }
        addEntcomm(params).then(result => {
          this.setState({ commonid: '',funccode:'' });
          //下一个单据转换
          this.trnasferNext();
        }).catch(e => {
          this.setState({ confirmLoading: false });
          console.error(e);
          message.error(e.message || '提交数据失败');
        });
      }else{
        const params = {
          typeid: this.state.detailData.rectype || this.props.dstEntityId,
          recid: this.state.detailData.recid,
          fieldData: values
        };
        editEntcomm(params).then(result => {
            this.trnasferNext();
        }).catch(e => {
          this.setState({ confirmLoading: false });
          console.error(e);
          message.error(e.message || '提交数据失败');
        });
      }
    });
  };

  resetState = () => {
    this.setState({
      isAdd:false,
      recordId:'',
      entityId:'',
      routePath:'',
      selectedEntityType:'',
      selectedEntityRule: '',
      showTypeModal: false,
      showFormModal:false,
      confirmLoading: false,
      dstEntityId:'',
      entityRules:[],
      nexttransfer:null,
      detailData: {}, // 记录详情
      protocol: [], // 协议字段
      data: {}, // 表单数据
      title: '新增',
      key: new Date().getTime(),
      commonid: '',
      funccode: ''//发送消息用
    });
  };

  setExtraData= (type, value) => {
    this.setState({
      commonid: value
    })
  };
  setFieldsConfig = (formData) => { //客户引用时 需要对部分字段(引用后填充值得字段)做禁用处理
    let protocolFields = this.state.protocol;
    for (let i = 0 ; i < protocolFields.length ; i++) {
      for (let key in formData) {
        if (protocolFields[i].fieldname === key) {
          protocolFields[i].fieldconfig.isReadOnly = 1;
        }
      }
    }
    this.setState({
      protocol : protocolFields
    })
  }

  render() {
    const { entityId } = this.props;
    const {
      isAdd,
      protocol,
      data,
      entityRules,
      showTypeModal,
      showFormModal,
      routePath,
      selectedEntityType,
      selectedEntityRule,
      dstEntityId,
      title,
      confirmLoading
    } = this.state;

    const hasTable = protocol.some(field => {
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });

    const DynamicFormComponent =isAdd? DynamicFormAdd:DynamicFormEdit;
    const nextTitle=isAdd?'新增'+title:'编辑'+title;
    return (
      <div key={this.state.key}>
        {entityRules && <Modal
          title="请选择转换类型"
          visible={showTypeModal}
          onCancel={this.props.onCancel}
          onOk={this.onRuleModalConfirm}
        >
          <Radio.Group
            value={selectedEntityRule}
            onChange={this.radioOnChange}
          >
            {entityRules.map(rule => (
              <Radio key={rule.dstcategory} value={rule.recid}>{rule.recname}</Radio>
            ))}
          </Radio.Group>
        </Modal>}
      <Modal
        title={nextTitle}
        visible={showFormModal}
        onCancel={this.props.onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        width={document.body.clientWidth > 1400 ? 1200 : 800}
      >
        <DynamicFormComponent
          key={ selectedEntityType|| dstEntityId}
          entityTypeId={selectedEntityType || dstEntityId}
          fields={protocol}
          value={data}
          onChange={val => { this.setState({ data: val }); }}
          ref={form => { this.form = form; }}
          setExtraData={this.setExtraData}
          setFieldsConfig={this.setFieldsConfig}
        />
      </Modal>
      </div>
    );
  }
}

export default EntcommTransferModal;
