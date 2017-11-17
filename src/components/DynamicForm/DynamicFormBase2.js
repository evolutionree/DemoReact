import React, { PropTypes, Component } from 'react';
import { Form } from 'antd';
import classnames from 'classnames';
import FoldableGroup from './FoldableGroup';
import DynamicField from './DynamicField';

const FormItem = Form.Item;

class CustomFormItem extends FormItem {
  renderValidateWrapper(c1, c2, c3) {
    let classes = '';
    const form = this.context.form;
    const props = this.props;
    const validateStatus = (props.validateStatus === undefined && form) ?
      this.getValidateStatus() :
      props.validateStatus;

    if (validateStatus) {
      classes = classnames(
        {
          'has-feedback': props.hasFeedback,
          'has-success': validateStatus === 'success',
          'has-warning': validateStatus === 'warning',
          'custom-has-error': validateStatus === 'error',
          'is-validating': validateStatus === 'validating',
        },
      );
    }
    return (
      <div className={`${this.props.prefixCls}-item-control ${classes}`}>
        {c1}{c2}{c3}
      </div>
    );
  }
  render() {
    return super.render();
  }
}

class DynamicFormBase extends Component {
  static propTypes = {
    entityTypeId: PropTypes.string,
    fields: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onFieldControlFocus: PropTypes.func,
    horizontal: PropTypes.bool,
    form: PropTypes.object,
    jsEngine: PropTypes.object
  };
  static defaultProps = {
    horizontal: false,
    fields: [],
    value: {},
    onFieldControlFocus: () => {}
  };

  usage = 0; // 0新增，1编辑，2高级搜索

  constructor(props) {
    super(props);
    this.state = {
      fieldsDecorator: this.generateFieldsDecorators(props.fields)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fields !== nextProps.fields) {
      this.setState({
        fieldsDecorator: this.generateFieldsDecorators(nextProps.fields)
      });
    }
  }

  generateFieldsDecorators = (fields) => {
    const decorators = {};
    this.processFields(fields).forEach(field => {
      const { fieldname, fieldconfig, controltype } = field;
      const initialValue = fieldconfig && fieldconfig.defaultValue;
      const rules = this.generateValidateRules(field);
      decorators[fieldname] = this.props.form.getFieldDecorator(fieldname, {
        initialValue: this.usage === 2 ? undefined : initialValue, // 高级搜索不设置默认值
        rules,
        trigger: 'onChange',
        validateTrigger: controltype === 24 ? '' : 'onChange'
      });
    });
    return decorators;
  };

