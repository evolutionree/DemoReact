import React from 'react';
import { Form, Input, Modal } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';

const FormItem = Form.Item;

function ModifyPwdModal({
    form: {
      getFieldDecorator,
      validateFields,
      getFieldValue,
      resetFields
    },
    showModals,
    modifyPwd,
    cancel
  }) {
  function handleOk() {
    validateFields((err, values) => {
      if (err) return;
      modifyPwd(_.pick(values, ['orginpwd', 'accountpwd']));
    })
  }
  function handelCancel() {
    resetFields();
    cancel();
  }
  function checkSameChar(rule, value, callback) {
    if (!value) return callback();
    if (value.length < 6) return callback();
    let isAllSameChar = true;
    const chars = value.split('');
    for (let i = 1; i < chars.length; i++) {
      if (chars[i] !== chars[0]) isAllSameChar = false;
    }
    if (isAllSameChar) {
      callback('密码不能全部相同');
    } else {
      callback();
    }
  }
  function checkPasswordConfirm(rule, value, callback) {
    if (value && value !== getFieldValue('accountpwd')) {
      callback('两次填写的密码不一致');
    } else {
      callback();
    }
  }

  return (
    <Modal
      title="修改密码"
      visible={/password/.test(showModals)}
      onOk={handleOk}
      onCancel={handelCancel}
      afterClose={resetFields}
    >
      <Form>
        <FormItem label="原密码">
          {getFieldDecorator('orginpwd', {
            initialValue: '',
            rules: [{ required: true, message: '请输入原密码' }]
          })(
            <Input type="password" maxLength="16" placeholder="请输入您的原密码" />
          )}
        </FormItem>
        <FormItem label="新密码">
          {getFieldDecorator('accountpwd', {
            initialValue: '',
            rules: [{
              required: true,
              pattern: /^.{6,16}$/,
              message: '密码为6-16位字符'
            }, {
              validator: checkSameChar
            }]
          })(
            <Input onPaste={(e) => {
              e.preventDefault();
            }} type="password" maxLength="16" placeholder="请输入6-16位新密码" />
          )}
        </FormItem>
        <FormItem label="确认密码">
          {getFieldDecorator('confirm', {
            initialValue: '',
            rules: [{
              required: true, message: '请输入确认密码'
            }, {
              validator: checkPasswordConfirm
            }]
          })(
            <Input type="password" maxLength="16" placeholder="请输入确认密码" />
          )}
        </FormItem>
      </Form>
    </Modal>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    modifyPwd: data => {
      dispatch({ type: 'app/modifyPassword', payload: data })
    },
    cancel: () => {
      dispatch({ type: 'app/showModals', payload: '' })
    }
  }
}
export default connect(
  state => state.app,
  mapDispatchToProps
)(Form.create()(ModifyPwdModal));
