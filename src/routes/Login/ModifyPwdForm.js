/**
 * Created by 0291 on 2018/5/17.
 */
import React from 'react'
import { Form, Input, Button } from 'antd'
import _ from 'lodash'

const FormItem = Form.Item

function ModifyPwdForm ({
  onSubmit,
  submitBtnLoading,
  form: { getFieldDecorator, validateFields, getFieldValue, setFieldsValue }
}) {
  function handleSubmit (e) {
    e.preventDefault()
    validateFields((err, values) => {
      if (err) return
      onSubmit(_.pick(values, ['orginpwd', 'accountpwd']))
    })
  }

  function checkSameChar (rule, value, callback) {
    if (!value) return callback()
    if (value.length < 6) return callback()
    let isAllSameChar = true
    const chars = value.split('')
    for (let i = 1; i < chars.length; i += 1) {
      if (chars[i] !== chars[0]) isAllSameChar = false
    }
    const confirmValue = getFieldValue('confirm')

    if (isAllSameChar) {
      callback('密码不能全部相同')
    } else if (confirmValue && confirmValue.length >= 6 && value !== confirmValue) {
      callback('两次填写的密码不一致')
    } else {
      if (confirmValue === value) setTimeout(setFieldsValue({ confirm: confirmValue }), 0)
      callback()
    }
  }
  function checkPasswordConfirm (rule, value, callback) {
    const accountpwd = getFieldValue('accountpwd')
    if (value && value !== accountpwd) {
      callback('两次填写的密码不一致')
    } else {
      setTimeout(setFieldsValue({ accountpwd }), 0)
      callback()
    }
  }

  return (
    <Form layout='horizontal' onSubmit={handleSubmit}>
      <FormItem>
        {getFieldDecorator('orginpwd', {
          initialValue: '',
          rules: [{ required: true, message: '请输入原密码' }]
        })(<Input type='password' maxLength='16' placeholder='请输入您的原密码' />)}
      </FormItem>
      <FormItem>
        {getFieldDecorator('accountpwd', {
          initialValue: '',
          rules: [
            {
              required: true,
              pattern: /^.{6,16}$/,
              message: '密码为6-16位字符'
            },
            {
              validator: checkSameChar
            }
          ]
        })(
          <Input
            onPaste={e => {
              e.preventDefault()
            }}
            type='password'
            maxLength='16'
            placeholder='请输入6-16位新密码'
          />
        )}
      </FormItem>
      <FormItem>
        {getFieldDecorator('confirm', {
          initialValue: '',
          rules: [
            {
              required: true,
              message: '请输入确认密码'
            },
            {
              validator: checkPasswordConfirm
            }
          ]
        })(
          <Input
            onPaste={e => {
              e.preventDefault()
            }}
            type='password'
            maxLength='16'
            placeholder='请输入确认密码'
          />
        )}
      </FormItem>
      <FormItem>
        <Button htmlType='submit' loading={submitBtnLoading}>
          修改密码
        </Button>
      </FormItem>
    </Form>
  )
}
ModifyPwdForm.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
  submitBtnLoading: React.PropTypes.bool,
  form: React.PropTypes.object,
  rememberedPwd: React.PropTypes.shape({
    account: React.PropTypes.string,
    pwd: React.PropTypes.string
  })
}

export default Form.create({})(ModifyPwdForm)
