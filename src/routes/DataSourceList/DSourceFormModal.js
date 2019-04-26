import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Radio } from 'antd';
import SelectNumber from '../../components/SelectNumber';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import { query as queryEntityList } from '../../services/entity';
import { extend } from 'dayjs';

const _ = require('lodash');

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

class DSourceFormModal extends Component {

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const { showModals: oldVisible } = this.props;
    const { currentRecords, resetFields, showModals: newVisible } = nextProps;
    const open = newVisible && !oldVisible;
    if (open) {
      if (newVisible === 'edit') {
        const currentRecord = currentRecords[0];
        const { form: { setFieldsValue } } = this.props;
        setFieldsValue({ ...currentRecord });
      } else {
        resetFields();
      }
    }
  }

  handleSubmit = () => {
    const { form: { validateFields }, onOk, currentRecords } = this.props;
    validateFields((err, values) => {
      if (err) return;
      const currentRecord = currentRecords[0];
      const { datasourcename_lang, ...rest } = values;

      onOk({
        srctype: 0,
        // entityid: '',
        ...currentRecord,
        ...rest,
        datasourcename_lang
      });
    });
  }

  handleCancel = () => {
    const { form: { resetFields }, onCancel } = this.props;
    resetFields();
    onCancel();
  }

  render() {
    const { form, showModals, savePending } = this.props;

    const isEdit = /edit/.test(showModals);
    const { getFieldDecorator: decorate } = form;

    return (
      <Modal title={isEdit ? '编辑数据源' : '新增数据源'}
        visible={/edit|add/.test(showModals)}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={savePending}>
        <Form>
          <FormItem label="数据源名称">
            {decorate('datasourcename_lang', {
              initialValue: '',
              rules: [{ required: true, message: '请输入数据源名称' }]
            })(
              <IntlInput placeholder="请输入数据源名称" />
            )}
          </FormItem>
          <FormItem label="状态">
            {decorate('recstatus', {
              initialValue: 1,
              rules: [{ required: true, message: '请选择状态' }]
            })(
              <SelectNumber>
                <Option value="1">启用</Option>
                <Option value="0">停用</Option>
              </SelectNumber>
            )}
          </FormItem>
          <FormItem label="关联实体">
            {decorate('entityid', {
              initialValue: '',
              rules: [{ required: true, message: '请选择关联实体' }]
            })(
              <EntitySelect />
            )}
          </FormItem>
          <FormItem label="是否接入数据权限控制">
            {decorate('isrelatepower', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择是否接入数据权限控制' }]
            })(
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="脚本类型">
            {decorate('ispro', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择脚本类型' }]
            })(
              <Radio.Group>
                <Radio value={0}>函数</Radio>
                <Radio value={1}>sql语句</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="描述">
            {decorate('srcmark', {
              initialValue: ''
            })(
              <Input type="textarea" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({
  // mapPropsToFields: (props) => {
  //   const { currentRecords, showModals } = props;
  //   const currentRecord = currentRecords[0];
  //   if (showModals === '') return {};
  //   // const tmp = _.pick(currentRecords[0], ['dataSourceName', 'recStatus', 'remark']);
  //   return _.mapValues(currentRecord, val => ({ value: val }));
  // }
})(DSourceFormModal);
