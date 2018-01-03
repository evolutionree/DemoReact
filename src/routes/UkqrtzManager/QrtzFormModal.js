import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Radio, message } from 'antd';
import _ from 'lodash';
import InputTextarea from "../../components/DynamicForm/controls/InputTextarea";

const FormItem = Form.Item;

class QrtzFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};


  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      if (nextProps.isEdit) {
        const record = nextProps.editingRecord;
        const fieldsValue = record;
        nextProps.form.setFieldsValue({
          ...fieldsValue
        });
      } else {
        nextProps.form.resetFields();
      }
    }
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const { isEdit } = this.props;
      const params = {
        recname: values.recname,
        recstatus: 0,
        triggertime: values.triggertime,
        actiontype: values.actiontype,
        actioncmd: values.actioncmd,
        actionparameters: values.actionparameters,
        remark: values.remark
      };
      if (isEdit) {
        params.recid = this.props.editingRecord.recid;
        params.recstatus = this.props.editingRecord.recstatus;
        this.props.update(params);
      } else {
        this.props.add(params);
      }

    });
  };

  render() {
    const { visible,isEdit, cancel, form } = this.props;
    return (
      <Modal
        visible={visible}
        title={isEdit ? '调度事务编辑' : '调度事务新增'}
        onCancel={cancel}
        onOk={this.handleSubmit}
      >
        <Form>
          {form.getFieldDecorator('recid')(
            <Input disabled type="hidden" />
          )}

          <FormItem label="调度事务名称">
            {form.getFieldDecorator('recname')(
              <Input type="text" />
            )}
          </FormItem>
          <FormItem label="调度时间安排">
            {form.getFieldDecorator('triggertime')(
              <Input type="text" />
            )}
          </FormItem>
          <FormItem label="任务类型">
            {form.getFieldDecorator('actiontype', {
              initialValue: 1
            })(
              <Radio.Group>
                <Radio value={1}>内部服务</Radio>
                <Radio value={2}>数据库函数</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="任务命令">
            {form.getFieldDecorator('actioncmd')(
              <Input type="text" />
            )}
          </FormItem>
          <FormItem label="执行参数">
            {form.getFieldDecorator('actionparameters')(
              <InputTextarea type="text" />
            )}
          </FormItem>
          <FormItem label="备注">
            {form.getFieldDecorator('remark')(
              <InputTextarea type="text" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showInfoModals, currItems } = state.ukqrtzmanager;
    return {
      visible: /add|edit/.test(showInfoModals),
      isEdit: /edit/.test(showInfoModals),
      editingRecord: currItems[0]
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'ukqrtzmanager/showInfoModals', payload: '' });
      },
      update(formData) {
        dispatch({ type: 'ukqrtzmanager/update', payload: formData });
      },
      add(formData){
        dispatch({ type: 'ukqrtzmanager/add', payload: formData });
      }
    };
  }
)(Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  }
})(QrtzFormModal));
