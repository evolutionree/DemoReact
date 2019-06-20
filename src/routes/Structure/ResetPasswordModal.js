import React from 'react'
import _ from 'lodash'
import { Form, Input, Modal } from 'antd'
import { connect } from 'dva'
import styles from './ResetPasswordModal.less'

const FormItem = Form.Item

function ResetPasswordModal ({
  form: { getFieldDecorator, validateFields, getFieldValue, resetFields, setFieldsValue },
  showModals,
  currentItems,
  revertPassword,
  cancel
}) {
  function handleOk () {
    validateFields((err, values) => {
      if (err) return
      Modal.confirm({
        title: '确认重置用户密码？',
        onOk () {
          revertPassword(_.pick(values, ['accountpwd']))
        }
      })
    })
  }
  function handelCancel () {
    cancel()
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
    <Modal
      title='修改密码'
      visible={/resetPassword/.test(showModals)}
      onOk={handleOk}
      onCancel={handelCancel}
      afterClose={resetFields}
    >
      <div className={styles.title}>选中人员（共{currentItems.length}人）</div>
      <div className={styles.well}>{currentItems.map(u => u.username).join('、')}</div>
      <Form>
        <FormItem label='新密码'>
          {getFieldDecorator('accountpwd', {
            initialValue: '',
            normalize: value => (value ? value.trim() : value),
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
        <FormItem label='确认密码'>
          {getFieldDecorator('confirm', {
            initialValue: '',
            normalize: value => (value ? value.trim() : value),
            trigger: 'onChange',
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
      </Form>
    </Modal>
  )
}

function mapDispatchToProps (dispatch) {
  return {
    revertPassword: data => {
      dispatch({ type: 'structure/revertPassword', payload: data })
    },
    cancel: () => {
      dispatch({ type: 'structure/showModals', payload: '' })
    }
  }
}
export default connect(
  state => state.structure,
  mapDispatchToProps
)(Form.create({})(ResetPasswordModal))
