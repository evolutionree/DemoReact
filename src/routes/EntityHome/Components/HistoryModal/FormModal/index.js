import React, { PureComponent } from 'react';
import { Modal, Form, Input, message, Spin, Row, Col } from 'antd';
// import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
// import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import { dynamicRequest } from '../../../../services/common';

const _ = require('lodash');

const TextArea = Input.TextArea;
const FormItem = Form.Item;

class FormModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: props.list || {}
    };
  }

  componentDidMount() {

  }

  handleSubmit = () => {
    const { form, onOk, api, spacename, dispatch, visible, selectedRows, fetch } = this.props;
    const isEdit = /^edit$/.test(visible);

    form.validateFields((err, values) => {
      if (err) return;
      if (onOk) onOk(values);
      if (api || fetch) {
        const url = api || (isEdit ? fetch.edit : fetch.add);
        const reportrelationid = isEdit ? selectedRows[0].reportrelationid : null;
        const params = { ...values, reportrelationid };

        dynamicRequest(url, params)
          .then(res => {
            if (res) {
              const { error_msg } = res;
              this.handleCancel();
              if (dispatch) dispatch({ type: `${spacename}/QueryList` });
              message.success(error_msg || '操作成功');
            }
          }).catch(e => message.error(e.message));
      }
    });
  }

  handleCancel = () => {
    const { form, cancel } = this.props;
    form.resetFields();
    if (cancel) cancel();
  }

  formNode = (record) => {
    return {
      Input: <Input placeholder={record.placeholder || `请输入${record.label}`} />,
      TextArea: <TextArea placeholder={record.placeholder || `请输入${record.label}`} />
    };
  }

  render() {
    const { form, visible, title, confirmLoading, fetchDataLoading, justify = 'space-between' } = this.props;
    const { list } = this.state;
    const { getFieldDecorator } = form;
    const isEdit = /^edit$/.test(visible);

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
            <Row type="flex" justify={justify}>
              {
                list.length ? (
                  list.map((item, index) => (
                    this.formNode(item)[item.type] &&
                    <Col key={index} span={item.span || 24}>
                      <FormItem label={item.label} formItemLayout={item.formItemLayout}>
                        {getFieldDecorator(item.fieldname, {
                          initialValue: item.initialValue || '',
                          rules: item.rules || [{ required: item.required || true, message: item.message || `缺少${item.label}` }]
                        })(this.formNode(item)[item.type])}
                      </FormItem>
                    </Col>
                  ))
                ) : null
              }
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default Form.create({
  onValuesChange: (props, values) => {
    const { onChange, selectedRows, visible } = props;
    const isEdit = /^edit$/.test(visible);

    if (isEdit) {
      onChange([{
        ...(selectedRows && selectedRows.length === 1 ? selectedRows[0] : {}),
        ...values
      }]);
    }
  },
  mapPropsToFields: (props) => {
    const { selectedRows, visible } = props;
    const currentRecord = selectedRows ? selectedRows[0] : {};
    if (visible === '') return {};
    return _.mapValues(currentRecord, val => ({ value: val }));
  }
})(FormModal);
