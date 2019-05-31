import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Radio, InputNumber, Input, Tabs } from 'antd';
import _ from 'lodash';
import SelectFlowUser from './SelectFlowUser';
import SelectFlowUserMultiple from './SelectFlowUserMultiple';
import SelectStepFields from './SelectStepFields';
import SelectUser from '../../../../../components/DynamicForm/controls/SelectUser';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

const radioStyle = {
  display: 'block',
  marginRight: '700px'
};

class SelectFlowUserAll extends Component {
  render() {
    const { value, onChange, entities, nodeType } = this.props;
    return (
      nodeType === 0 ?
        <SelectFlowUser value={value} onChange={onChange} entities={entities} /> :
        <SelectFlowUserMultiple value={value} onChange={onChange} />
    );
  }
}

class SelectCopyUser extends Component {
  onDataChange = (keyValues) => {
    const { onChange, value } = this.props;
    onChange({
      ...value,
      data: {
        ...value.data,
        ...keyValues
      }
    });
  };

  onRadioChange = event => {
    this.onTypeChange(event.target.value);
  };

  onTypeChange = type => {
    // 初始化data
    const data = {};
    this.props.onChange({
      type,
      data
    });
  };

  onSelectChange = (field, e) => this.onDataChange({ [field]: e.target.value });

  render() {
    const { value = {} } = this.props;
    const { type = 17, data } = value;

    const cpuserid = data ? data.cpuserid : '';
    const cpusername = data ? data.cpusername : '';

    return (
      <Radio.Group onChange={this.onRadioChange} value={type} style={{ width: '100%' }}>
        <Radio style={radioStyle} value={17}>指定抄送人</Radio>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <SelectUser
            placeholder="请选择抄送人"
            style={{ width: '260px', height: 'inherit' }}
            value={type === 17 ? cpuserid : ''}
            value_name={type === 17 ? cpusername : ''}
            onChange={() => {}}
            onChangeWithName={({ value, value_name }) => {
              this.onDataChange({ cpuserid: value, cpusername: value_name });
            }}
            isReadOnly={type !== 17 ? 1 : 0}
            multiple={1}
          />
        </div>

        <Radio style={radioStyle} value={16}>自定义抄送人</Radio>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <TextArea
            value={type === 16 ? data.cpfuncname : undefined}
            disabled={type !== 16}
            placeholder="输入需要执行的sql语句"
            onChange={this.onSelectChange.bind(this, 'cpfuncname')}
          />
        </div>
      </Radio.Group>
    );
  }
}

class FlowStepModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {

    }
  }

  stepFieldsValidator = (rule, value, callback) => {
    if (value && value.length) {
      for (let i = 0; i < value.length; i += 1) {
        const item = value[i];
        if (!item.entityid) return callback('请设置实体');
        if (!item.fieldid) return callback('请设置字段');
      }
    }
    callback();
  };

  render() {
    const { form, flowEntities, flowId } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const nodeType = getFieldValue('nodeType');
    const stepUser = form.getFieldValue('stepUser');
    const steptypeid = stepUser && stepUser.type;
    const entityId = Array.isArray(flowEntities) && flowEntities.length && flowEntities[0].entityid;

    const setApproveTitle = (
      <div style={{ position: 'relative' }}>
        <span style={{ color: 'red', position: 'absolute', left: -10, top: 0 }}>*</span>
        设置审批人
    </div>
    );

    return (
      <Modal
        title={steptypeid === -1 || steptypeid === 0 ? '函数设置' : '审批人设置'}
        visible={this.props.visible}
        onCancel={this.props.cancel}
        onOk={this.props.confirm}
        wrapClassName="ant-modal-custom-large"
      >
        {
          this.props.visible && (steptypeid !== -1 && steptypeid !== 0) &&
          <Form>
            <FormItem label="审批节点类型">
              {getFieldDecorator('nodeType', {
                rules: [{ required: true, message: '请选择审批节点类型' }]
              })(
                <Radio.Group>
                  <Radio value={0}>顺序审批</Radio>
                  <Radio value={1}>会审</Radio>
                </Radio.Group>
              )}
            </FormItem>

            <Tabs defaultActiveKey="1" size="small">
              <TabPane forceRender tab={setApproveTitle} key="1">
                <FormItem label="">
                  {
                    getFieldDecorator('stepUser', {
                      rules: [{ required: true, message: '请设置审批人' }]
                    })(<SelectFlowUserAll nodeType={nodeType} entities={flowEntities} />)
                  }
                </FormItem>
              </TabPane>
              <TabPane forceRender tab="设置抄送人" key="2">
                <FormItem label="">
                  {getFieldDecorator('cpUser')(<SelectCopyUser flowId={flowId} entityId={entityId} />)}
                </FormItem>
              </TabPane>
            </Tabs>

            {
              nodeType === 1 &&
              <FormItem label="设置会审通过人数">
                {
                  getFieldDecorator('auditsucc', {
                    rules: [{ required: true, message: '设置会审通过人数' }]
                  })(<InputNumber style={{ width: '100%' }} />)
                }
              </FormItem>
            }

            <FormItem label="设置可改字段">
              {getFieldDecorator('stepFields', {
                rules: [{ validator: this.stepFieldsValidator }]
              })(
                <SelectStepFields entities={flowEntities} />
              )}
            </FormItem>

            <FormItem label="找不到审批人处理方式">
              {getFieldDecorator('notfound', {
                rules: [{ required: true, message: '请选择处理方式' }]
              })(
                <Radio.Group>
                  <Radio value={1}>显示全部人员</Radio>
                  <Radio value={2}>跳过此节点</Radio>
                  {/* <Radio disabled value={0}>暂停流程</Radio> */}
                </Radio.Group>
              )}
            </FormItem>

            <FormItem label="NodeEvent">
              {getFieldDecorator('funcname')(
                <Input maxLength="200" placeholder="关联函数名" />
              )}
            </FormItem>
          </Form>
        }
        {
          this.props.visible && (steptypeid === -1 || steptypeid === 0) &&
          <Form>
            <FormItem label="NodeEvent">
              {getFieldDecorator('funcname')(
                <Input maxLength="200" placeholder="关联函数名" />
              )}
            </FormItem>
          </Form>
        }
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { flowId, showModals, editingFlowStepForm, flowEntities } = state.workflowDesign;
    return {
      visible: /flowStep/.test(showModals),
      editingFlowStepForm,
      flowEntities,
      flowId
    };
  },
  (dispatch, { editingFlowStepForm }) => {
    return {
      dispatch,
      cancel() {
        dispatch({
          type: 'workflowDesign/putState',
          payload: {
            showModals: '',
            editingFlowStepForm: null
          }
        });
      },
      confirm() {
        dispatch({ type: 'workflowDesign/confirmEditingFlowStepForm' });
      }
    };
  }
)(Form.create({
  mapPropsToFields({ editingFlowStepForm }) {
    if (editingFlowStepForm) {
      return _.mapValues(editingFlowStepForm, val => ({ value: val }));
    }
    return {};
  },
  onValuesChange({ dispatch, editingFlowStepForm }, values) {
    // 改变了nodetype
    if (values.nodeType !== undefined) {
      if (values.nodeType === 0) {
        values.stepUser = {
          type: 1,
          data: {}
        };
      } else if (values.nodeType === 1) {
        values.stepUser = {
          type: 2,
          data: {
            userid: '',
            username: ''
          }
        };
      }
      values.cpUser = {
        type: 17,
        data: {}
      };
    }
    dispatch({
      type: 'workflowDesign/putState',
      payload: {
        editingFlowStepForm: { ...editingFlowStepForm, ...values }
      }
    });
  }
})(FlowStepModal));
