import React, { Component } from 'react';
import { Modal, Form, message, Spin } from 'antd';
// import IntlInput from '../../../components/UKComponent/Form/IntlInput';
// import { getIntlText } from '../../../components/UKComponent/Form/IntlText';
import { dynamicRequest } from '../../../services/common';
import UserSelect from '../../../components/DynamicForm/controls/SelectUser';

const _ = require('lodash');

const FormItem = Form.Item;

class FormModal extends Component {

  handleSubmit = () => {
    const { form, onOk, api, spacename, dispatch, visible, selectedRows, fetch } = this.props;
    const isEdit = /^edit$/.test(visible);

    form.validateFields((err, values) => {
      if (err) return;
      if (onOk) onOk(values);
      if (api || fetch) {
        const url = api || (isEdit ? fetch.edit : fetch.add);
        const reportrelationid = isEdit ? selectedRows[0].reportrelationid : null;
        const reportreldetailid = isEdit ? selectedRows[0].reportreldetailid : null;
        const params = { ...values, reportrelationid, reportreldetailid };

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

  render() {
    const { form, visible, title, confirmLoading, fetchDataLoading } = this.props;
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
            <FormItem label="汇报人">
              {getFieldDecorator('reportuser', {
                rules: [{ required: true, message: '请选择汇报人' }]
              })(
                <UserSelect multiple={1} />
              )}
            </FormItem>
            <FormItem label="汇报上级">
              {getFieldDecorator('reportleader', {
                rules: [{ required: true, message: '请选择汇报上级' }]
              })(
                <UserSelect multiple={1} />
              )}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default Form.create({
  onValuesChange: (props, values) => {
    const { onChange, selectedRows } = props;
    onChange([{
      ...(selectedRows ? selectedRows[0] : {}),
      ...values
    }]);
  },
  mapPropsToFields: (props) => {
    const { selectedRows, visible } = props;
    const currentRecord = selectedRows ? selectedRows[0] : {};
    if (visible === '') return {};
    return _.mapValues(currentRecord, val => ({ value: val }));
  }
})(FormModal);
