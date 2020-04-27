import React from 'react';
import { Form, Select, Input } from 'antd';
import _ from 'lodash';
import FormItemFactory from './FormItemFactory';
import AjaxSelect from '../../../EntityList/AjaxRelObjSelect';
import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
import { IntlInputRequireValidator } from '../../../../utils/validator';
import { fieldModels } from '../../controlTypes';
import { getRandomLetters } from '../../../../utils';

const FormItem = Form.Item;
const Option = Select.Option;

const controlTypeOptions = fieldModels.filter(o => o.value !== 1012).map(model => {
  return (
    <Option key={model.value} disabled={model.disabled}>{model.name}</Option>
  );
});

function getDynamicFormItems(ctrlType, form, entityFields, editingRecord, entityId, isEdit, onChange) {
  const isCustomer = entityId === 'f9db9d79-e94b-4678-a5cc-aa6e281c1246';
  const models = isCustomer ? fieldModels : fieldModels.filter(o => o.value !== 1012);
  const model = _.find(models, item => {
    return `${item.value}` === ctrlType;
  });
  const requires = (model && model.requires) || [];
  const formItemFactory = new FormItemFactory(form, entityFields, editingRecord, entityId, isEdit, onChange);
  try {
    return requires.map(itemType => formItemFactory.create(itemType, ctrlType));
  } catch (execption) {
    console.error('创建表单失败');
    console.error(execption);
    return '';
  }
}

function FieldForm({ form, isEdit, entityFields, editingRecord, entityId }) {
  const isTriggerBtn = editingRecord && editingRecord.triggerBtn;

  function _resetFields() {
    resetFields();
    // setFieldsValue({ fieldName: getRandomLetters(6) });
  }
  const { getFieldDecorator, getFieldsValue, resetFields } = form;
  const { controlType = '1', relentityid, ifcontrolfield } = getFieldsValue(['controlType', 'relentityid', 'ifcontrolfield']);
  let dynamicFormItems = getDynamicFormItems(controlType, form, entityFields, editingRecord, entityId, isEdit);
  const isSystemControl = (controlType * 1 >= 1000 || controlType * 1 === 30);

  // 控制字段的显示和隐藏 引用对象对象的默认显示不能控制
  if (!ifcontrolfield && Number(controlType) !== 31) {
    dynamicFormItems = dynamicFormItems.filter(v => {
      return v.key !== 'controlField' && v.key !== 'originEntity' && v.key !== 'originFieldname' && v.key !== 'controlMethod';
    });
  }

  return (
    <Form layout="horizontal">
      <FormItem label="选择字段格式" style={isSystemControl || isTriggerBtn ? { display: 'none' } : {}}>
        {getFieldDecorator('controlType', {
          initialValue: '1',
          rules: [{ required: true, message: '请选择字段格式' }]
        })(
          <Select disabled={isEdit} onChange={_resetFields}>
            {controlTypeOptions}
          </Select>
        )}
      </FormItem>
      <FormItem label="显示名称" key="displayName" style={isTriggerBtn ? { display: 'none' } : {}}>
        {getFieldDecorator('displayname_lang', {
          rules: [{ required: true, message: '请输入显示名称' }]
        })(<IntlInput placeholder="显示名称" maxLength="20" />)}
      </FormItem>
      {
        Number(controlType) === 30 ? getFieldDecorator('relentityid', {
          initialValue: ''
        })(<Input type="hidden" />) : null
      }
      {
        Number(controlType) === 30 ? <FormItem label="关联对象显示字段" key="relfieldid" style={isTriggerBtn ? { display: 'none' } : {}}>
          {getFieldDecorator('relfieldid', {
            initialValue: '',
            rules: [{ required: true, message: '关联对象显示字段' }]
          })(
            <AjaxSelect entityId={relentityid} />
          )}
        </FormItem> : null
      }
      <FormItem label="状态" key="recStatus" style={isTriggerBtn ? { display: 'none' } : {}}>
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

      <FormItem label="字段表列名" style={isTriggerBtn ? { display: 'none' } : {}}>
        {getFieldDecorator('fieldName', {
          normalize: (value) => (value ? value.trim() : value),
          rules: [
            { required: true, message: '请输入字段表列名' },
            { pattern: /^[a-zA-Z0-9]+$/, message: '只可输入大小写字母，数字' }
          ]
        })(
          <Input placeholder="字段表列名" disabled={isEdit} maxLength="50" />
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

