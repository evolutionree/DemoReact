import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';
import { query as queryEntities } from '../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;

class WorkflowFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editingRecord: PropTypes.object,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entities: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      this.fetchRelEntities();

      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          expireflag: editingRecord.expireday > 0
        });
      } else {
        form.resetFields();
      }
    }
  }

  fetchRelEntities = () => {
    const params = {
      pageIndex: 1,
      pageSize: 999,
      typeId: -1,
      entityName: '',
      status: 1
    };
    queryEntities(params).then(result => {
      const entities = result.data.pagedata;
      const entitiesRelAudit = entities.filter(
        ({ modeltype, relaudit }) => modeltype === 0 || (relaudit && modeltype === 2) || (relaudit && modeltype === 3)
      );
      this.setState({ entities: entitiesRelAudit });
    });
  };

  onExpireFlagChange = event => {
    const checked = event.target.checked;
    if (!checked) {
      this.props.form.setFieldsValue({ expireday: 0 })
    }
  };

  // checkExpireDay = (rule, value, callback) => {
  //   const expireflag = this.props.form.getFieldValue('expireflag');
  //   const expireday = this.props.form.getFieldValue('expireday');
  //   if (expireflag && (!expireday || expireday <= 0)) {
  //     callback('请设置大于0的审批超期时间');
  //     return;
  //   }
  //   callback();
  // };

  onOk = () => {
    const { form, editingRecord } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.expireflag) {
        if (!values.expireday || values.expireday <= 0) {
          message.error('请设置大于0的审批超期时间');
          return;
        } else if (values.expireday % 1 !== 0) {
          message.error('请输入整数天数');
          return;
        }
      }
      this.props.confirm({
        resetflag: 1,
        ...values,
        expireflag: undefined,
        flowid: editingRecord ? editingRecord.flowid : undefined
      });
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑审批流程' : '新增审批流程'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="流程名称">
            {getFieldDecorator('flowname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入流程名称' }]
            })(
              <Input disabled={isEdit} placeholder="请输入流程名称" maxLength={10} />
            )}
          </FormItem>
          <FormItem label="流程类型">
            {getFieldDecorator('flowtype', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择流程类型' }]
            })(
              <Radio.Group disabled={isEdit}>
                <Radio value={0}>自由流程（流程节点数量不确定，由审批人决定流程的结束）</Radio>
                <Radio value={1}>固定流程（流程节点数量固定）</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="允许退回">
            {getFieldDecorator('backflag', {
              initialValue: 0,
              rules: [{ required: true, message: '请设置是否允许退回' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="跳过流程">
            {getFieldDecorator('skipflag', {
              initialValue: 0,
              rules: [{ required: true, message: '请设置是否跳过流程' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="关联实体">
            {getFieldDecorator('entityid', {
              rules: [{ required: true, message: '请选择关联实体' }]
            })(
              <Select placeholder="请选择关联实体" disabled={isEdit}>
                {this.state.entities.map(entity => (
                  <Option key={entity.entityid}>{entity.entityname}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="超时中止">
            {getFieldDecorator('expireflag', {
              initialValue: false,
              valuePropName: 'checked'
            })(
              <Checkbox onChange={this.onExpireFlagChange}>
                <span>审批节点审批时间超过 </span>
                {getFieldDecorator('expireday', {
                  initialValue: 0
                })(
                  <InputNumber disabled={!getFieldValue('expireflag')} style={{ width: '60px' }} />
                )}
                <span> 天时自动中止审批</span>
              </Checkbox>
            )}
          </FormItem>
          <FormItem label="流程说明">
            {getFieldDecorator('remark', {
              initialValue: ''
            })(
              <Input type="textarea" placeholder="请输入流程说明" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currentItems, modalPending } = state.workflowList;
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currentItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'workflowList/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'workflowList/save', payload: data });
      }
    };
  }
)(Form.create()(WorkflowFormModal));