  generateValidateRules = (field) => {
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
          const isEmptyArray = Array.isArray(value) && !value.length;
          const isEmptyAddress = field.controltype === 13 && !(value && value.address);
          if (value === undefined || value === '' || value === null || isEmptyArray || isEmptyAddress) {
            return callback('请输入' + field.displayname);
          }
          callback();
        }
      });
    }
    if (field.controltype === 24) {
      rules.push({
        validator: (rule, value, callback) => {
          const tableInstance = this.getFieldControlInstance(field.fieldname);
          tableInstance.validate(err => {
            if (err) return callback('请检查表格字段');
            callback();
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

    return rules;
  };

  getFormLayout = () => {
    if (this.props.horizontal) return 'horizontal';
    const { fields } = this.props;
    let layout = 'vertical';
    if (fields && fields[0]) {
      const { fieldconfig } = fields[0];
      if (fieldconfig && fieldconfig.style === 0) {
        layout = 'horizontal';
      }
    }
    return layout;
  };

  getFormItemLayout = () => {
    return this.getFormLayout() === 'horizontal'
      ? { labelCol: { span: 4 }, wrapperCol: { span: 20 } }
      : null;
  };

  getFieldsGroup = () => {
    const groups = [{
      fields: []
    }];

    let lastGroup = groups[0];

    this.props.fields.forEach(field => {
      if (field.controltype === 20) {
        lastGroup = {
          title: field.displayname,
          foldable: field.fieldconfig.foldable === 1,
          fields: []
        };
        groups.push(lastGroup);
        return;
      }
      lastGroup.fields.push(field);
    });

    return groups;
  };

  getFieldControlInstance = fieldName => {
    const fieldControl = this[`fieldControlInst${fieldName}`];
    return (fieldControl && fieldControl.getControlRef()) || null;
  };

  onFieldControlRef = (fieldname, ref) => {
    this[`fieldControlInst${fieldname}`] = ref;
  };

  onFieldFocus = fieldName => {
    this.props.onFieldControlFocus(fieldName);
  };

  onFieldValueChange = (fieldName, newValue, isFromApi) => {
    if (isFromApi) return;
    const { jsEngine } = this.props;
    if (jsEngine) {
      setTimeout(() => {
        jsEngine.handleFieldValueChange(fieldName);
      }, 0);
    }
  };

  // 用于客户引用
  handleQuote = formData => {
    const { form, setExtraData, setFieldsConfig } = this.props;
    form.setFieldsValue(formData);
    setExtraData('commonid', formData.recid);
    setFieldsConfig(formData);
  };

  processFields = fields => {
    return fields.filter(field => {
      if ((field.controltype === 31) || (field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) {
        return false;
      }
      if (field.fieldconfig.isVisible !== 1) {
        return false;
      } else if (field.fieldconfig.isVisibleJS === 0) {
        return false;
      }
      return true;
    });
  };

  renderFields = fields => {
    return this.processFields(fields).map(this.renderField);
  };

  renderField = field => {
    if (field.controltype === 30) { // 用于主页动态实体，传入当前recid
      return (
        <FormItem key={field.fieldname} style={{ display: 'none' }}>
          {this.props.form.getFieldDecorator(field.fieldname, {
            initialValue: this.props.refRecord
          })(<div>{this.props.refRecord}</div>)}
        </FormItem>
      );
    }

    const fieldControl = this.renderFieldControl(field);
    return this.renderFieldControlWrapper(field)(fieldControl);
  };

  renderFieldControlWrapper = field => {
    const WrapFormItem = field.controltype === 24 ? CustomFormItem : FormItem; // 表格控件特殊处理
    const cls = classnames([
      'dynamic-form-field',
      'dynamic-form-field-' + field.controltype
    ]);
    return children => (
      <WrapFormItem
        key={field.fieldname}
        label={field.displayname}
        colon={false}
        required={field.isrequire}
        className={cls}
        {...this.getFormItemLayout(field.fieldname)}
      >
        {children}
      </WrapFormItem>
    );
  };

  renderFieldControl = field => {
    const { entityTypeId, value } = this.props;
    let { fieldconfig, fieldid, fieldname, displayname, controltype } = field;
    const value_name = value[fieldname + '_name'] && value[fieldname + '_name'].value;
    if (fieldconfig && fieldconfig.isReadOnly !== 1 && (fieldconfig.isReadOnlyJS === 0 || fieldconfig.isReadOnlyJS === 1)) {
      fieldconfig = {
        ...fieldconfig,
        isReadOnly: fieldconfig.isReadOnlyJS
      };
    }

    const fieldDecorator = this.state.fieldsDecorator[fieldname];
    return fieldDecorator(
      <DynamicField
        isCommonForm
        onChange={this.onFieldValueChange.bind(this, fieldname)}
        entityTypeId={entityTypeId}
        usage={this.usage}
        isTable={this.isTable}
        ref={this.onFieldControlRef.bind(this, fieldname)}
        controlType={controltype}
        fieldId={fieldid}
        config={fieldconfig}
        value_name={value_name}
        fieldLabel={displayname}
        onFocus={this.onFieldFocus.bind(this, fieldname)}
        quoteHandler={this.handleQuote.bind(this)}
      />
    );
  };

  render() {
    const fieldsGroup = this.getFieldsGroup();
    return (
      <Form layout={this.getFormLayout()}>
        {this.renderFields(fieldsGroup[0].fields)}
        {fieldsGroup.slice(1).map(group => (
          <FoldableGroup key={group.title} title={group.title} foldable={group.foldable}>
            {this.renderFields(group.fields)}
          </FoldableGroup>
        ))}
      </Form>
    );
  }
}

export default DynamicFormBase;
