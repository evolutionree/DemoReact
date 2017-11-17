import React, { Component, PropTypes } from 'react';
import { Checkbox, Form } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import DynamicField from '../DynamicField';
import createJSEngineProxy from '../createJSEngineProxy';
import styles from './RelTable.less';
import DynamicFieldView from "../DynamicFieldView";

class RelTableControlWrap extends Form.Item {
  render() {
    return super.render();
  }
}

class _RelTableRow extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(PropTypes.shape({
      fieldname: PropTypes.string.isRequired,
      displayname: PropTypes.string.isRequired,
      controltype: PropTypes.number.isRequired,
      fieldconfig: PropTypes.object.isRequired
    })),
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['ADD', 'EDIT', 'DETAIL']),
    onFieldControlFocus: PropTypes.func,
    selected: PropTypes.bool,
    onSelect: PropTypes.func
  };
  static defaultProps = {
    mode: 'ADD',
    onFieldControlFocus: () => {},
    selected: false
  };
  _validateRules = [];
  constructor(props) {
    super(props);
    this.initValidateRules(props.fields);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fields !== nextProps.fields) {
      this.initValidateRules(nextProps.fields);
    }
  }

  getFieldControlInstance = fieldName => {
    const fieldControl = this[`fieldControlInst${fieldName}`];
    return fieldControl && fieldControl.getControlRef();
  };

  getFieldComponentInstance = (fieldName) => {
    const fieldInstance = this[`fieldControlInst${fieldName}`];
    return (fieldInstance && fieldInstance.getControlRef()) || null;
  };

  initValidateRules = (fields) => {
    fields.forEach(field => {
      const rules = [];
      const fieldConfig = field.fieldconfig;
      const { maxLength, regExp } = fieldConfig;
      if (regExp) {
        rules.push({
          pattern: new RegExp(regExp),
          message: '请检查格式'
        });
      }
      if (maxLength) {
        rules.push({
          validator(rule, value, callback) {
            if (value && value.length > maxLength) {
              return callback('最大长度为' + maxLength);
            }
            callback();
          }
        });
      }
      if (field.isrequire) {
        rules.push({
          validator(rule, value, callback) {
            if (value === undefined || value === '') {
              return callback('请输入' + field.displayname);
            }
            callback();
          }
        });
      }
      if (field.controltype === 24) {
        rules.push({
          validator: (rule, value, callback) => {
            const tableInstance = this.getFieldComponentInstance(field.fieldname);
            tableInstance.validate().then(() => {
              callback();
            }, (err) => {
              callback(err || '表格数据校验不通过');
            });
          }
        });
      }
      if (field.controltype === 10) {
        rules.push({
          validator(rule, value, callback) {
            if (value && !/[0-9]{11}/.test(value)) {
              return callback('请输入11位的手机号码');
            }
            callback();
          }
        });
      }

      this._validateRules[field.fieldname] = rules;
    });
  };

  getValidateRules = field => {
    return this._validateRules[field.fieldname] || [];
  };

  onFieldFocus = fieldName => {
    this.props.onFieldControlFocus(fieldName);
  };

  renderFields = fields => {
    const { mode, value, form } = this.props;

    return fields.map(field => {
      const fieldConfig = field.fieldconfig;
      const validateRules = this.getValidateRules(field);
      const value_name = value[field.fieldname + '_name'];

      if ((field.controltype === 31 && mode === 'ADD')
        || (field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) {
        return null;
      }

      if (mode === 'DETAIL') {
        return (
          <div
            key={field.fieldname}
            className={styles.td}
          >
            <div className={styles.controlWrap}>
              <DynamicFieldView
                isTable
                value={value[field.fieldname]}
                controlType={field.controltype}
                config={field.fieldconfig}
                value_name={value[field.fieldname + '_name']}
              />
            </div>
          </div>
        );
      }

      return (
        <div
          key={field.fieldname}
          className={styles.td}
        >
          <RelTableControlWrap
            className={styles.controlWrap}
            required={field.isrequire}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
          >
            {form.getFieldDecorator(field.fieldname, {
              initialValue: fieldConfig.defaultValue,
              trigger: 'onChange',
              validateTrigger: 'onChange',
              rules: validateRules
            })(
              <DynamicField
                isTable
                mode={mode}
                ref={fieldRef => this[`fieldControlInst${field.fieldname}`] = fieldRef}
                controlType={field.controltype}
                fieldId={field.fieldid}
                config={fieldConfig}
                value_name={value_name}
                fieldLabel={field.displayname}
                onFocus={this.onFieldFocus.bind(this, field.fieldname)}
              />
            )}
          </RelTableControlWrap>
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
        {this.renderFields(fields)}
      </div>
    );
  }
}

const RelTableRow = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(createJSEngineProxy(_RelTableRow));

export default RelTableRow;
