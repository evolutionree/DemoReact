import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Tooltip, Checkbox } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import { query as queryEntityList } from '../../services/entity';
import { funcitonStr, funcitonStr2 } from './tipStr';

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
        <Tooltip title={tips} placement="right">
          <Icon type="question-circle" style={{ marginLeft: 5 }} />
        </Tooltip>
      </div>
    );
  }
}

class StatisticsFormModal extends Component {
  state = {
    intoListChecked: false,
    intoEntityChecked: false
  }

  handleSubmit = () => {
    const { form, onOk, currentRecords } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      const { allowinto, moreflag, anafuncname_lang, ...rest } = values;
      const params = {
        ...currentRecords[0],
        ...rest,
        anafuncname: anafuncname_lang.cn,
        anafuncname_lang: JSON.stringify(anafuncname_lang),
        allowinto: allowinto ? 1 : 0,
        moreflag: moreflag ? 1 : 0
      };
      onOk(params);
    });
  }

  handleCancel = () => {
    const { form, onCancel } = this.props;
    form.resetFields();
    onCancel();
  }

  onChangeIntoListChecked = e => this.setState({ intoListChecked: e.target.checked });

  onChangeIntoEntityChecked = e => this.setState({ intoEntityChecked: e.target.checked });

  render() {
    const { form, showModals, savePending } = this.props;
    const { intoListChecked, intoEntityChecked } = this.state;

    const isEdit = /edit/.test(showModals);
    const { getFieldDecorator: decorate } = form;

    return (
      <Modal
        title={isEdit ? '编辑数据源' : '新增数据源'}
        visible={/edit|add/.test(showModals)}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={savePending}>
        <Form>
          <FormItem label="统计项名称">
            {decorate('anafuncname_lang', {
              initialValue: '',
              rules: [{ required: true, message: '请输入统计项名称' }]
            })(
              <IntlInput placeholder="请输入统计项名称" />
            )}
          </FormItem>
          <FormItem label="统计函数">
            {decorate('countfunc', {
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
            {decorate('moreflag', {
              initialValue: '',
              rules: [{ required: true, message: '是否可进入列表' }]
            })(
              <Checkbox
                checked={intoListChecked}
                onChange={this.onChangeIntoListChecked}
              >
                可进入列表
            </Checkbox>
            )}
          </FormItem>
          {
            intoListChecked ? (
              <div>
                <FormItem label="列表函数">
                  {decorate('morefunc', {
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
                  {decorate('allowinto', {
                    initialValue: '',
                    rules: [{ required: true, message: '是否可进入列表' }]
                  })(
                    <Checkbox
                      checked={intoEntityChecked}
                      onChange={this.onChangeIntoEntityChecked}
                    >
                      可跳入实体
                    </Checkbox>
                  )}
                </FormItem>
                {
                  intoEntityChecked && <FormItem label="关联实体">
                    {decorate('entityid', {
                      initialValue: '',
                      rules: [{ required: true, message: '请选择关联实体' }]
                    })(
                      <EntitySelect />
                    )}
                  </FormItem>
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
  mapPropsToFields: (props) => {
    const { currentRecords, showModals } = props;
    const currentRecord = currentRecords[0];
    if (showModals === '') return {};
    return _.mapValues(currentRecord, val => ({ value: val }));
  }
})(StatisticsFormModal);
