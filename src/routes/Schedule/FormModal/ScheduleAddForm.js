import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, message, Radio } from 'antd';
import { generateDefaultFormData } from '../../../components/DynamicForm';
import DynamicFormAdd from './DynamicFormAdd';
import { getGeneralProtocol, addEntcomm } from '../../../services/entcomm';

const Option = Select.Option;

class ScheduleAddForm extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityTypes: PropTypes.array.isRequired,
    cancel: PropTypes.func.isRequired,
    currentUser: PropTypes.object
  };
  static defaultProps = {
    entityId: 'd5e35dd1-2b89-4fcf-9fd0-c4b28821849d'
  };

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

  componentWillMount() {
    this.fetchProtocol(this.props.entityId);
  }

  componentWillReceiveProps(nextProps) {

  }

  submit = () => {
    this.form.validateFields({ force: true }, (err, values) => {
      console.log(values);
      console.log('entcommadd validate callbacked err: ', err);
      if (err) {
        return message.error('请检查表单');
      }
      // addEntcomm(params).then(result => {
      //   this.setState({ confirmLoading: false });
      //   message.success('新增成功');
      //   this.props.done();
      // }).catch(e => {
      //   this.setState({ confirmLoading: false });
      //   console.error(e);
      //   message.error(e.message || '新增失败');
      // });
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

  getTransformFormData(data) {
    let newFormData = {
      ...data
    };
    newFormData.typeCombine = {
      recname: data.recname,
      scheduleType: data.scheduleType
    };

    newFormData.typeCombine12 = {
      starttime: data.starttime,
      endtime: data.endtime,
      allday: data.allday,
      repeatType: data.repeatType,
      repeatEnd: data.repeatEnd
    };
    return newFormData;
  }

  render() {
    const { entityId } = this.props;
    const {
      protocolFields,
      formData
    } = this.state;

    formData.recname = 'recname测试';
    return (
      <DynamicFormAdd
        entityId={entityId}
        entityTypeId={entityId}
        fields={protocolFields}
        value={this.getTransformFormData(formData)}
        onChange={val => { this.setState({ formData: val }); }}
        ref={form => { this.form = form; }}
      />
    );
  }
}

export default ScheduleAddForm;
