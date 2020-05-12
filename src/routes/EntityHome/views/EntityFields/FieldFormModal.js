import React, { PropTypes, Component } from 'react';
import { Modal, Form, message } from 'antd';
import * as _ from 'lodash';
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
    choicemode,
    fieldlabel_lang,
    displayname_lang,
    recStatus,
    fieldName,
    ...fieldConfig
  } = values;
  /* eslint-enable */
  controlType = parseInt(controlType, 10);
  fieldlabel_lang = fieldlabel_lang || {};
  displayname_lang = displayname_lang || {};
  //TODO: 显示名称无值得时候  用字段名称的值 覆盖
  const langlist = JSON.parse(window.localStorage.getItem('langlist')) || [];
  for (let i = 0; i < langlist.length; i++) {
    if (displayname_lang[langlist[i].key] === undefined) {
      displayname_lang[langlist[i].key] = fieldlabel_lang[langlist[i].key];
    }
  }

  const extraFieldConfig = genExtraFieldConfig(controlType);
  const fieldConfigJSON = JSON.stringify({
    ...fieldConfig,
    ...extraFieldConfig,
    choicemode
  });

  const retValues = {
    controlType,
    fieldlabel_lang,
    displayname_lang,
    recStatus,
    fieldName,
    fieldConfig: fieldConfigJSON,
    fieldType: (editingRecord && editingRecord.fieldType !== undefined) ? editingRecord.fieldType : 2,
    fieldId: editingRecord ? editingRecord.fieldId : undefined
  };

  return retValues;
}

class FieldFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    editingRecord: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    modalPending: PropTypes.bool,
    entityFields: PropTypes.array,
    entityId: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const thisVisible = /edit|add/.test(this.props.visible);
    const nextVisible = /edit|add/.test(nextProps.visible);
    const isOpening = !thisVisible && nextVisible;
    const isClosing = thisVisible && !nextVisible;
    if (isOpening) {
      const { form, visible, editingRecord } = nextProps;

      if (/edit/.test(visible)) {
        const fieldConfig = editingRecord.fieldConfig || {};
        const newFieldConfig = {};
        for (const key in fieldConfig) {
          let newKey = key;
          if (key === 'dataSource') {
            newKey = 'dataSource_' + editingRecord.controlType;
          }
          newFieldConfig[newKey] = fieldConfig[key];
        }

        form.setFields(_.mapValues({
          ...editingRecord,
          ...newFieldConfig,
          fieldConfig: undefined
        }, val => ({ value: val })));
      }
    }
  }

  handleOk = () => {
    const { form, editingRecord, visible } = this.props;
    const isEdit = /edit/.test(visible);
    form.validateFields((err, values) => {
      if (err) return;
      const { encrypted, scanner } = values;
      if (encrypted && scanner) {
        message.error('加密文本不支持扫描功能，请检查');
        return;
      }
      const newValues = {};
      const cloneValues = _.cloneDeep(values);
      for (const key in cloneValues) { //把dataSource_开头的的key值 替换成【dataSource】(表单中有部分字段是动态切换的 出现了字段名一样的数据 所有加_以区分 不然ant design会报错，说校验规则变为undefined 具体原因不详)
        let newKey = key;
        if (/^dataSource_/.test(key)) newKey = 'dataSource';
        newValues[newKey] = cloneValues[key];
        if (/^displayname_lang$/.test(newKey) && newValues[newKey]) {
          if (Object.keys(newValues[newKey]).some(item => (newValues[newKey][item] === ''))) {
            newValues[newKey] = { ...newValues.fieldlabel_lang };
          }
          newValues.fieldlabel_lang = { ...newValues[newKey] };
        }
      }

      const newVal = processFormValues(newValues, editingRecord, isEdit);

      this.props.onOk(newVal, this.handleCancel);
    });
  };

  handleCancel = () => {
    const { form: { resetFields }, onCancel } = this.props;
    resetFields();
    onCancel();
  };

  render() {
    const { form, visible, modalPending, entityFields, editingRecord, entityId } = this.props;
    const isEdit = /edit/.test(visible);
    const title = isEdit ? (editingRecord.triggerBtn ? '设置回填映射字段' : '编辑字段') : '新增字段';

    return (
      <Modal
        title={title}
        visible={/edit|add/.test(visible)}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        onCancel={this.handleCancel}
      >
        <FieldForm form={form} isEdit={isEdit} entityFields={entityFields} editingRecord={editingRecord} entityId={entityId} />
      </Modal>
    );
  }
}

export default Form.create({})(FieldFormModal);
