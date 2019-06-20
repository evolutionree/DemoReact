import React, { PureComponent } from 'react';
import { Modal, Form, Input, message, Spin, Row, Col } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import styles from './index.less';

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

  handleSubmit = () => {
    const { form, onOk, api, spacename, dispatch, visible, selectedRows, fetch } = this.props;
    const isEdit = /^edit$/.test(visible);

    form.validateFields((err, values) => {
      if (err) return;
      if (onOk) onOk(values);
      if (api || fetch) {
        const url = api || (isEdit ? fetch.edit : fetch.add);
        const id = selectedRows[0].id || null;
        const params = { commitremark: values.commitremark, id };

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

  beforeNode = () => {
    const { selectedRows } = this.props;
    const record = Array.isArray(selectedRows) && selectedRows.length ? selectedRows[0] : {};

    return (
      <div className={styles.before}>
        <span>变更人：{record.username || '(空)'}</span>
        <span>变更时间：{record.commitdate || '(空)'}</span>
        <span>备注人：{record.commitusername || '(空)'}</span>
        <span>备注时间：{record.commitremarkdate || '(空)'}</span>
      </div>
    );
  }

  formNode = (record) => {
    return {
      TextArea1: <TextArea autosize={record.autosize || false} placeholder={record.placeholder || `请输入${record.label}`} />,
      TextArea2: <TextArea disabled autosize={record.autosize || false} placeholder={record.placeholder || ''} />
    };
  }

  render() {
    const { width = 550, mode = 'double', form, visible, title, confirmLoading, fetchDataLoading, justify = 'space-between' } = this.props;
    const { list } = this.state;
    const { getFieldDecorator } = form;
    const isEdit = /^edit$/.test(visible);
    const isNormal = (mode === 'normal');
    const double = (mode === 'double');

    const resultTitle = () => {
      if (isNormal) return title;
      if (double) return `${isEdit ? '编辑' : '新增'}${title}`;
    };
    
    return (
      <Modal
        title={resultTitle()}
        width={width}
        visible={!!(isNormal ? visible : /edit|add/.test(visible))}
        okText="保存"
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
      >
        <Spin spinning={fetchDataLoading}>
          {this.beforeNode()}
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
                          rules: item.rules || [{ required: item.required || false, message: item.message || `缺少${item.label}` }]
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
    const { mode, onChange, selectedRows, visible } = props;
    const isEdit = /^edit$/.test(visible);
    const isNormal = (mode === 'normal');

    if (isEdit || isNormal) {
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
