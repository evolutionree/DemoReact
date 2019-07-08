import React, { Component } from 'react'
import { Modal, Form, message, Spin, Row, Col } from 'antd'
// import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
// import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import { dynamicRequest } from '../../../../services/common'
import UserSelect from '../../../../components/DynamicForm/controls/SelectUser'

const _ = require('lodash')

const FormItem = Form.Item

class FormModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: props.list || {},
      confirmLoading: props.confirmLoading
    }
  }

  componentWillReceiveProps(nextProps) {
    const { confirmLoading: oldLoading } = this.props
    const { confirmLoading: newLoading } = nextProps

    if (oldLoading !== newLoading) {
      this.setState({ confirmLoading: newLoading })
    }
  }

  handleSubmit = () => {
    const { form, onOk, api, spacename, dispatch, visible, selectedRows, fetch, dataSource } = this.props
    const isEdit = /^edit$/.test(visible)

    form.validateFields((err, values) => {
      if (err) return
      const valueArr = values.reportuser.split(',') || ['']
      if (!isEdit && dataSource.some(item => valueArr.includes(item.reportuser))) {
        message.warn('汇报人重复，请检查！')
        return
      }
      if (onOk) {
        onOk(values)
      } else if (api || fetch) {
        const url = api || (isEdit ? fetch.edit : fetch.add)
        const reportrelationId = sessionStorage.getItem('reportrelationid')
        if (!reportrelationId) {
          message.error('缺少 reportrelationid ！')
          return
        }
        const reportrelationid = isEdit ? selectedRows[0].reportrelationid : reportrelationId
        const reportreldetailid = isEdit ? selectedRows[0].reportreldetailid : null
        const params = { ...values, reportrelationid, reportreldetailid }

        this.setState({ confirmLoading: true })

        dynamicRequest(url, params)
          .then(res => {
            if (res) {
              const { error_msg } = res
              this.handleCancel()
              if (dispatch) dispatch({ type: `${spacename}/QueryList` })
              message.success(error_msg || '操作成功')
              this.setState({ confirmLoading: false })
            }
          })
          .catch(e => {
            this.setState({ confirmLoading: false })
            message.error(e.message)
          })
      }
    })
  }

  handleChange = (field, diffField, value) => {
    const {
      dataSource,
      form: { getFieldValue, setFieldsValue }
    } = this.props
    const diffFieldValue = getFieldValue(diffField)
    const valueArr = value.split(',') || ['']

    if (field === 'reportuser') {
      // 过滤列表已有汇报人逻辑
      // const result = [].filter.call(valueArr, val => !dataSource.map(item => item.reportuser).includes(val)).join(',')
      // setTimeout(() => setFieldsValue({ [field]: result }), 0)
    }

    if (value && diffFieldValue) {
      const currentFieldValueArr = diffFieldValue.split(',') || ['']
      const result = [].filter.call(valueArr, val => !currentFieldValueArr.includes(val)).join(',')
      setTimeout(() => setFieldsValue({ [field]: result }), 0)
    }
  }

  handleCancel = () => {
    const { form, cancel } = this.props
    form.resetFields()
    if (cancel) cancel()
  }

  formNode = record => {
    const { bindArgument: arg } = record
    return {
      UserSelect: <UserSelect onChange={this.handleChange.bind(this, arg[0], arg[1])} multiple={1} />
    }
  }

  render() {
    const { form, visible, title, fetchDataLoading, justify = 'space-between' } = this.props
    const { getFieldDecorator } = form
    const { list, confirmLoading } = this.state

    const isEdit = /^edit$/.test(visible)

    return (
      <Modal
        title={`${isEdit ? '编辑' : '新增'}${title}`}
        visible={/edit|add/.test(visible)}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
      >
        <Spin spinning={fetchDataLoading}>
          <Form>
            <Row type='flex' justify={justify}>
              {list.length
                ? list.map(
                  (item, index) =>
                    this.formNode(item)[item.type] && (
                      <Col key={index} span={item.span || 24}>
                        <FormItem label={item.label} formItemLayout={item.formItemLayout}>
                          {getFieldDecorator(item.fieldname, {
                            initialValue: item.initialValue || '',
                            rules: item.rules || [
                              { required: item.required || true, message: item.message || `缺少${item.label}` }
                            ]
                          })(this.formNode(item)[item.type])}
                        </FormItem>
                      </Col>
                    )
                )
                : null}
            </Row>
          </Form>
        </Spin>
      </Modal>
    )
  }
}

export default Form.create({
  onValuesChange: (props, values) => {
    const { onChange, selectedRows, visible } = props
    const isEdit = /^edit$/.test(visible)

    if (isEdit) {
      onChange([
        {
          ...(selectedRows && selectedRows.length === 1 ? selectedRows[0] : {}),
          ...values
        }
      ])
    }
  },
  mapPropsToFields: props => {
    const { selectedRows, visible } = props
    const currentRecord = selectedRows && selectedRows.length === 1 ? selectedRows[0] : {}
    if (visible === '') return {}
    return _.mapValues(currentRecord, val => ({ value: val }))
  }
})(FormModal)
