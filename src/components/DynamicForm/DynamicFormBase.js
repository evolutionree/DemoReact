import React, { PropTypes, Component } from 'react';
import { Form, Row, Col } from 'antd';
import classnames from 'classnames';
import FoldableGroup from './FoldableGroup';
import DynamicField from './DynamicField';
import { getEntcommDetail } from '../../services/entcomm';

const FormItem = Form.Item;
const onlylineField = [2, 5, 15, 22, 23, 24];

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
    entityId: PropTypes.string,
    entityTypeId: PropTypes.string,
    fields: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onFieldControlFocus: PropTypes.func,
    horizontal: PropTypes.bool,
    form: PropTypes.object,
    jsEngine: PropTypes.object,
    cols: PropTypes.number //单个表单项所占栅格宽 没有传 则默认走系统计算（超1400宽的客户端三列， 否则两列展示）
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
      fieldsDecorator: this.generateFieldsDecorators(props.fields),
      RelObjectConfig: this.getRelObjectConfig(props.fields) //引用对象集合
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fields !== nextProps.fields) {
      this.setState({
        fieldsDecorator: this.generateFieldsDecorators(nextProps.fields),
        RelObjectConfig: this.getRelObjectConfig(nextProps.fields)
      });
    }
  }

  componentDidMount() { //表格批量新增的时候  需要执行配置JS  base2文件才有效 只是为了统一文件内容
    const { batchAddInfo } = this.props;
    const batchAddField = batchAddInfo && batchAddInfo.field;
    if (batchAddInfo && batchAddInfo.type === 'add') {
      this.onFieldValueChange(batchAddField && batchAddField.fieldname, batchAddField && batchAddField.fieldid);
    }
  }

  getRelObjectConfig = (fields) => {
    let RelObjectConfig = [];
    this.processFields(fields).map(item => {
      if (item.controltype === 31) {  //引用对象 的相关配置先存起来 对相关项进行监听
        RelObjectConfig.push(item);
      }
    });
    return RelObjectConfig;
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
    const { maxLength, regExp, isRequiredJS } = fieldConfig;
    if (regExp) {
      rules.push({
        pattern: new RegExp(regExp),
        message: '请检查格式'
      });
    }
    if (maxLength) {
      rules.push({
        validator(rule, value, callback) {
          if (value && (value + '').length > maxLength) {
            return callback('最大长度为' + maxLength);
          }
          callback();
        }
      });
    }
    if ((field.isrequire || isRequiredJS) && field.controltype !== 31) { //31:引用对象 永远不做必填校验
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
      ? { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
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
    const { jsEngine } = this.props;
    if (jsEngine) {
      jsEngine.handleFieldControlFocus(fieldName);
    }
  };

  onFieldValueChange = (fieldName, fieldid, newValue, isFromApi) => {
    if (isFromApi) return;
    const relObject = this.state.RelObjectConfig;
    relObject.map(item => {
      const fieldconfig = item.fieldconfig;
      if (fieldconfig.controlField === fieldid) {
        if (newValue instanceof Array) {
          console.info('引用对象不允许数据源多选的情况下setValue()');
        } else {
          const dataSourceData = typeof newValue === 'string' ? JSON.parse(newValue) : newValue;
          if (dataSourceData) { //可能用户在做清除操作
            this.fetchEntcommDetail(fieldconfig.originEntity, dataSourceData.id, fieldconfig.originFieldname, item.fieldname); //数据源关联的实体id  记录recid  记录详情下要取得字段id
          } else {
            this.getFieldControlInstance(item.fieldname).setTitle('');
          }
        }
      }
    })
    const { jsEngine } = this.props;
    if (jsEngine) {
      setTimeout(() => {
        jsEngine.handleFieldValueChange(fieldName);
      }, 0);
    }
  };

  fetchEntcommDetail = (entityId, recId, originFieldname, fieldname) => {
    getEntcommDetail({
      entityId,
      recId,
      needPower: 0
    }).then(result => {
      const detailData = result.data.detail;
      const value_name = detailData[originFieldname + '_name'] || detailData[originFieldname];
      this.getFieldControlInstance(fieldname).setTitle(value_name);
    }, err => {
      console.error(err.message);
    });
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
      if ((field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) { //(field.controltype === 31) ||
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

    let colNum = 24;
    if (onlylineField.indexOf(field.controltype) > -1 || (field.controltype === 25 && field.fieldconfig.multiple === 1)) {
      colNum = 24;
    } else if (this.props.cols) {
      colNum = this.props.cols;
    } else {
      colNum = document.body.clientWidth > 1400 ? 8 : 12;
    }

    const fieldControl = this.renderFieldControl(field);
    return (
      <Col span={colNum}
           key={field.fieldname}
           style={{ padding: colNum === 24 ? '0px 10px 0 100px' : '0 10px' }}>
        {this.renderFieldControlWrapper(field, colNum)(fieldControl)}
      </Col>
    );
  };

  renderFieldControlWrapper = (field, colNum) => {
    const WrapFormItem = field.controltype === 24 ? CustomFormItem : FormItem; // 表格控件特殊处理
    const fieldConfig = field.fieldconfig || {};
    const cls = classnames([
      'dynamic-form-field',
      'dynamic-form-field-' + field.controltype
    ]);

    const layout = colNum === 24 ? {} : this.getFormItemLayout(field.fieldname); //表格字段 永远不考虑横向显示
    return children => (
      <WrapFormItem
        key={field.fieldname}
        label={field.displayname}
        colon={false}
        required={field.isrequire || fieldConfig.isRequiredJS}
        className={cls}
        {...layout}
      >
        {children}
      </WrapFormItem>
    );
  };

  renderFieldControl = field => {
    const { entityTypeId, entityId, value } = this.props;
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
        onChange={this.onFieldValueChange.bind(this, fieldname, fieldid)}
        entityId={entityId}
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
        jsEngine={this.props.jsEngine}
      />
    );
  };

  render() {
    const fieldsGroup = this.getFieldsGroup();
    return (
      <Form layout={this.getFormLayout()}>
        <Row gutter={24}>
          {this.renderFields(fieldsGroup[0].fields)}
          {fieldsGroup.slice(1).map(group => (
            <FoldableGroup key={group.title} title={group.title} foldable={group.foldable}>
              {this.renderFields(group.fields)}
            </FoldableGroup>
          ))}
        </Row>
      </Form>
    );
  }
}

export default DynamicFormBase;
