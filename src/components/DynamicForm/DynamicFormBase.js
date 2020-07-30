import React, { PropTypes, Component } from 'react';
import { Form, Row, Col } from 'antd';
import classnames from 'classnames';
import { is } from 'immutable';
import FoldableGroup from './FoldableGroup';
import DynamicField from './DynamicField';
import { getIntlText } from '../UKComponent/Form/IntlText';
import { getEntcommDetail } from '../../services/entcomm';

const FormItem = Form.Item;
const onlylineField = [2, 5, 15, 22, 23, 24];

export function getSlinceFileds(fieldsArr) { // fieldsArr: [[colNum, col], ...]
  const resultFields = [];
  let item = []; // 作为缓存每一项的列表
  let isFullPush = false;
  for (let i = 0; i < fieldsArr.length; i++) {
    const [colNum, col] = fieldsArr[i];
    if (colNum === 24) {
      if (isFullPush) {
        resultFields.push(item);
        resultFields.push([col]);
        item = [];
        isFullPush = false;
      } else if (item.length) { // 当前项为24，先push缓存的item，再push当前项
        // console.log('--pre24push--', item);
        resultFields.push(item);
        resultFields.push([col]);
        item = [];
      } else {  // 直接push当前项
        // console.log('--is24push--', item);
        resultFields.push([col]);
        item = [];
      }
    } else if (item.length < (24 / colNum)) { // 缓存
      item.push(col);
    } else { // 缓存列表已满，先push缓存的item，在添加标志给下一项为24的判断使用
      // console.log('--full push--', item);
      resultFields.push(item);
      item = [col];
      isFullPush = true;
    }
  }

  if (item.length) resultFields.push(item); // 把最后缓存的一项放进去

  return resultFields.map((row, i) => <Row key={`row${i}`}>{row}</Row>);
}

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
          'is-validating': validateStatus === 'validating'
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
    onFieldControlFocus: () => { }
  };

  usage = 0; // 0新增，1编辑，2高级搜索

  constructor(props) {
    super(props);
    this.state = {
      fieldsDecorator: this.generateFieldsDecorators(props.fields),
      RelObjectConfig: this.getRelObjectConfig(props.fields), //引用对象集合
      entcommDetail: {}
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

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (['form', 'wrappedComponentRef'].indexOf(key) === -1 && !is(thisProps[key], nextProps[key])) {
        //console.log('DynamicFormBase_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('DynamicFormBase_state:' + key);
        return true;
      }
    }

    return false;
  }

  componentDidMount() { //表格批量新增的时候  需要执行配置JS  base2文件才有效 只是为了统一文件内容
    const { batchAddInfo_type, batchAddInfo_fieldname, batchAddInfo_fieldid } = this.props;
    if (batchAddInfo_type === 'add') {
      this.onFieldValueChange({ fieldname: batchAddInfo_fieldname, fieldid: batchAddInfo_fieldid });
    }
  }

  getRelObjectConfig = (fields) => {
    const RelObjectConfig = [];
    this.processFields(fields).map(item => {
      if (item.controltype === 31) {  //引用对象 的相关配置先存起来 对相关项进行监听
        RelObjectConfig.push(item);
      }
    });

    //TODO: 整理 共用一个来源对象的引用字段 集合在一起  减少网络请求次数
    const relObject = {};
    RelObjectConfig.map(item => {
      const { controlField } = item.fieldconfig;
      if (relObject[controlField]) {
        relObject[controlField].push(item);
      } else {
        relObject[controlField] = [item];
      }
    });

    return relObject;
  }

  generateFieldsDecorators = (fields) => {
    const decorators = {};
    this.processFields(fields).forEach(field => {
      const { fieldname, fieldconfig, controltype } = field;
      const initialValue = (fieldconfig && fieldconfig.defaultValue) ? fieldconfig.defaultValue : fieldconfig.defaultValueNormal;
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
          const isEmptyDataSource = field.controltype === 18 && JSON.stringify(value) === '{}';
          if (value === undefined || value === '' || value === null || isEmptyArray || isEmptyAddress || isEmptyDataSource) {
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
          if (value && !(/^1[34578]\d{9}$/.test(value))) {
            return callback('请输入11位的手机号码');
          }
          callback();
        }
      });
    }
    if (field.controltype === 12) {
      rules.push({
        validator(rule, value, callback) {
          if (value && !/^[0-9\-]{1,}$/.test(value)) {
            return callback('请输入正确的电话号码');
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
      const newField = { ...field };
      if (newField.fieldconfig && newField.fieldconfig.limitDate) {
        if (newField.fieldconfig.limitDate === 'now') {
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          newField.dateStartValue = `${year}-${month}-${day}`;
        } else {
          newField.dateStartValue = newField.fieldconfig.limitDate;
        }
      }
      if (newField.controltype === 20) {
        if (newField.fieldconfig.isVisible === 1 && newField.fieldconfig.isVisibleJS !== 0) {
          lastGroup = {
            title: newField.displayname,
            foldable: newField.fieldconfig.foldable === 1,
            fields: [],
            isVisible: 1
          };
          groups.push(lastGroup);
        }
        return;
      }
      lastGroup.fields.push(newField);
    });
    return groups;
  };

  getFieldControlInstance = fieldname => {
    const fieldControl = this[`fieldControlInst${fieldname}`];
    return (fieldControl && fieldControl.getControlRef()) || null;
  };

  onFieldControlRef = (fieldname, ref) => {
    this[`fieldControlInst${fieldname}`] = ref;
  };

  onFieldFocus = (fieldname, callback) => {
    const { jsEngine } = this.props;
    if (jsEngine) {
      jsEngine.handleFieldControlFocus(fieldname, callback);
    }
  };

  onFieldValueChange = (field, newValue, isFromApi) => {
    const { fieldid, fieldname, fieldconfig } = field;
    const relObjectSetFields = this.state.RelObjectConfig[fieldid];
    if (relObjectSetFields) {  //存在引用对象控件 引用的是当前控件的值
      const dataSourceData = typeof newValue === 'string' ? (newValue === '' ? false : JSON.parse(newValue)) : newValue;
      if (newValue instanceof Array) {
        console.info('引用对象不允许数据源多选的情况下setValue()');
      } else if (dataSourceData) {
        this.fetchEntcommDetail(dataSourceData.id, relObjectSetFields); //数据源关联的实体id  记录recid  记录详情下要取得字段id
      } else { //可能用户在做清除操作
        relObjectSetFields.map(item => {
          this.getFieldControlInstance(item.fieldname).setTitle('');
        });
      }
    }
    // 数据源对象控件
    if (fieldconfig && fieldconfig.dataSource && fieldconfig.dataSource.EntityId) {
      const dataSourceData = typeof newValue === 'string' ? (newValue === '' ? false : JSON.parse(newValue)) : newValue;
      if (newValue instanceof Array) {
        console.info('数据源对象不允许数据源多选的情况下setValue()');
      } else if (dataSourceData) {
        this.fetchOriginEntcommDetail(dataSourceData.id, fieldconfig.dataSource.EntityId, fieldid);
      } else { //可能用户在做清除操作
        this.clearByOriginEmpty(fieldid);
      }
    }

    if (isFromApi) return;
    const { jsEngine } = this.props;
    if (jsEngine) {
      jsEngine.handleFieldValueChange(fieldname);
    }
  };

  fetchEntcommDetail = (recId, setRelObjectFields) => {
    const { entcommDetail } = this.state;
    const entityId = setRelObjectFields[0].fieldconfig.originEntity;
    const hasEntCommDetailData = entcommDetail[entityId + '' + recId];
    if (hasEntCommDetailData) { //已经存在数据  不再请求了
      setRelObjectFields.map(item => { //引用同一个字段的 引用对象  共用一个接口  减少性能消耗
        const { originFieldname } = item.fieldconfig;
        const value_name = hasEntCommDetailData[originFieldname + '_name'] || hasEntCommDetailData[originFieldname];
        if (!this.getFieldControlInstance(item.fieldname)) {
          console.log('---get instance err---', item.fieldname);
        } else this.getFieldControlInstance(item.fieldname).setTitle(value_name);
      });
      return;
    }

    getEntcommDetail({
      entityId,
      recId: recId,
      needPower: 0
    }).then(result => {
      const detailData = result.data.detail;
      setRelObjectFields.map(item => { //引用同一个字段的 引用对象  共用一个接口  减少性能消耗
        const { originFieldname } = item.fieldconfig;
        const value_name = detailData[originFieldname + '_name'] || detailData[originFieldname];
        if (!this.getFieldControlInstance(item.fieldname)) {
          console.log('---get instance err---', item.fieldname);
        } else this.getFieldControlInstance(item.fieldname).setTitle(typeof value_name === 'object' ? '' : value_name);

        this.setState({
          entcommDetail: {
            ...entcommDetail,
            [entityId + '' + recId]: result.data.detail
          }
        });
      });
    }, err => {
      console.error(err.message);
    });
  }

  fetchOriginEntcommDetail = (recId, entityId, fieldid) => {
    getEntcommDetail({ entityId, recId, needPower: 1 }).then(result => {
      const { fields } = this.props;
      const detailData = result.data.detail;
      // 筛选controlField为当前fieldid和ifcontrolfield为true和isautoset为true的字段，来自动写入
      const needControlFiles = fields.filter(f => (
        f.fieldconfig && f.fieldconfig.ifcontrolfield && f.fieldconfig.isautoset &&
        f.fieldconfig.controlField === fieldid && f.fieldid !== fieldid
      ));
      console.log('---needControl set Files---', needControlFiles);
      if (!needControlFiles.length) return;
      needControlFiles.forEach(item => {
        setTimeout(() => {
          const { fieldconfig: { originFieldname }, controltype, fieldname } = item;
          let value_name = detailData[originFieldname + '_name'] || detailData[originFieldname] || '';
          if (controltype === 4 || controltype === 17) value_name = detailData[originFieldname];
          if (controltype === 18 || controltype === 25) value_name = [detailData[originFieldname]]; // 数组源setValue只支持数组对象
          this.setInstanceValue(controltype, fieldname, value_name);
        }, 0);
      });
    }, err => {
      console.error(err.message);
    });
  }

  clearByOriginEmpty = (fieldid) => {
    const { fields } = this.props;
    // 筛选controlField为当前fieldid和ifcontrolfield为true和isautoclear为false的字段
    const needControlFiles = fields.filter(f => (
      f.fieldconfig && f.fieldconfig.ifcontrolfield && f.fieldconfig.isautoclear &&
      f.fieldconfig.controlField === fieldid && f.fieldid !== fieldid
    ));
    console.log('---needControl clear Files---', needControlFiles);
    if (!needControlFiles.length) return;
    needControlFiles.forEach(item => {
      setTimeout(() => {
        const { controltype, fieldname } = item;
        this.setInstanceValue(controltype, fieldname, '');
      }, 0);
    });
  }

  setInstanceValue = (controltype, fieldname, value) => {
    let setFun;
    if ([3, 16, 17].includes(controltype)) setFun = 'setValueByName';
    else setFun = 'setValue';
    if (!this.getFieldControlInstance(fieldname)) {
      console.log('---get instance err---', fieldname);
    } else this.getFieldControlInstance(fieldname)[setFun](value);
  }


  // 用于客户引用
  handleQuote = formData => {
    const { form, setExtraData, setFieldsConfig } = this.props;
    form.setFieldsValue(formData);
    if (setExtraData) setExtraData('commonid', formData.recid);
    if (setFieldsConfig) setFieldsConfig(formData);
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

  // 由于每一项内容长度不一样，导致每个col的高度可能不一致
  // 根据colNum拆分一行有多少个Col，再插入Row
  slinceFileds = (fields) => {
    const fieldsArr = this.renderFields(fields);
    const resultFields = getSlinceFileds(fieldsArr);
    return resultFields;
  }

  renderFields = fields => {
    return this.processFields(fields).map(this.renderField);
  };

  renderField = field => {
    let colNum = 24;
    if (field.controltype === 30) { // 用于主页动态实体，传入当前recid
      return (
        <FormItem key={field.fieldname} style={{ display: 'none' }}>
          {this.props.form.getFieldDecorator(field.fieldname, {
            initialValue: this.props.refRecord
          })(<div>{this.props.refRecord}</div>)}
        </FormItem>
      );
    }

    if (onlylineField.indexOf(field.controltype) > -1 || (field.controltype === 25 && field.fieldconfig.multiple === 1)) {
      colNum = 24;
    } else if (this.props.cols) {
      colNum = this.props.cols;
    } else if (document.body.clientWidth > 1500) {
      colNum = 6;
    } else if (document.body.clientWidth > 1100) {
      colNum = 8;
    } else {
      colNum = 12;
    }

    const fieldControl = this.renderFieldControl(field);

    let className = '';
    if (!this.props.cols) {
      const isHorizontal = this.getFormLayout() === 'horizontal';
      if (isHorizontal) {
        //TODO： 如果表单单元项 lable 和 formItem是横向布局， 有的单元项会占一行，导致lable的宽跟其他表单项对不齐  so...
        if (colNum === 24) {
          className = 'twoCol_onlylineFormItem';
          if (document.body.clientWidth > 1100) className = 'threeCol_onlylineFormItem';
          if (document.body.clientWidth > 1500) className = 'fourCol_onlylineFormItem';
        } else if ([6, 8].includes(colNum)) {
          className = 'height50Col_onlylineFormItem';
        }
      } else if (colNum !== 24) {
        className = 'height79Col_onlylineFormItem';
      }
    }

    return (
      <Col span={colNum}
        key={field.fieldname}
        className={className}
        style={{ padding: '0 10px' }}>
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

    const layout = this.getFormItemLayout(field.fieldname);
    return children => (
      <WrapFormItem
        key={field.fieldname}
        label={getIntlText('displayname', field)}
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
    const { entityTypeId, entityId, value, cacheId } = this.props;
    const { fieldid, fieldname, displayname, dateStartValue, controltype, allowadd = false } = field;
    let fieldconfig = field.fieldconfig;

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
        cacheId={cacheId}
        isCommonForm
        onChange={this.onFieldValueChange.bind(this, field)}
        entityId={entityId}
        entityTypeId={entityTypeId}
        usage={this.usage}
        isTable={this.isTable}
        ref={this.onFieldControlRef.bind(this, fieldname)}
        controlType={controltype}
        fieldId={fieldid}
        fieldName={fieldname}
        allowadd={allowadd}
        config={fieldconfig}
        value_name={value_name}
        fieldLabel={displayname}
        startValue={dateStartValue}
        onFocus={this.onFieldFocus.bind(this, fieldname)}
        quoteHandler={this.handleQuote}
        jsEngine={this.props.jsEngine}
        OriginCopyAddForm={this.props.origin === 'EntcommCopyModal'}
        isEmitFlag={this.props.isEmitFlag}
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
            <FoldableGroup key={group.title} title={group.title} isVisible={group.isVisible} foldable={group.foldable}>
              {this.renderFields(group.fields)}
            </FoldableGroup>
          ))}
        </Row>
      </Form>
    );
  }
}

export default DynamicFormBase;
