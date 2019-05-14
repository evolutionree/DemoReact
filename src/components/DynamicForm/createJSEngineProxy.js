import React, { Component, PropTypes } from 'react';
import * as _ from 'lodash';
import { is } from 'immutable';
import { Modal } from 'antd';
import { getAuthedHeaders } from '../../utils/request';
import { queryEntityDetail } from '../../services/entity';
import { getLocalAuthentication } from '../../services/authentication';
import { uuid } from "../../utils";

function debugMsg(type, msg) {
  Modal.info({
    title: type,
    content: msg,
    okText: 'OK'
  });
}

function toNumber(input) {
  let num = input;
  if (typeof input !== 'number') {
    num = +num;
  }
  if (isNaN(num)) {
    num = 0;
  }
  return num;
}

const FormTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DETAIL: 'DETAIL'
};

/**
 * 动态表单js脚本执行器
 * @param OriginComponent
 * @returns {NewComponent}
 */
export default function createJSEngineProxy(OriginComponent, options = {}) {
  const formType = options.type;
  return class WithJSEngineProxy extends Component {
    static propTypes = {
      entityId: PropTypes.string, // 若有entityId，则调接口查看是否有初始化js脚本
      entityTypeId: PropTypes.string, // 若有entityTypeId，则调接口查看是否有初始化js脚本
      form: PropTypes.any,
      fields: PropTypes.array,
      value: PropTypes.any,
      mode: PropTypes.string,
      refEntity: PropTypes.string,
      refRecord: PropTypes.string,
      parentJsEngine: PropTypes.object
    };

    fieldExpandJS = {};
    fieldExpandFilterJS = {};
    globalJS = '';
    globalJSLoading = false;
    globalJSExecuted = false;
    excuteId = 0;

    constructor(props) {
      super(props);
      this.state = {
        fields: props.fields
      };
      this.setJS(props);
    }

    componentDidMount() {
      if (this.props.origin === 'RelTableRow') { //来源于表格 为了不多次请求 全局JS 由父组件传（不然  表格多行会引起多次请求 ）
        this.setGlobalJS(this.props.globalJS);
      } else if (this.props.entityId) {
        this.fetchGlobalJS(this.props.entityId);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        //console.log('valueChange', this.props.value, nextProps.value);
      }

      this.setState({ fields: nextProps.fields }, () => {
        if (this.globalJS && !this.globalJSExecuted && nextProps.fields.length) {
          if (!this.props.cacheId) { //暂存表单 不走全局JS
            setTimeout(() => {
              this.excuteJS(this.globalJS, 'global');
            }, 0);
          }
          this.globalJSExecuted = true;
        }
      });

      if (nextProps.origin === 'RelTableRow') { //来源于表格 为了不多次请求 全局JS 由父组件传（不然  表格多行会引起多次请求 ）
        const nextPropGlobalJS = nextProps.globalJS || {};
        if (Object.keys(nextPropGlobalJS).length > 0 && !this.globalJSExecuted) {
          this.setGlobalJS(nextProps.globalJS);
        }
      } else if (nextProps.entityId !== this.props.entityId) {
        this.fetchGlobalJS(nextProps.entityId);
      }

      this.setJS(nextProps);

      // 2017/10/13 触发机制修改，只有来自用户触发的值改变才执行js
      // const formValue = this.props.value;
      // const nextFormValue = nextProps.value;
      // const keys = _.union(Object.keys(formValue), Object.keys(nextFormValue));
      //
      // keys.forEach(key => {
      //   const lastVal = formValue[key] && formValue[key].value;
      //   const nextVal = nextFormValue[key] && nextFormValue[key].value;
      //   if (nextVal !== lastVal) {
      //     // this.handleFieldValueChange(key);
      //   }
      // });
    }

    shouldComponentUpdate(nextProps, nextState) {
      const thisProps = this.props || {};
      const thisState = this.state || {};

      if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
        return true;
      }

      for (const key in nextProps) {
        if (['form', 'wrappedComponentRef'].indexOf(key) === -1 && !is(thisProps[key], nextProps[key])) {
          //console.log('createJSEngineProxy_props:' + key);
          return true;
        }
      }

      for (const key in nextState) {
        if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
          //console.log('state:' + key);
          return true;
        }
      }

      return false;
    }

    validateFields = (opts, callback) => {

    };

    setJS = props => {
      const fieldExpandJS = {};
      const fieldExpandFilterJS = {};
      Array.isArray(props.fields) && props.fields.forEach(field => {
        if (field && field.expandjs) {
          fieldExpandJS[field.fieldname] = field.expandjs;
        }
        if (field && field.filterjs) {
          fieldExpandFilterJS[field.fieldname] = field.filterjs;
        }
      });
      this.fieldExpandJS = fieldExpandJS;
      this.fieldExpandFilterJS = fieldExpandFilterJS;
    };

    setGlobalJS = (JS) => {
      const { mode, origin, OriginCopyAddForm, fields } = this.props;
      if (this.props.cacheId) { //暂存表单 不走全局JS
        return;
      }
      let globalJS = '';
      const data = JS;
      if (data && Object.keys(data).length) {
        const ftype = mode || formType;
        switch (ftype) {
          case FormTypes.ADD:
            //复制新增的时候  取copyload 全局JS
            globalJS = (origin === 'EntcommCopyModal' || OriginCopyAddForm) ? data.copyload : data.newload;
            break;
          case FormTypes.EDIT:
            globalJS = OriginCopyAddForm ? data.editload : (typeof OriginCopyAddForm !== 'boolean' ? data.editload : data.newload);
            break;
          case FormTypes.DETAIL:
            globalJS = data.checkload;
            break;
          default:
        }
      }
      this.globalJS = globalJS;
      if (fields && fields.length) {
        setTimeout(() => {
          this.excuteJS(this.globalJS, 'global');
        }, 0);
        this.globalJSExecuted = true;
      }
    }

    fetchGlobalJS = (entityId) => {
      this.globalJSLoading = true;
      queryEntityDetail(entityId).then(result => {
        const data = result.data.entityproinfo[0];
        this.globalJSLoading = false;
        this.setGlobalJS(data);
      }, err => {
        // this.setState({ loadingGlobalJS: false, globalJS: '' });
      });
    };

    getFieldComponentInstance = (fieldName) => {
      const inst = this.formComponentInstance;
      return inst && inst.getFieldControlInstance && inst.getFieldControlInstance(fieldName);
    };

    alert = (type, content) => {
      if (typeof content === 'object') {
        debugMsg(type, JSON.stringify(content));
      } else {
        debugMsg(type, content);
      }
    };

    getParentForm = () => {
      if (!this.props.parentJsEngine) return {};
      return this.props.parentJsEngine.getFormValue();
    };

    getFormValue = () => {
      const { entityTypeId } = this.props;
      const formValue = {
        entityTypeId
      };
      this.props.fields.forEach(field => {
        const val = this.getValue(field.fieldname);
        formValue[field.fieldname] = val;
      });
      return formValue;
    };

    getCurrentUserID = () => {
      const { user } = getLocalAuthentication();
      try {
        const userId = JSON.parse(user).userNumber;
        return userId + '';
      } catch (e) {
        return '';
      }
    };

    getValue = fieldName => {
      const { form, value: formValue } = this.props;
      const value = form ? form.getFieldValue(fieldName) : formValue[fieldName];
      const controlType = this.getFieldControlType(fieldName);
      if (!value) {
        switch (controlType) {
          case 1:
          case 4: // 多选
          case 5:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
          case 17:
          case 22:
          case 28:
          case 29:
            return '';
          case 6:
          case 7:
            return 0;
          case 13:
          case 14:
            return { lat: 0, lon: 0, address: '' };
          case 18:
            return {};
          case 24:
            return [];
          default:
            return value;
        }
      }
      switch (controlType) {
        case 6:
        case 7:
          return toNumber(value);
        case 18:
          return typeof value === 'string' ? JSON.parse(value) : value;
        case 24:
          if (!Array.isArray(value)) return value;
          return value.map(item => item.FieldData || item);
        default:
          return value;
      }
    };

    handleNumberValue = (fieldName, value, decimalLength) => {
      let val = value;
      if (decimalLength !== undefined && this.getFieldControlType(fieldName) === 7) {
        val = +val;
        if (isNaN(val)) {
          val = 0;
        } else {
          val = +(val.toFixed(2));
        }
      }
      return val;
    }

    // 给指定字段设置id值，目前只支持文本输入框、字典
    setValue = (fieldName, value, decimalLength) => {
      try {
        const val = this.handleNumberValue(fieldName, value, decimalLength);
        if (fieldName && typeof fieldName === 'object') {
          Object.keys(fieldName).forEach(keyName => {
            const currentValue = this.handleNumberValue(keyName, fieldName[keyName], decimalLength);
            this.getFieldComponentInstance(keyName) && this.getFieldComponentInstance(keyName).setValue(currentValue, decimalLength, keyName);
          });
        } else {
          this.getFieldComponentInstance(fieldName) && this.getFieldComponentInstance(fieldName).setValue(val, decimalLength, fieldName);
        }
      } catch (e) {
        console.error(e);
        // this.props.form.setFields({ [fieldName]: { value } });
        // this.props.form.setFieldsValue({ [fieldName]: value });
      }
      this.getFieldComponentInstance(fieldName) && this.getFieldComponentInstance(fieldName).setValue(val, decimalLength, fieldName);
    };

    // 给指定字段设置显示值，支持字典、选人、树形控件
    setValueByName = (fieldName, value) => {
      try {
        const inst = this.getFieldComponentInstance(fieldName);
        inst.setValueByName(value);
      } catch (e) {
        console.error(e);
      }
    };

    getTableRowCount = fieldName => {
      // 判断是否表格控件
      if (this.getFieldControlType(fieldName) !== 24) return 0;
      const value = this.getValue(fieldName);
      if (value) {
        return value.length;
      }
      return 0;
    };

    getRowValue = (fieldName, rowIndex) => {
      // 判断是否表格控件
      if (this.getFieldControlType(fieldName) !== 24) return [];
      const value = this.getValue(fieldName);
      if (value && value[rowIndex]) {
        return [_.cloneDeep([rowIndex].FieldData || value[rowIndex])];
      }
      if (value && rowIndex === -1) {
        return value.map(rowVal => _.cloneDeep(rowVal.FieldData || rowVal));
      }
      return [];
    };

    setRowValue = (fieldName, rowIndex, rowValue) => {
      // 判断是否表格控件
      if (this.getFieldControlType(fieldName) !== 24) return;
      const inst = this.getFieldComponentInstance(fieldName);
      inst.setRowValue(rowIndex, rowValue);
    };

    getTableHeader = (fieldName, rowIndex) => {
      if (this.getFieldControlType(fieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(fieldName);
      if (instance && instance.getTableHeader) {
        return instance.getTableHeader();
      }
    };

    getTableFields = (fieldName) => {
      if (this.getFieldControlType(fieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(fieldName);
      if (instance && instance.getFields) {
        return instance.getFields();
      }
    }

    getTableRowFields = (fieldName) => { //TODO:2018.11.8 为解决表格某列字段在不同行会有不同表现（必填、只读），表格协议改为每一行都由自身的协议渲染
      if (this.getFieldControlType(fieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(fieldName);
      if (instance && instance.getRowFields) {
        return instance.getRowFields();
      }
    }

    designateDataSource = (fieldName, ids) => {
      if (ids === undefined || ids === null) ids = '';
      this.setFieldConfig(fieldName, {
        designateDataSource: typeof ids === 'object' ? ids : (ids + ''),
        designateDataSourceByName: ''
      });
    };

    designateDataSourceByName = (fieldName, names) => {
      this.setFieldConfig(fieldName, {
        designateDataSource: '',
        designateDataSourceByName: names || ''
      });
    };

    designateFilterDataSource = (fieldName, ids) => {
      if (ids === undefined || ids === null) ids = '';
      const conf = this.getFieldConfig(fieldName);
      if (!conf) return;
      const { designateFilterDataSource: oldVal, excuteId } = conf;
      const newVal = (oldVal && excuteId === this.excuteId) ? (oldVal + ',' + ids) : ids;
      this.setFieldConfig(fieldName, {
        designateFilterDataSource: newVal + '',
        designateFilterDataSourceByName: '',
        excuteId: this.excuteId
      });
    };

    designateFilterDataSourceByName = (fieldName, names) => {
      if (!names) names = '';
      const conf = this.getFieldConfig(fieldName);
      if (!conf) return;
      const { designateFilterDataSourceByName: oldVal, excuteId } = conf;
      const newVal = (oldVal && excuteId === this.excuteId) ? (oldVal + ',' + names) : names;
      this.setFieldConfig(fieldName, {
        designateFilterDataSource: '',
        designateFilterDataSourceByName: newVal,
        excuteId: this.excuteId
      });
    };

    designateNode = (fieldName, nodePath, includeSubNode = false) => {
      const designateNodes = (nodePath || '').split(',').map(nodePathItem => {
        return { path: nodePathItem, includeSubNode };
      });
      this.setFieldConfig(fieldName, {
        designateNodes: designateNodes
      });
    };

    designateNodes = (fieldName, nodePath, includeSubNode = false) => {
      //TODO:Android端开发湛强 说这个函数不再使用了  具体原因我,,,,听不懂,,,,
      if (!nodePath) return;
      const conf = this.getFieldConfig(fieldName);
      if (!conf) return;
      const { designateNodes = [] } = conf;
      const hasExist = designateNodes.some(item => {
        return item.path === nodePath && item.includeSubNode === includeSubNode;
      });
      if (hasExist) return;
      this.setFieldConfig(fieldName, {
        designateNodes: [...designateNodes, { path: nodePath, includeSubNode }]
      });
    };

    designateFilterNodes = (fieldName, nodePath) => {
      if (!nodePath) return;
      const conf = this.getFieldConfig(fieldName);
      if (!conf) return;
      const { designateFilterNodes = [] } = conf;
      const hasExist = designateFilterNodes.some(item => {
        return item.path === nodePath;
      });
      if (hasExist) return;
      this.setFieldConfig(fieldName, {
        designateFilterNodes: [...designateFilterNodes, nodePath]
      });
    };

    clearFilter = fieldName => {
      this.setFieldConfig(fieldName, {
        designateDataSource: '',
        designateDataSourceByName: '',
        designateFilterDataSource: '',
        designateFilterDataSourceByName: '',
        designateNodes: [],
        designateFilterNodes: []
      });
    };

    setVisible = (fieldName, isVisible) => {
      const { form, origin } = this.props;
      if (origin === 'RelTableRow') { //TODO: 表格里的表单执行js 则setVisible 替换为 setReadOnly
        this.setFieldConfig(fieldName, { isReadOnlyJS: isVisible ? 0 : 1 });
      } else {
        this.setFieldConfig(fieldName, { isVisibleJS: isVisible ? 1 : 0 });
      }

      if (!isVisible && form) {
        const { getFieldsValue } = form;
        const obj = {};
        const keys = getFieldsValue();
        // this.setValue(fieldName, undefined);

        if (Array.isArray(fieldName)) {
          fieldName.forEach(field => {
            if (field in keys) obj[field] = '';
          });
        } else if (fieldName && typeof fieldName === 'object') {
          Object.keys(fieldName).forEach(field => {
            if (field in keys) obj[field] = '';
          });
        } else if (fieldName in keys) {
          form.setFieldsValue({ [fieldName]: '' });
        }

        if (Object.keys(obj).length) form.setFieldsValue(obj);
      }
    };

    setRequired = (fieldName, isRequired) => {
      this.setFieldConfig(fieldName, { isRequiredJS: isRequired ? 1 : 0 });
    };

    setReadOnly = (fieldName, isReadOnly) => {
      this.setFieldConfig(fieldName, { isReadOnlyJS: isReadOnly ? 1 : 0 });
    };

    request = (url, method, body, headers) => {
      let headers_ = getAuthedHeaders();
      if (headers) {
        headers_ = { ...headers_, ...headers };
      }
      const result = $.ajax({
        url,
        type: method,
        data: body && JSON.stringify(body),
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        headers: headers_
      }).responseJSON;
      console.log('ajax result: ', result);
      return result;
    };

    setRowFieldVisible = (tableFieldName, rowIndex, columnFieldName, isVisible) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (instance && instance.setRowFieldVisible) {
        return instance.setRowFieldVisible(columnFieldName, isVisible);
      }
    };

    setRowFieldRequired = (tableFieldName, rowIndex, columnFieldName, isRequired) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (instance && instance.setRowFieldRequired) {
        return instance.setRowFieldRequired(columnFieldName, isRequired);
      }
    };

    setRowFieldReadOnly = (tableFieldName, rowIndex, columnFieldName, isReadonly) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (instance && instance.setRowFieldReadOnly) {
        return instance.setRowFieldReadOnly(columnFieldName, isReadonly);
      }
    };

    designateRowFieldDataSource = (tableFieldName, columnFieldName, type, values) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (!instance) return;
      if (type === 1) {
        let ids = values;
        if (ids === undefined || ids === null) ids = '';
        instance.setFieldConfig(columnFieldName, {
          designateDataSource: typeof ids === 'object' ? ids : (ids + ''),
          designateDataSourceByName: ''
        });
      } else if (type === 0) {
        let names = values || '';
        instance.setFieldConfig(columnFieldName, {
          designateDataSource: '',
          designateDataSourceByName: names
        });
      }
    };

    designateRowFieldNode = (tableFieldName, columnFieldName, nodePath, includeSubNode = false) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (!instance) return;
      const designateNodes = (nodePath || '').split(',').map(nodePathItem => {
        return { path: nodePathItem, includeSubNode };
      });
      instance.setFieldConfig(columnFieldName, {
        designateNodes: designateNodes
      });
    };

    designateRowFieldFilterDataSource = (tableFieldName, columnFieldName, type, values) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (!instance) return;
      if (type === 1) {
        let ids = values;
        if (ids === undefined || ids === null) ids = '';
        const conf = instance.getFieldConfig(columnFieldName);
        if (!conf) return;
        const { designateFilterDataSource: oldVal, excuteId } = conf;
        const newVal = (oldVal && excuteId === this.excuteId) ? (oldVal + ',' + ids) : ids;
        instance.setFieldConfig(columnFieldName, {
          designateFilterDataSource: newVal + '',
          designateFilterDataSourceByName: '',
          excuteId: this.excuteId
        });
      } else if (type === 0) {
        let names = values || '';
        const conf = instance.getFieldConfig(columnFieldName);
        if (!conf) return;
        const { designateFilterDataSourceByName: oldVal, excuteId } = conf;
        const newVal = (oldVal && excuteId === this.excuteId) ? (oldVal + ',' + names) : names;
        instance.setFieldConfig(columnFieldName, {
          designateFilterDataSource: '',
          designateFilterDataSourceByName: newVal,
          excuteId: this.excuteId
        });
      }
    };

    getFieldConfig = fieldName => {
      const field = this.getFieldByName(fieldName);
      return field && field.fieldconfig;
    };

    setFieldConfig = (fieldName, config) => {
      const { fields: fieldArr } = this.state;
      const fields = [...fieldArr];

      if ((fieldName && typeof fieldName === 'object') || Array.isArray(fieldName)) {
        fields.forEach(item => {
          const field = item;
          if (Array.isArray(fieldName) && fieldName.includes(field.fieldname)) {
            field.fieldconfig = {
              ...field.fieldconfig,
              ...config
            };
          } else {
            Object.keys(fieldName).forEach(keyName => {
              if (field.fieldname === keyName) {
                field.fieldconfig = {
                  ...field.fieldconfig,
                  ...config
                };
              }
            });
          }
        });
      } else {
        const field = fields.find(item => item.fieldname === fieldName);
        if (field) {
          field.fieldconfig = {
            ...field.fieldconfig,
            ...config
          };
        }
      }

      //TODO： 表格重新渲染
      this.props.reloadTable && this.props.reloadTable(this.props.rowIndex, uuid());
      this.setState({ fields });
    };

    getFieldByName = (fieldName) => {
      return this.state.fields.find(item => item.fieldname === fieldName);
    };

    getFieldControlType = fieldName => {
      const field = this.getFieldByName(fieldName);
      return field && field.controltype;
    };

    getMainFormID = () => {
      return {
        entityid: this.props.refEntity,
        recid: this.props.refRecord,
        entitydetail: this.props.refEntityData
      };
    };

    getCurrentFormID = () => {
      return {
        currentEntityId: this.props.entityId,
        currentRecId: this.props.value && this.props.value.recid,
        currentTypeId: this.props.entityTypeId
      };
    };

    getDefCode = () => {
      // const appDef = 'var app = {};';
      // const appPropsDef = [
      //   'getValue',
      //   'setValue',
      //   'setFieldVisible',
      //   'setFieldReadOnly',
      //   'designateDataSource',
      //   'designateDataSourceByName',
      //   'designateFilterDataSource',
      //   'designateFilterDataSourceByName',
      //   'clearFilter'
      // ].map((fn) => {
      //   return `app.${fn} = this.${fn}.bind(this)`;
      // }).join(';') + ';';
      // return appDef + appPropsDef;
      return 'var app = this;';
    };

    handleFieldValueChange = (fieldName) => {
      this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(true);
      setTimeout(() => {
        const expandJS = this.fieldExpandJS[fieldName];
        if (expandJS) {
          if (this.globalJSLoading) {
            console.warn('global js 未加载完成，将不触发此次js脚本：', fieldName);
            this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(false);
            return;
          }
          this.excuteJS(expandJS, `field value change__${fieldName}`);
        }
        this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(false);
      }, 0);


      // clearInterval(this.expandJstimer);
      // const expandJS = this.fieldExpandJS[fieldName];
      // if (expandJS) {
      //   this.expandJstimer = setInterval(() => {
      //     if (this.globalJSLoading) {
      //       console.warn('global js 未加载完成，将不触发此次js脚本：', fieldName);
      //       return;
      //     }
      //     this.excuteJS(expandJS, `field value change__${fieldName}`);
      //     clearInterval(this.expandJstimer);
      //   }, 100);
      // }
    };

    handleFieldControlFocus = (fieldName) => {
      this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(true);
      setTimeout(() => {
        const filterJS = this.fieldExpandFilterJS[fieldName];
        if (filterJS) {
          if (this.globalJSLoading) {
            console.warn('global js 未加载完成，将不触发此次js脚本：', fieldName);
            this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(false);
            return;
          }
          this.excuteJS(filterJS, `field focused__${fieldName}`);
        }
        this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(false);
      }, 0);
    };

    excuteJS = (js, logTitle) => {
      if (!js) return;
      try {
        this.excuteId += 1;
        console.info(
          `[${logTitle}]excuteJS: ${js && js.replace('/n', '').slice(1, 40)}...`
        );
        // eval(this.getDefCode() + filterJS);
        eval('var app = this;' + js);
      } catch (e) {
        this.props.excutingJSStatusChange && this.props.excutingJSStatusChange(false);
        console.error(e);
      }
    };

    render() {
      const { fields, ...restProps } = this.props;
      return (
        <div>
          {/*<button onClick={this.getTableHeader.bind(this, 'tab')}>test</button>*/}
          <OriginComponent
            ref={componentRef => { this.formComponentInstance = componentRef; }}
            onFieldControlFocus={this.handleFieldControlFocus}
            fields={this.state.fields}
            jsEngine={this}
            {...restProps}
          />
        </div>
      );
    }
  };
}
