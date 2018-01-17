import React from 'react';
import { Modal, Form } from 'antd';
import _ from 'lodash';
import FieldForm from './FieldForm';
import { getRandomLetters } from '../../../../utils';

function genExtraFieldConfig(controlType) {
  return {
    // style: 0,
    regExp: getRegExp(controlType)
  };
}
function getRegExp(controlType) {
  switch (controlType) {
    case 10: // 手机号
      return '[0-9]+';
    case 11: // 邮箱
      return '\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*';
    case 12: // 电话
      return '';
    default:
      return '';
  }
}
function processFormValues(values, editingRecord) {
  /* eslint-disable */
  let {
    fieldId,
    controlType,
    fieldLabel,
    displayName,
    recStatus,
    fieldName,
    ...fieldConfig
  } = values;
  /* eslint-enable */

  controlType = parseInt(controlType, 10);
  displayName = displayName || fieldLabel;

  const extraFieldConfig = genExtraFieldConfig(controlType);
  const fieldConfigJSON = JSON.stringify({
    ...fieldConfig,
    ...extraFieldConfig
  });

  const retValues = {
    controlType,
    fieldLabel,
    displayName,
    recStatus,
    fieldName,
    fieldConfig: fieldConfigJSON,
    fieldType: (editingRecord && editingRecord.fieldType !== undefined) ? editingRecord.fieldType : 2,
    fieldId: editingRecord ? editingRecord.fieldId : undefined
  };

  return retValues;
}

function FieldFormModal({ form, showModals, editingRecord, onOk, onCancel, modalPending, entityFields, entityId }) {
  function handleOk() {
    form.validateFields((err, values) => {
      if (err) return;
      const newVal = processFormValues(values, editingRecord, isEdit);
      onOk(newVal, form.resetFields.bind(form));
    });
  }
  function handleCancel() {
    form.resetFields();
    onCancel();
  }

  const isEdit = /edit/.test(showModals);
  const title = isEdit ? '编辑字段' : '新增字段';
  return (
    <Modal title={title}
           visible={/edit|add/.test(showModals)}
           onOk={handleOk}
           confirmLoading={modalPending}
           onCancel={handleCancel}>
      <FieldForm form={form} isEdit={isEdit} entityFields={entityFields} entityId={entityId} />
    </Modal>
  );
}
FieldFormModal.propTypes = {
  showModals: React.PropTypes.string,
  editingRecord: React.PropTypes.object,
  onOk: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  modalPending: React.PropTypes.bool,
  entityFields: React.PropTypes.array.isRequired
};

export default Form.create({
  // 没做双向绑定，改变表单值将不会触发此函数，
  // 只做初始化用，return的值会更新到form对象下
  mapPropsToFields: ({ showModals, editingRecord: record }) => {
    if (!/edit/.test(showModals)) {
      return {
        fieldName: { value: getRandomLetters(6) }
      };
    }

    const ret = {};
    const fieldConfig = record.fieldConfig;
    Object.keys(record).forEach(key => {
      ret[key] = { value: record[key] };
    });
    // 将fieldConfig的属性挂到fields下，避免嵌套
    if (fieldConfig) {
      Object.keys(fieldConfig).forEach(key => {
        ret[key] = { value: fieldConfig[key] };
      });
    }
    delete ret.fieldConfig;
    return ret;
  }
})(FieldFormModal);
