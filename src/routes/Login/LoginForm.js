import React from 'react';
import { Form, Input, Button, Icon, Checkbox } from 'antd';

const FormItem = Form.Item;

function LoginForm({
  onSubmit,
  submitBtnLoading,
  rememberedPwd,
  showError,
  suffix,
  changeCode,
  form: {
    getFieldDecorator,
    validateFields
  }
}) {
  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (err) return;
      onSubmit(values);
    });
  }

  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <FormItem>
        {
          getFieldDecorator('accountname', {
            initialValue: rememberedPwd ? rememberedPwd.account : '',
            rules: [{ required: true, message: '请输入帐号' }]
          })(
            <Input
              prefix={<Icon style={{ color: '#ccc' }} type="user" />}
              placeholder="请输入帐号"
              size="large"
            />
          )
        }
      </FormItem>
      <FormItem>
        {
          getFieldDecorator('accountpwd', {
            initialValue: rememberedPwd ? rememberedPwd.pwd : '',
            rules: [{ required: true, message: '请输入密码' }]
          })(
            <Input
              prefix={<Icon style={{ color: '#ccc' }} type="lock" />}
              type="password"
              placeholder="请输入密码"
              size="large"
            />
          )
        }
      </FormItem>
      <Form.Item>
          {getFieldDecorator('sendcode', {
          rules: [{ required: true, message: '请输入校验码!' },],
          })(
          <Input
          size="large"
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          suffix={suffix}
          onChange={changeCode}
          placeholder="请输入校验码"
          />,
          )}
      </Form.Item>
      <FormItem>
        {
          getFieldDecorator('rememberpwd', {
            initialValue: !!rememberedPwd,
            valuePropName: 'checked'
          })(
            <Checkbox>
              记住密码
            </Checkbox>
          )
        }
      </FormItem>
      <FormItem>
        <Button htmlType="submit" loading={submitBtnLoading}>
          登录
        </Button>
      </FormItem>
    </Form>
  );
}
LoginForm.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
  submitBtnLoading: React.PropTypes.bool,
  form: React.PropTypes.object,
  rememberedPwd: React.PropTypes.shape({
    account: React.PropTypes.string,
    pwd: React.PropTypes.string
  })
};

export default Form.create()(LoginForm);
