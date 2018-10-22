import React from 'react';
import { Form, Checkbox, Select, Input } from 'antd';
import _ from 'lodash';
import FormItemFactory from './FormItemFactory';
import AjaxSelect from '../../../EntityList/AjaxRelObjSelect';
import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
import { IntlInputRequireValidator } from '../../../../utils/validator';
import { fieldModels } from '../../controlTypes';
import { getRandomLetters } from '../../../../utils';

const FormItem = Form.Item;
const Option = Select.Option;

const controlTypeOptions = fieldModels.map(model => {
  return (
    <Option key={model.value} disabled={model.disabled}>{model.name}</Option>
  );
});

function getDynamicFormItems(ctrlType, form, entityFields, entityId, isEdit) {
  const model = _.find(fieldModels, item => {
    return `${item.value}` === ctrlType;
  });
  const requires = (model && model.requires) || [];
  const formItemFactory = new FormItemFactory(form, entityFields, entityId, isEdit);
  try {
    return requires.map(itemType => formItemFactory.create(itemType, ctrlType));
  } catch (execption) {
    console.error('创建表单失败');
    console.error(execption);
    return '';
  }
}

function FieldForm({ form, isEdit, entityFields, entityId }) {
  function _resetFields() {
    resetFields();
    setFieldsValue({ fieldName: getRandomLetters(6) });
  }
  const { getFieldDecorator, getFieldsValue, resetFields, setFieldsValue } = form;
  const { controlType = '1' } = getFieldsValue(['controlType']);
  const dynamicFormItems = getDynamicFormItems(controlType, form, entityFields, entityId, isEdit);
  const isSystemControl = (controlType * 1 >= 1000 || controlType * 1 === 30);
  const { relentityid } = getFieldsValue(['relentityid']);
  return (
    <Form layout="horizontal">
      <FormItem label="选择字段格式" style={isSystemControl ? { display: 'none' } : {}}>
        {getFieldDecorator('controlType', {
          initialValue: '1',
          rules: [{ required: true, message: '请选择字段格式' }]
        })(
          <Select disabled={isEdit} onChange={_resetFields}>
            {controlTypeOptions}
          </Select>
        )}
      </FormItem>
      <FormItem label="字段名称" key="fieldLabel">
        {getFieldDecorator('fieldlabel_lang', {
          rules: [
            { required: true, message: '关联对象显示字段' },
            { validator: IntlInputRequireValidator }
          ]
        })(<IntlInput placeholder="字段名称" maxLength={20} />)}
      </FormItem>
      <FormItem label="显示名称" key="displayName">
        {getFieldDecorator('displayname_lang', {

        })(<IntlInput placeholder="显示名称" maxLength={20} />)}
      </FormItem>
      {
        controlType * 1 === 30 ? getFieldDecorator('relentityid', {
          initialValue: ''
        })(<Input type="hidden" />) : null
      }
      {
        controlType * 1 === 30 ? <FormItem label="关联对象显示字段" key="relfieldid">
          {getFieldDecorator('relfieldid', {
            initialValue: '',
            rules: [{ required: true, message: '关联对象显示字段' }]
          })(
            <AjaxSelect entityId={relentityid} />
          )}
        </FormItem> : null
      }
      <FormItem label="状态" key="recStatus">
        {getFieldDecorator('recStatus', {
          initialValue: '1',
          rules: [{ required: true, message: '请选择状态' }]
        })(
          <Select disabled={isSystemControl}>
            <Option value="1">启用</Option>
            <Option value="0">禁用</Option>
          </Select>,
        )}
      </FormItem>

      {dynamicFormItems}

      <FormItem label="字段表列名">
        {getFieldDecorator('fieldName', {
          rules: [
            { required: true, message: '请输入字段表列名' },
            { pattern: /^[a-zA-Z0-9]+$/, message: '只可输入大小写字母，数字' }
          ]
        })(
          <Input placeholder="字段表列名" disabled={isEdit} maxLength={50} />
        )}
      </FormItem>
    </Form>
  );
}
FieldForm.propTypes = {
  form: React.PropTypes.object.isRequired,
  isEdit: React.PropTypes.bool.isRequired,
  entityFields: React.PropTypes.array.isRequired
};

export default FieldForm;

