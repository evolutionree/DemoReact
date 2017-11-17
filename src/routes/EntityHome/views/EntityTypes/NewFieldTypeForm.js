import React from 'react';
import { Form, Input, Button } from 'antd';

const FormItem = Form.Item;

function NewFieldTypeForm({
  onSubmit,
  btnLoading,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) {
  function handleSubmit(e) {
    validateFields((err, values) => {
      e.preventDefault();
      if (err) return;
      // 提交数据
      onSubmit(values);
    });
  }
  return (
    <Form inline onSubmit={handleSubmit}>
      <FormItem>
        {getFieldDecorator('newType', {
          rules: [{ required: true, message: '请输入类型名称' }]
        })(<Input placeholder="类型名称" />)}
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit" loading={btnLoading}>添加</Button>
      </FormItem>
    </Form>
  );
}

export default Form.create()(NewFieldTypeForm);
