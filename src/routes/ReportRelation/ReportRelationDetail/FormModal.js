import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Tooltip, Checkbox } from 'antd';
import IntlInput from '../../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../../components/UKComponent/Form/IntlText';
import { query as queryEntityList } from '../../../services/entity';

const _ = require('lodash');

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;


class EntitySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entityList: []
    };
    this.fetchEntityList();
  }

  fetchEntityList = () => {
    const params = {
      entityname: '',
      typeid: -1,
      pageindex: 1,
      pagesize: 9999,
      status: 1
    };
    queryEntityList(params).then(result => {
      this.setState({
        entityList: result.data.pagedata
      });
    }, err => {
      message.error('获取实体失败');
    });
  };

  render() {
    const { value, onChange, ...rest } = this.props;
    return (
      <Select value={value} onChange={onChange} {...rest}>
        {this.state.entityList.map(entity => (
          <Option key={entity.entityid}>{getIntlText('entityname', entity)}</Option>
        ))}
      </Select>
    );
  }
}

class TipsInput extends Component {
  render() {
    const { value, onChange, placeholder, tips = '缺少tips属性' } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input placeholder={placeholder} value={value} onChange={onChange} />
        <Tooltip title={tips} placement="right">
          <Icon type="question-circle" style={{ marginLeft: 5 }} />
        </Tooltip>
      </div>
    );
  }
}

class SelectCheckbox extends Component {
  render() {
    const { value, onChange, children } = this.props;
    return (
      <Checkbox
        checked={!!value}
        onChange={onChange}
      >
        {children}
      </Checkbox>
    );
  }
}

class FormModal extends Component {

  handleSubmit = () => {
    const { form, onOk } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      onOk(values);
    });
  }

  handleCancel = () => {
    const { form, cancel } = this.props;
    form.resetFields();
    if (cancel) cancel();
  }

  render() {
    const { form, visible, title, savePending } = this.props;
    const { getFieldDecorator } = form;
    const isEdit = /^edit$/.test(visible);

    return (
      <Modal
        title={`${isEdit ? '编辑' : '新增'}${title}`}
        visible={/edit|add/.test(visible)}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={savePending}>
        <Form>
          <FormItem label="汇报关系名称">
            {getFieldDecorator('anafuncname_lang', {
              initialValue: '',
              rules: [{ required: true, message: '请输入汇报关系名称' }]
            })(
              <IntlInput placeholder="请输入汇报关系名称" />
            )}
          </FormItem>
          <FormItem label="描述">
            {getFieldDecorator('remark')(
              <TextArea />
            )}
          </FormItem>
        </Form>
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
