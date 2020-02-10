import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import { query as queryEntities, queryEntityDetail } from '../../services/entity';
import { IntlInputRequireValidator } from '../../utils/validator';

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
      entities: [],
      controlEntranceFlow: false,
      skipflagDisabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      this.fetchRelEntities();

      if (editingRecord) {
        const { config, isallowtransfer, isallowsign, ...values } = editingRecord;

        this.setState({ controlEntranceFlow: true }, () => {
          form.setFieldsValue({
            ...values,
            ...config,
            expireflag: editingRecord.expireday > 0,
            isallowtransfer,
            isallowsign
          });
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
      this.props.form.setFieldsValue({ expireday: 0 });
    }
  };

  onChangeEntity = entityid => {
    const { form } = this.props;
    if (entityid) {
      queryEntityDetail(entityid)
        .then(res => {
          const { data } = res;
          if (data) {
            const modeltype = parseInt(data.entityproinfo[0].modeltype, 10);
            const controlEntranceFlow = [0, 2].includes(modeltype); // 0 2 独立实体 简单实体
            this.setState({ controlEntranceFlow, skipflagDisabled: modeltype === 2 });
            form.setFieldsValue({ entrance: modeltype === 2 ? 1 : 0 });
          }
        }).catch(e => console.error(e));
    }
  }

  // checkExpireDay = (rule, value, callback) => {
  //   const expireflag = this.props.form.getFieldValue('expireflag');
  //   const expireday = this.props.form.getFieldValue('expireday');
  //   if (expireflag && (!expireday || expireday <= 0)) {
  //     callback('请设置大于0的审批超期时间');
  //     return;
  //   }
  //   callback();
  // };

  onCancel = () => {
    const { form: { resetFields }, cancel } = this.props;
    resetFields();
    cancel();
  }

  // onHandleChange = (key, e) => { // 互斥操作
  //   const { form: { setFieldsValue } } = this.props
  //   if (key === 'isallowtransfer' && e.target.value === 1) {
  //     setFieldsValue({ isallowsign: 0 })
  //   } else if (key === 'isallowsign' && e.target.value === 1) {
  //     setFieldsValue({ isallowtransfer: 0 })
  //   }
  // }

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
      const { entrance, ...rest } = values;
      this.props.confirm({
        resetflag: 1,
        ...rest,
        config: { entrance: entrance || 0 },
        expireflag: undefined,
        flowid: editingRecord ? editingRecord.flowid : undefined
      });
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    const { controlEntranceFlow, skipflagDisabled } = this.state;

    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑审批流程' : '新增审批流程'}
        onCancel={this.onCancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="流程名称">
            {getFieldDecorator('flowname_lang', {
              initialValue: '',
              rules: [
                { required: true, message: '请输入流程名称' },
                { validator: IntlInputRequireValidator }
              ]
            })(
              <IntlInput disabled={isEdit} placeholder="请输入页签名称" maxLength={10} />
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

          <FormItem label="允许转办">
            {getFieldDecorator('isallowtransfer', {
              initialValue: 0,
              normalize: (value) => (value || 0),
              rules: [{ required: true, message: '请设置是否允许转办' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>

          <FormItem label="允许加签">
            {getFieldDecorator('isallowsign', {
              initialValue: 0,
              rules: [{ required: true, message: '请设置是否允许加签' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>

          <FormItem label="允许重新发起审批后跳过上次已通过的节点">
            {getFieldDecorator('isneedtorepeatapprove', {
              initialValue: 0,
              normalize: (value) => (value || 0),
              rules: [{ required: true, message: '请设置是否允许重新发起审批后跳过上次已通过的节点' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>

          {
            controlEntranceFlow ?
              <FormItem label="是否入口工作流">
                {getFieldDecorator('entrance', {
                  initialValue: 0,
                  rules: [{ required: true, message: '请选择是否入口工作流程' }]
                })(
                  <Radio.Group disabled={skipflagDisabled}>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </Radio.Group>
                )}
              </FormItem> : null
          }
          <FormItem label="关联实体">
            {getFieldDecorator('entityid', {
              rules: [{ required: true, message: '请选择关联实体' }],
              onChange: this.onChangeEntity
            })(
              <Select placeholder="请选择关联实体" disabled={isEdit}>
                {this.state.entities.map(entity => (
                  <Option key={entity.entityid}>{getIntlText('entityname', entity)}</Option>
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
)(Form.create({})(WorkflowFormModal));
