/**
 * Created by 0291 on 2018/5/22.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input } from 'antd';
import TextAreaTemplate from './TextAreaTemplate';
import { getWorkFlowDetail, gettitlefields } from '../../services/workflow';

const FormItem = Form.Item;

class SetTitleConfigModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      titleFields: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.props.form.resetFields();
      this.initFormValues();
      this.getFields();
    } else if (isClosing) {
      this.props.form.resetFields();
    }
  }

  getFields = () => {
    const params = { flowid: this.props.currentItem.flowid };
    gettitlefields(params).then(result => {
      const data = result.data;
      this.setState({
        titleFields: data
      });
    });
  }
  initFormValues = () => {
    const params = { flowid: this.props.currentItem.flowid };
    getWorkFlowDetail(params).then(result => {
      const data = result.data.data[0];
      this.props.form.setFieldsValue({
        flowid: data.flowid || '',
        titleconfig: data.titleconfig || ''
      });
    });
  };

  onOk = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.props.confirm(values);
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible={this.props.visible}
        title="设置审批主题"
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          {getFieldDecorator('flowid')(
            <Input maxLength={10} type="hidden" />
          )}
          <FormItem label="设置审批主题内容">
            {getFieldDecorator('titleconfig', {
              rules: [{ required: true, message: '请设置审批主题内容' }]
            })(
              <TextAreaTemplate placeholder="请编写主题内容，如：请审批{商机.负责人}提交的关于商机：{商机.商机名称}的相关内容" fields={this.state.titleFields} />
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
      visible: /titleConfig/.test(showModals),
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
        dispatch({ type: 'workflowList/saveTitleConfig', payload: data });
      }
    };
  }
)(Form.create()(SetTitleConfigModal));
