import React from 'react';
import { Form, Input, Button, message } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { IntlInputRequireValidator } from '../../utils/validator';

const FormItem = Form.Item;

function NewParamForm({
  fields,
  onSubmit,
  btnLoading,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldProps,
    resetFields
  },
  toolbarNode,
  showAdd = true
}) {
  function handleSubmit(e) {
    validateFields((err, values) => {
      e.preventDefault();
      if (err) {
        Object.keys(err).forEach(key => {
          message.error(err[key].errors[0].message);
        });
        return;
      }
      // 提交数据
      onSubmit(values);
      resetFields();
    });
  }
  return (
    <Form inline onSubmit={handleSubmit}>
      {toolbarNode ? <FormItem>
        {toolbarNode}
      </FormItem> : null}
      {showAdd && fields.map(field => {
        return field.intl ? <FormItem key={field.key}>
          {getFieldDecorator(field.key, {
            initialValue: '',
            validateTrigger: 'onChange',
            rules: [{
              validator: IntlInputRequireValidator
            }]
          })(
            <IntlInput placeholder={`请输入${field.name}`} maxLength={field.maxLength} />
          )}
        </FormItem> : <FormItem key={field.key}>
          {getFieldDecorator(field.key, {
            initialValue: '',
            validateTrigger: 'onChange',
            rules: [{ required: true, message: `${field.name}不能为空` }]
          })(
            <Input placeholder={`请输入${field.name}`} maxLength={field.maxLength} />
          )}
          {/*<Input*/}
          {/*placeholder={`请输入${field.name}`}*/}
          {/*{...getFieldProps(field.key, {*/}
          {/*initialValue: '',*/}
          {/*validateTrigger: 'onChange',*/}
          {/*rules: [{ required: true, message: `${field.name}不能为空` }]*/}
          {/*})}*/}
          {/*/>*/}
        </FormItem>;
      })}
      {showAdd && <FormItem>
        <Button type="primary" htmlType="submit" loading={btnLoading}>添加</Button>
      </FormItem>}
    </Form>
  );
}

export default Form.create()(NewParamForm);
