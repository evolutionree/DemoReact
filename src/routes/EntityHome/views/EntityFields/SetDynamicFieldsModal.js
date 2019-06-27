import React from 'react'
import { connect } from 'dva'
import { Modal, Form, Select, message } from 'antd'
import _ from 'lodash'
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText'
import {
  queryDynamicConfig,
  saveDynamicConfig,
  queryTypes
} from '../../../../services/entity'

const FormItem = Form.Item
const Option = Select.Option

function isDataSourceField (field) {
  const dataSourceControlType = 18
  return field.controltype === dataSourceControlType
}

class SetDynamicFieldsModal extends React.Component {
  static propTypes = {}
  static defaultProps = {}

  constructor (props) {
    super(props)
    this.state = {
      rawData: null,
      loading: false,
      entityTypeId: ''
    }
    this.fetchEntityType()
  }

  componentWillReceiveProps (nextProps) {
    // 打开窗口时，查数据
    const isOpening =
      !/SetDynamicFieldsModal$/.test(this.props.visible) &&
      /SetDynamicFieldsModal$/.test(nextProps.visible)
    if (isOpening) {
      this.setState({ rawData: null })
      const params = {
        typeid: this.state.entityTypeId,
        entityid: this.props.entityId
      }
      queryDynamicConfig(params)
        .then(result => {
          let fieldids
          if (!result.data.length) {
            fieldids = ['', '', '', '', '']
          } else {
            fieldids = result.data.map(item => {
              if (!item || !item.fieldid) return ''
              return item.fieldid
            })
          }
          this.props.form.setFieldsValue({ fieldids })
        })
        .catch(e => {
          message.error(e.message || '获取数据出错')
        })
    }
  }

  fetchEntityType = () => {
    queryTypes({ entityId: this.props.entityId }).then(result => {
      if (result) {
        const { data } = result
        const entityTypeId =
          data &&
          Array.isArray(data.entitytypepros) &&
          data.entitytypepros.length
            ? data.entitytypepros[0].categoryid
            : ''
        if (entityTypeId) this.setState({ entityTypeId })
      }
    })
  }

  handleOk = () => {
    const fields = this.props.list

    this.props.form.validateFields((err, values) => {
      if (err) return
      const fieldids = values.fieldids.map(id => id || null)
      const params = {
        typeid: this.state.entityTypeId,
        entityid: this.props.entityId,
        fieldids
      }
      this.setState({ loading: true })
      saveDynamicConfig(params)
        .then(result => {
          message.success('保存成功')
          this.setState({ loading: false })
          this.props.onCancel()
        })
        .catch(e => {
          message.error(e.message || '提交数据出错')
          this.setState({ loading: false })
        })
    })
  }

  renderFieldSelect = () => {
    // const supportTypes = [1, 5, 13, 14, 22];
    // const fields = this.props.list.filter(item => _.includes(supportTypes, item.controltype));
    const fields = this.props.list
    return (
      <Select>
        <Option value=''>不显示</Option>
        {fields.map(field => (
          <Option
            key={field.fieldid}
            value={field.fieldid}
            disabled={field.recstatus !== 1}
          >
            {getIntlText('displayname', field)}
          </Option>
        ))}
      </Select>
    )
  }

  render () {
    const { visible, list, form, onCancel } = this.props
    const { getFieldDecorator } = form
    return (
      <Modal
        title='动态摘要配置'
        visible={/SetDynamicFieldsModal$/.test(visible)}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={this.state.loading}
      >
        <Form>
          <FormItem label='显示字段一'>
            {getFieldDecorator('fieldids[0]', {})(this.renderFieldSelect())}
          </FormItem>
          <FormItem label='显示字段二'>
            {getFieldDecorator('fieldids[1]', {})(this.renderFieldSelect())}
          </FormItem>
          <FormItem label='显示字段三'>
            {getFieldDecorator('fieldids[2]', {})(this.renderFieldSelect())}
          </FormItem>
          <FormItem label='显示字段四'>
            {getFieldDecorator('fieldids[3]', {})(this.renderFieldSelect())}
          </FormItem>
          <FormItem label='显示字段五'>
            {getFieldDecorator('fieldids[4]', {})(this.renderFieldSelect())}
          </FormItem>
        </Form>
        {/* <p style={{ color: '#999999' }}>注：支持显示文本，地址，图片类字段</p> */}
      </Modal>
    )
  }
}

export default connect(state => state.entityFields)(
  Form.create({})(SetDynamicFieldsModal)
)
