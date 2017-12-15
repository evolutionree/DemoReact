import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Radio, InputNumber, Input } from 'antd';
import _ from 'lodash';
import SelectFlowUser from './SelectFlowUser';
import SelectFlowUserMultiple from './SelectFlowUserMultiple';
import SelectStepFields from './SelectStepFields';

class SelectFlowUserAll extends Component {
  render() {
    const { nodeType, value, onChange } = this.props;
    return nodeType === 0 ? (
      <SelectFlowUser value={value} onChange={onChange} entities={this.props.entities} />
    ) : (
      <SelectFlowUserMultiple value={value} onChange={onChange} />
    );
  }
}

const FormItem = Form.Item;

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
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const nodeType = getFieldValue('nodeType');
    return (
      <Modal
        title="审批人设置"
        visible={this.props.visible}
        onCancel={this.props.cancel}
        onOk={this.props.confirm}
        wrapClassName="ant-modal-custom-large"
      >
        {this.props.visible && <Form>
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
          <FormItem label="设置审批人">
            {getFieldDecorator('stepUser', {
              rules: [{ required: true, message: '请设置审批人' }]
            })(
              <SelectFlowUserAll nodeType={nodeType} entities={this.props.flowEntities} />
            )}
          </FormItem>
          {nodeType === 1 && <FormItem label="设置会审通过人数">
            {getFieldDecorator('auditsucc', {
              rules: [{ required: true, message: '设置会审通过人数' }]
            })(
              <InputNumber style={{ width: '100%' }} />
            )}
          </FormItem>}
          {/*{nodeType === 1 && <FormItem label="设置审批人">*/}
            {/*{getFieldDecorator('stepUser', {*/}
              {/*rules: [{ required: true, message: '请设置审批人' }]*/}
            {/*})(*/}
              {/*<SelectFlowUserMultiple />*/}
            {/*)}*/}
          {/*</FormItem>}*/}
          <FormItem label="设置可改字段">
            {getFieldDecorator('stepFields', {
              rules: [{ validator: this.stepFieldsValidator }]
            })(
              <SelectStepFields entities={this.props.flowEntities} />
            )}
          </FormItem>
          <FormItem label="NodeEvent">
            {getFieldDecorator('nodeevent')(
              <Input maxLength={200} placeholder="关联函数名" />
            )}
          </FormItem>
        </Form>}
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, editingFlowStepForm, flowEntities } = state.workflowDesign;
    return {
      visible: /flowStep/.test(showModals),
      editingFlowStepForm,
      flowEntities
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
    }
    dispatch({
      type: 'workflowDesign/putState',
      payload: {
        editingFlowStepForm: { ...editingFlowStepForm, ...values }
      }
    });
  }
})(FlowStepModal));
