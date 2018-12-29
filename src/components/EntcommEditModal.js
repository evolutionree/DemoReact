import React, { PropTypes, Component } from 'react';
import { Modal, Button, message } from 'antd';
import { DynamicFormEdit } from './DynamicForm';
import { getGeneralProtocol, getEntcommDetail, editEntcomm } from '../services/entcomm';

class EntcommEditModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    done: PropTypes.func,
    footer: PropTypes.arrayOf(PropTypes.node),
    title: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      typeId: '',
      protocol: [], // 协议字段
      detailData: {}, // 记录详情
      formData: {}, // 表单数据
      confirmLoading: false,
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      excutingJSLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { entityId, recordId } = nextProps;
      this.fetchDetailAndProtocol(entityId, recordId);
    } else if (isClosing) {
      this.resetState();
    }
  }

  fetchDetailAndProtocol = (entityId, recordId) => {
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
      message.error(err.message);
      //this.props.cancel();
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

  handleSubmit = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }

      const params = {
        typeid: this.state.detailData.rectype || this.props.entityId,
        // flowid: this.props.flow ? this.props.flow.flowid : undefined,
        recid: this.state.detailData.recid,
        fieldData: values
      };
      this.setState({ confirmLoading: true });
      editEntcomm(params).then(result => {
        this.setState({ confirmLoading: false });
        message.success('提交数据成功');
        this.props.done(result);
      }).catch(e => {
        this.setState({ confirmLoading: false });
        console.error(e);
        message.error(e.message || '提交数据失败');
      });
    });
  };

  resetState = () => {
    this.setState({
      protocol: [],
      formData: {},
      key: new Date().getTime(),
      excutingJSLoading: false
    });
  };

  excutingJSStatusChange = (status) => {
    this.setState({
      excutingJSLoading: status
    });
  }

  render() {
    const { visible, footer, entityId } = this.props;
    const { typeId, protocol, formData, confirmLoading, excutingJSLoading } = this.state;

    const hasTable = protocol.some(field => {
      return (field.controltype === 24 && field.fieldconfig.isVisible === 1)
        || (field.controltype === 5 && field.fieldconfig.textType === 1 && field.fieldconfig.isVisible === 1);
    });

    return (
      <Modal
        title={this.props.title || `编辑${this.props.entityName || '表单'}`}
        visible={visible}
        onCancel={this.props.cancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        width={document.body.clientWidth > 1400 ? 1200 : 800}
        wrapClassName="DynamicFormModal"
        key={this.state.key}
        footer={[
          <Button key="back" type="default" onClick={this.props.cancel}>取消</Button>,
          <Button key="submit" loading={confirmLoading || excutingJSLoading} onClick={this.handleSubmit}>提交</Button>
        ]}
      >
        <DynamicFormEdit
          entityId={entityId}
          entityTypeId={typeId}
          fields={protocol}
          value={formData}
          onChange={val => { this.setState({ formData: val }); }}
          ref={form => { this.form = form; }}
          excutingJSStatusChange={this.excutingJSStatusChange}
        />
      </Modal>
    );
  }
}

export default EntcommEditModal;
