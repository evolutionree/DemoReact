import React, { PropTypes, Component } from 'react';
import { Modal, Form } from 'antd';
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
        form.resetFields();
        form.setFields(_.mapValues({
          ...editingRecord,
          ...editingRecord.fieldConfig,
          fieldConfig: undefined
        }, val => ({ value: val })), 1000);
      } else {
        form.resetFields();
        form.setFields({
          fieldName: { value: getRandomLetters(6) }
        });
      }
    }
  }

  handleOk = () => {
    const { form, editingRecord, showModals } = this.props;
    const isEdit = /edit/.test(showModals);
    form.validateFields((err, values) => {
      if (err) return;
      const newVal = processFormValues(values, editingRecord, isEdit);
      this.props.onOk(newVal, () => {});
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
