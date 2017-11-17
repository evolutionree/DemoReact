import React, { PropTypes, Component } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;

class VocationFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !/edit|add/.test(this.props.showModals) && /edit|add/.test(nextProps.showModals);
    if (isOpening) {
      const { currentRecords, showModals, form } = nextProps;
      form.resetFields();

      const isEdit = /edit/.test(showModals);
      if (!isEdit) {
      } else {
        const record = currentRecords[0];
        const tmp = _.pick(record, ['vocationname', 'description']);
        form.setFieldsValue(tmp);
      }
    }
  }

  render() {
    function handleSubmit(data) {
      form.validateFields((err, values) => {
        if (err) return;
        onOk({
          vocationid: isEdit ? editingRecord.vocationid : undefined,
          ...values
        });
      });
    }
    function handleCancel() {
      form.resetFields();
      onCancel();
    }

    const {
      form,
      showModals,
      currentRecords,
      savePending,
      onOk,
      onCancel
    } = this.props;

    const isEdit = /edit/.test(showModals);
    const editingRecord = currentRecords[0];
    const { getFieldDecorator: decorate } = form;

    return (
      <Modal title={isEdit ? '编辑职能' : '新建职能'}
             visible={/edit|add/.test(showModals)}
             onOk={handleSubmit}
             onCancel={handleCancel}
             confirmLoading={savePending}>
        <Form>
          <FormItem label="职能名称">
            {decorate('vocationname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入职能名称' }]
            })(
              <Input placeholder="请输入职能名称" maxLength={50} />
            )}
          </FormItem>

          <FormItem label="职能描述">
            {decorate('description',{
              initialValue: ''
            })(
              <Input type="textarea" maxLength={200} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VocationFormModal);
