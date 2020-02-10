import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Radio, InputNumber, Input, Tabs, Select, Checkbox } from 'antd';
import _ from 'lodash';
import SelectFlowUser from './SelectFlowUser';
import SelectFlowUserMultiple from './SelectFlowUserMultiple';
import SelectStepFields from './SelectStepFields';
import SelectStepForms from './SelectStepForms';
import SelectUser from '../../../../../components/DynamicForm/controls/SelectUser';
import SelectNumber from '../../../../../components/SelectNumber';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const { Option } = Select

const radioStyle = {
  display: 'block',
  marginRight: '700px'
};

const CheckboxCom = (props) => {
  const { value, onChange, onChangeState } = props

  return (
    <Checkbox checked={!!value} onChange={(e) => {
      onChange(e.target.checked ? 1 : 0)
      onChangeState(e.target.checked ? 1 : 0)
    }}>审批节点审批时间超过</Checkbox>
  )
}

const SelectField = ({ keys = 'fieldname', value, onChange, disabled, fields, placeholder, style }) => {
  function onSelectChange(fieldname) {
    if (!fieldname) return onChange()
    const fieldlabel = _.find(fields, [[keys], fieldname]).displayname
    onChange(fieldname, fieldlabel)
  }

  return (
    <Select
      value={value}
      onChange={onSelectChange}
      disabled={disabled}
      placeholder={placeholder}
      style={{ width: 230, ...style }}
    >
      {fields.map(item => <Option key={item[keys]}>{item.displayname}</Option>)}
    </Select>
  )
}

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
            dataRange={1}
            placeholder="请选择抄送人"
            style={{ width: '260px', height: 'inherit' }}
            value={type === 17 ? cpuserid : ''}
            value_name={type === 17 ? cpusername : ''}
            onChange={() => { }}
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

class SelectPassUser extends Component {
  onDataChange = (keyValues) => {
    const { onChange, value } = this.props;
    onChange({
      ...value,
      ...keyValues
    });
  };

  onRadioChange = event => {
    this.onTypeChange(event.target.value);
  };

  onTypeChange = type => {
    const value = { type }
    if (type === 3) value.reportrelation = { type: 1 }
    this.props.onChange(value);
  };

  onSelectChange = (field, e) => this.onDataChange({ [field]: e.target.value });

  render() {
    const { value = {}, entities } = this.props;
    const {
      type = 1,
      userids,
      usernames,
      spfuncname,
      reportrelation,
      entityid,
      fieldname
    } = value;

    let formFields = [];
    let userFields = [];
    let reportrelationList = [];

    if (entities && entities[0]) {
      formFields = entities[0].forms;
      userFields = entities[0].fields.filter(field => [25, 1002, 1003, 1006].indexOf(field.controltype) !== -1);
      reportrelationList = entities[0].reportrelationList;
    }

    const reportrelationdata = reportrelation ? reportrelation : {};

    return (
      <Radio.Group onChange={this.onRadioChange} value={type} style={{ width: '100%' }}>
        {/* type 1 */}
        <Radio style={radioStyle} value={1}>指定传阅人</Radio>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <SelectUser
            dataRange={1}
            placeholder="请选择传阅人"
            style={{ width: '260px', height: 'inherit' }}
            value={type === 1 ? userids : ''}
            value_name={type === 1 ? usernames : ''}
            onChange={() => { }}
            onChangeWithName={({ value, value_name }) => {
              this.onDataChange({ userids: value, usernames: value_name });
            }}
            isReadOnly={type !== 1 ? 1 : 0}
            multiple={1}
          />
        </div>

        {/* type 3 */}
        <Radio style={radioStyle} checked={type === 3} value={3}>汇报关系</Radio>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <SelectNumber
            value={(type === 3 && reportrelationdata) ? (reportrelationdata.type ? reportrelationdata.type + '' : '1') : '1'}
            onChange={(reportrelationtype) => {
              this.onDataChange({
                reportrelation: { ...reportrelationdata, type: reportrelationtype },
                fieldlabel: ['流程发起人', '上一步骤处理人', '表单中的人员'][reportrelationtype * 1 - 1]
              });
            }}
            disabled={type !== 3}
            style={{ width: '260px' }}
          >
            {['流程发起人', '上一步骤处理人', '表单中的人员'].map((item, index) => <Option key={index} value={(index + 1) + ''}>{item}</Option>)}
          </SelectNumber>
          { // 表单中的人员
            type === 3 && (reportrelationdata && reportrelationdata.type * 1) === 3 &&
            <SelectField
              keys="entityid"
              style={{ width: 160 }}
              value={(type === 3 && entityid) ? entityid : undefined}
              placeholder="请选择表单"
              onChange={(entityid, fieldlabel) => this.onDataChange({ entityid, fieldlabel })}
              fields={formFields}
            />
          }
          { // 表单中的人员
            type === 3 && (reportrelationdata && reportrelationdata.type * 1) === 3 &&
            <SelectField
              placeholder="请选择表单用户字段"
              value={(type === 3 && fieldname) ? fieldname : undefined}
              onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
              fields={userFields}
            />
          }
          {
            <SelectField
              keys="reportrelationid"
              disabled={type !== 3}
              value={(type === 3 && reportrelationdata) ? reportrelationdata.id : undefined}
              placeholder="请选择汇报关系"
              onChange={(reportrelationid, fieldlabel) => this.onDataChange({ reportrelation: { ...reportrelationdata, id: reportrelationid }, fieldlabel })}
              fields={reportrelationList}
            />
          }
        </div>

        {/* type 2 */}
        <Radio style={radioStyle} value={2}>自定义传阅人</Radio>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <TextArea
            value={type === 2 ? spfuncname : undefined}
            disabled={type !== 2}
            placeholder="输入需要执行的sql语句"
            onChange={this.onSelectChange.bind(this, 'spfuncname')}
          />
        </div>
      </Radio.Group>
    );
  }
}

