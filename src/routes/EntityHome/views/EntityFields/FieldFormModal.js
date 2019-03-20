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
    fieldlabel_lang,
    displayname_lang,
    recStatus,
    fieldName,
    ...fieldConfig
  } = values;
  /* eslint-enable */

  controlType = parseInt(controlType, 10);
  displayname_lang = displayname_lang || {};
  //TODO: 显示名称无值得时候  用字段名称的值 覆盖
  let langlist = JSON.parse(window.localStorage.getItem('langlist')) || [];
  for (let i = 0; i < langlist.length; i++) {
    if (displayname_lang[langlist[i].key] === undefined) {
      displayname_lang[langlist[i].key] = fieldlabel_lang[langlist[i].key];
    }
  }

  const extraFieldConfig = genExtraFieldConfig(controlType);
  const fieldConfigJSON = JSON.stringify({
    ...fieldConfig,
    ...extraFieldConfig
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
    showModals: PropTypes.string,
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
    const thisVisible = /edit|add/.test(this.props.showModals);
    const nextVisible = /edit|add/.test(nextProps.showModals);
    const isOpening = !thisVisible && nextVisible;
    const isClosing = thisVisible && !nextVisible;
    if (isOpening) {
      const { form, showModals, editingRecord } = nextProps;

      if (/edit/.test(showModals)) {
        const fieldConfig = editingRecord.fieldConfig || {};
        let newFieldConfig = {};
        for (let key in fieldConfig) {
          let newKey = key;
          if (key === 'dataSource') {
            newKey = 'dataSource_' + editingRecord.controlType;
          }
          newFieldConfig[newKey] = fieldConfig[key];
        }

        form.resetFields();
        form.setFields(_.mapValues({
          ...editingRecord,
          ...newFieldConfig,
          fieldConfig: undefined
        }, val => ({ value: val })), 1000);
      } else {
        form.resetFields();
        // form.setFields({
        //   fieldName: { value: getRandomLetters(6) }
        // });
      }
    }
  }

  handleOk = () => {
    const { form, editingRecord, showModals } = this.props;
    const isEdit = /edit/.test(showModals);
    form.validateFields((err, values) => {
      if (err) return;
      const { encrypted, scanner } = values;
      if (encrypted && scanner) {
        message.error('加密文本不支持扫描功能，请检查');
        return;
      }
      const newValues = {};
      for (const key in values) { //把dataSource_开头的的key值 替换成【dataSource】(表单中有部分字段是动态切换的 出现了字段名一样的数据 所有加_以区分 不然ant design会报错，说校验规则变为undefined 具体原因不详)
        let newKey = key;
        if (/^dataSource_/.test(key)) newKey = 'dataSource';
        newValues[newKey] = values[key];
        if (/^displayname_lang$/.test(newKey)) {
          newValues.fieldlabel_lang = newValues[newKey]; // 传参时需要有 fieldlabel_lang 字段
        }
      }
      const newVal = processFormValues(newValues, editingRecord, isEdit);
      this.props.onOk(newVal, () => { });
    });
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  render() {
    const { form, showModals, modalPending, entityFields, entityId } = this.props;
    const isEdit = /edit/.test(showModals);
    const title = isEdit ? '编辑字段' : '新增字段';

    return (
      <Modal
        title={title}
        visible={/edit|add/.test(showModals)}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        onCancel={this.handleCancel}
      >
        <FieldForm form={form} isEdit={isEdit} entityFields={entityFields} entityId={entityId} />
      </Modal>
    );
  }
}

export default Form.create()(FieldFormModal);
