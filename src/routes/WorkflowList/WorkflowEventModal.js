import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import * as _ from 'lodash';
import { queryFreeFlowEvent } from '../../services/workflow';

const FormItem = Form.Item;
const Option = Select.Option;

class WorkflowEventModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    modalPending: PropTypes.bool,
    currentItem: PropTypes.object
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
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.props.form.resetFields();
      this.initFormValues();
    } else if (isClosing) {
      // this.props.form.resetFields();
    }
  }

  initFormValues = () => {
    const params = { flowid: this.props.currentItem.flowid };
    queryFreeFlowEvent(params).then(result => {
      const funcs = result.data;
      const beginnode = _.find(funcs, ['steptype', 0]) || {};
      const endnode = _.find(funcs, ['steptype', 1]) || {};
      this.props.form.setFieldsValue({
        beginnodefunc: beginnode.funcname,
        endnodefunc: endnode.funcname
      });
    })
  };

  onOk = () => {
    const { form, currentItem } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.props.confirm({
        ...values,
        flowid: currentItem.flowid
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible={this.props.visible}
        title="设置流程节点函数"
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="开始节点函数">
            {getFieldDecorator('beginnodefunc')(
              <Input placeholder="请输入开始节点函数" />
            )}
          </FormItem>
          <FormItem label="结束节点函数">
            {getFieldDecorator('endnodefunc')(
              <Input placeholder="请输入结束节点函数" />
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
      visible: /flowEvent/.test(showModals),
      currentItem: currentItems[0],
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'workflowList/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'workflowList/saveFreeFlowEvent', payload: data });
      }
    };
  }
)(Form.create()(WorkflowEventModal));