class SelectFormComponent extends Component {
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

  onRadioChange = event => this.onTypeChange(event.target.value);

  onTypeChange = type => {
    // 初始化data
    const data = {};
    this.props.onChange({ type, data });
  };

  onSelectChange = (field, data) => this.onDataChange({ [field]: data });

  render() {
    const { value = {}, entities, flowId } = this.props;
    const { type = 1, data = {} } = value;

    const { stepFields, globaljs } = data

    return (
      <div>
        <Radio.Group onChange={this.onRadioChange} value={type} style={{ width: '100%' }}>
          <Radio value={1}>不修改</Radio>
          <Radio value={2}>按字段修改</Radio>
          <Radio value={3}>整表修改</Radio>
        </Radio.Group>
        {
          type !== 1 ? (
            <div style={{ margin: '10px 0' }}>
              {type === 2 ? <SelectStepFields value={stepFields} onChange={this.onSelectChange.bind(this, 'stepFields')} entities={entities} /> : null}
              {type === 3 ? <SelectStepForms value={globaljs} flowId={flowId} onChange={this.onSelectChange.bind(this, 'globaljs')} /> : null}
            </div>
          ) : null
        }
      </div>
    );
  }
}

class FlowStepModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    const efsForm = props.editingFlowStepForm
    const nodeType = efsForm ? (efsForm.nodeType !== undefined ? efsForm.nodeType : 0) : 0
    this.state = {
      nodeType,
      activeKey: '1',
      isscheduled: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const efsForm = nextProps.editingFlowStepForm
      const nodeType = efsForm ? (efsForm.nodeType !== undefined ? efsForm.nodeType : 0) : 0
      const isscheduled = efsForm ? (efsForm.isscheduled !== undefined ? efsForm.isscheduled : 0) : 0
      this.setState({ nodeType, isscheduled });
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

  onChangeRadio = (e) => {
    const nodeType = e.target.value;
    if ([1, 2].includes(nodeType)) this.setState({ activeKey: '1' });
    this.setState({ nodeType });
  }

  onChangeCheckbox = (value) => {
    const isscheduled = value;

    this.setState({ isscheduled });
  }

  onChangeTabs = (activeKey) => this.setState({ activeKey });

  render() {
    const { form, flowEntities, flowId } = this.props;
    const { nodeType, activeKey, isscheduled } = this.state;

    const { getFieldDecorator } = form;
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
        okText="确认"
        wrapClassName="ant-modal-custom-large"
      >
        {
          this.props.visible && (steptypeid !== -1 && steptypeid !== 0) &&
          <Form>
            <FormItem label="审批节点类型">
              {getFieldDecorator('nodeType', {
                rules: [{ required: true, message: '请选择审批节点类型' }]
              })(
                <Radio.Group onChange={this.onChangeRadio}>
                  <Radio value={0}>顺序审批</Radio>
                  <Radio value={1}>会审</Radio>
                  <Radio value={2}>意见征集</Radio>
                </Radio.Group>
              )}
            </FormItem>

            <Tabs activeKey={activeKey} onChange={this.onChangeTabs}>
              <TabPane forceRender tab={setApproveTitle} key="1">
                <FormItem label="">
                  {
                    getFieldDecorator('stepUser', {
                      rules: [{ required: true, message: '请设置审批人' }]
                    })(<SelectFlowUserAll nodeType={nodeType} entities={flowEntities} />)
                  }
                </FormItem>
              </TabPane>
              {
                nodeType === 0 &&
                <TabPane forceRender tab="设置抄送人" key="2" disabled={[1, 2].includes(nodeType)}>
                  <FormItem label="">
                    {getFieldDecorator('cpUser')(<SelectCopyUser flowId={flowId} entityId={entityId} />)}
                  </FormItem>
                </TabPane>
              }
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
            {
              [0, 1].includes(nodeType) &&
              <FormItem label="设置可改信息">
                {getFieldDecorator('stepFields', {
                  rules: [{ validator: this.stepFieldsValidator }]
                })(
                  <SelectFormComponent entities={flowEntities} flowId={flowId} />
                )}
              </FormItem>
            }
            {
              [0, 1].includes(nodeType) &&
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
            }
            {
              nodeType === 2 &&
              <FormItem label="超时自动通过">
                {
                  getFieldDecorator('isscheduled', {
                  })(<CheckboxCom onChangeState={this.onChangeCheckbox} />)
                }
                {
                  getFieldDecorator('deadline', {
                    initialValue: 0,
                  })(<InputNumber style={{ width: 55 }} min={0} disabled={!isscheduled} />)
                }
                小时自动通过
              </FormItem>
            }
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

            {
              steptypeid === -1 ? (
                <Tabs activeKey={activeKey} onChange={this.onChangeTabs}>
                  <TabPane forceRender tab="通过" key="1">
                    <FormItem label="">
                      {
                        getFieldDecorator('approve', {
                          rules: [{ required: true, message: '请设置审批人' }]
                        })(<SelectPassUser entities={flowEntities} flowId={flowId} entityId={entityId} />)
                      }
                    </FormItem>
                  </TabPane>
                  <TabPane forceRender tab="不通过" key="2">
                    <FormItem label="">
                      {getFieldDecorator('failed')(<SelectPassUser entities={flowEntities} flowId={flowId} entityId={entityId} />)}
                    </FormItem>
                  </TabPane>
                </Tabs>
              ) : null
            }
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
      } else if ([1, 2].includes(values.nodeType)) {
        values.stepUser = {
          type: 2,
          data: {
            userid: '',
            username: ''
          }
        };
        values.auditsucc = 2
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
