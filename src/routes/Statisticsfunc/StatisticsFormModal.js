import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Tooltip, Checkbox } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import { query as queryEntityList } from '../../services/entity';
import { funcitonStr, funcitonStr2 } from './tipStr';
import styles from './index.less';

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

class TipsInput extends Component {
  render() {
    const { value, onChange, placeholder, tips = '缺少tips属性' } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input placeholder={placeholder} value={value} onChange={onChange} />
        <Tooltip title={tips} placement="right" overlayClassName={styles.tooltip}>
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

class StatisticsFormModal extends Component {

  handleSubmit = () => {
    const { form, onOk, dispatch, spaceName, showModals } = this.props;
    const isEdit = /edit/.test(showModals);

    form.validateFields((err, values) => {
      if (err) return;
      new Promise((resolve) => {
        dispatch({ type: `${spaceName}/save`, payload: { values, resolve, isEdit } });
      }).then(res => {
        if (res) {
          this.handleCancel();
          message.success(res.error_msg || '操作成功');
        }
      }).catch(e => message.error(e.message || '操作失败'));

      if (onOk) onOk(values);
    });
  }

  handleCancel = () => {
    const { form, onCancel, showModals } = this.props;
    const isEdit = /edit/.test(showModals);
    form.resetFields();
    onCancel(isEdit);
  }

  render() {
    const { form, showModals, savePending } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;
    const isEdit = /edit/.test(showModals);
    const { allowinto, moreflag } = getFieldsValue(['moreflag', 'allowinto']);

    return (
      <Modal
        title={isEdit ? '编辑数据源' : '新增数据源'}
        visible={/edit|add/.test(showModals)}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={savePending}>
        <Form>
          <FormItem label="统计项名称">
            {getFieldDecorator('anafuncname_lang', {
              initialValue: '',
              rules: [{ required: true, message: '请输入统计项名称' }]
            })(
              <IntlInput placeholder="请输入统计项名称" />
            )}
          </FormItem>
          <FormItem label="统计函数">
            {getFieldDecorator('countfunc', {
              initialValue: '',
              rules: [{ required: true, message: '请填写统计函数' }]
            })(
              <TipsInput
                placeholder="请填写统计函数"
                tips={funcitonStr}
              />
            )}
          </FormItem>
          <FormItem label="">
            {getFieldDecorator('allowinto')(
              <SelectCheckbox
                onChange={this.onChangeIntoListChecked}
              >
                可进入列表
              </SelectCheckbox>
            )}
          </FormItem>
          {
            allowinto ? (
              <div>
                <FormItem label="列表函数">
                  {getFieldDecorator('morefunc', {
                    initialValue: '',
                    rules: [{ required: true, message: '请填写列表函数' }]
                  })(
                    <TipsInput
                      placeholder="请填写列表函数"
                      tips={funcitonStr2}
                    />
                  )}
                </FormItem>
                <FormItem label="">
                  {getFieldDecorator('moreflag')(
                    <SelectCheckbox>
                      可跳入实体
                    </SelectCheckbox>
                  )}
                </FormItem>
                {
                  moreflag ? <FormItem label="关联实体">
                    {getFieldDecorator('entityid', {
                      initialValue: '',
                      rules: [{ required: true, message: '请选择关联实体' }]
                    })(
                      <EntitySelect />
                    )}
                  </FormItem> : null
                }
              </div>
            ) : null
          }
        </Form>
      </Modal>
    );
  }
}

export default Form.create({
  onValuesChange: (props, values) => {
    const { onChange, currentRecords } = props;
    onChange([{
      ...currentRecords[0],
      ...values
    }]);
  },
  mapPropsToFields: (props) => {
    const { currentRecords, showModals } = props;
    const currentRecord = currentRecords[0];
    if (showModals === '') return {};
    return _.mapValues(currentRecord, val => ({ value: val }));
  }
})(StatisticsFormModal);
