import React from 'react';
import { Checkbox, Form } from 'antd';
import classnames from 'classnames';
import DynamicFormBase from '../DynamicFormBase2';
import createJSEngineProxy from '../createJSEngineProxy';
import createFormErrorsStore from '../createFormErrorsStore';
import styles from './RelTable.less';
import DynamicFieldView from '../DynamicFieldView';

class RelTableRow extends DynamicFormBase {
  isTable = true;

  renderFieldControlWrapper = field => {
    // const cls = classnames([
    //   'dynamic-form-field',
    //   'dynamic-form-field-' + field.controltype
    // ]);
    return children => (
      <div
        key={field.fieldname}
        className={styles.td}
      >
        <Form.Item
          className={styles.controlWrap}
          required={field.isrequire}
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
        >
          {children}
        </Form.Item>
      </div>
    );
  };
  renderFieldsView = fields => {
    const { value } = this.props;
    return this.processFields(fields).map(field => {
      const val = value[field.fieldname] && value[field.fieldname].value;
      const value_name = value[field.fieldname + '_name'] && value[field.fieldname + '_name'].value;

      return (
        <div
          key={field.fieldname}
          className={styles.td}
        >
          <div className={styles.controlWrap}>
            <DynamicFieldView
              isTable
              value={val}
              controlType={field.controltype}
              config={field.fieldconfig}
              value_name={value_name}
            />
          </div>
        </div>
      );
    });
  };
  render() {
    const { fields: allFields, selected, onSelect, mode } = this.props;
    const fields = allFields.filter(item => item.controltype !== 20);
    return (
      <div className={styles.tr}>
        {mode !== 'DETAIL' && <div className={classnames([styles.td, styles.selectionCell])}>
          <span>
            <Checkbox checked={selected} onChange={e => onSelect(e.target.checked)} />
          </span>
        </div>}
        {mode === 'DETAIL' ? this.renderFieldsView(fields) : this.renderFields(fields)}
      </div>
    );
  }
}

const withForm = Form.create({
  mapPropsToFields({ value }) {
    return value; // value with errors
  },
  onFieldsChange({ value, onChange }, values) {
    // console.log('RelTableRow fieldschange: oldvalue: ', value, ' changes: ', values);
    onChange({
      ...value,
      ...values
    });
  }
});

export default createFormErrorsStore(
  withForm(
    createJSEngineProxy(RelTableRow)
  )
);
