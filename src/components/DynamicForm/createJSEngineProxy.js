import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';
import { getAuthedHeaders } from '../../utils/request';
import { queryEntityDetail } from '../../services/entity';

function debugMsg(msg) {
  Modal.info({
    title: 'Debug',
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
      entityTypeId: PropTypes.string, // 若有entityTypeId，则调接口查看是否有初始化js脚本
      form: PropTypes.any,
      fields: PropTypes.array,
      value: PropTypes.any,
      mode: PropTypes.string,
      refEntity: PropTypes.string,
      refRecord: PropTypes.string
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
      if (this.props.entityTypeId) {
        this.fetchGlobalJS(this.props.entityTypeId);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        console.log('valueChange', this.props.value, nextProps.value);
      }

      this.setState({ fields: nextProps.fields }, () => {
        if (this.globalJS && !this.globalJSExecuted && this.props.fields.length) {
          setTimeout(() => {
            this.excuteJS(this.globalJS, 'global');
          }, 0);
          this.globalJSExecuted = true;
        }
      });

      if (nextProps.entityTypeId !== this.props.entityTypeId) {
        this.fetchGlobalJS(nextProps.entityTypeId);
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

    setJS = props => {
      const fieldExpandJS = {};
      const fieldExpandFilterJS = {};
      props.fields.forEach(field => {
        if (field.expandjs) {
          fieldExpandJS[field.fieldname] = field.expandjs;
        }
        if (field.filterjs) {
          fieldExpandFilterJS[field.fieldname] = field.filterjs;
        }
      });
      this.fieldExpandJS = fieldExpandJS;
      this.fieldExpandFilterJS = fieldExpandFilterJS;
    };

    fetchGlobalJS = (entityId) => {
      this.globalJSLoading = true;
      queryEntityDetail(entityId).then(result => {
        let globalJS = '';
        const data = result.data.entityproinfo[0];
        if (data) {
          let ftype = this.props.mode || formType;
          switch (ftype) {
            case FormTypes.ADD:
              globalJS = data.newload;
              break;
            case FormTypes.EDIT:
              globalJS = data.editload;
              break;
            case FormTypes.DETAIL:
              globalJS = data.checkload;
              break;
            default:
          }
        }
        this.globalJSLoading = false;
        this.globalJS = globalJS;
        if (this.props.fields.length) {
          setTimeout(() => {
            this.excuteJS(this.globalJS, 'global');
          }, 0);
          this.globalJSExecuted = true;
        }
      }, err => {
        // this.setState({ loadingGlobalJS: false, globalJS: '' });
      });
    };

    getFieldComponentInstance = (fieldName) => {
      const inst = this.formComponentInstance;
      return inst.getFieldControlInstance(fieldName);
    };

    alert = (type, content) => {
      if (typeof content === 'object') {
        debugMsg(JSON.stringify(content));
      } else {
        debugMsg(content);
      }
    };

    getValue = fieldName => {
      const { form, value: formValue } = this.props;
      const value = form ? form.getFieldValue(fieldName) : formValue[fieldName];
      const controlType = this.getFieldControlType(fieldName);
      if (!value) {
        switch (controlType) {
          case 1:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
            return '';
          case 6:
          case 7:
            return 0;
          case 13:
          case 14:
            return { lat: 0, lon: 0, address: '' };
          case 18:
            return {};
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
        default:
          return value;
      }
    };

    // 给指定字段设置id值，目前只支持文本输入框、字典
    setValue = (fieldName, value, decimalLength) => {
      setTimeout(() => {
        try {
          let val = value;
          if (decimalLength !== undefined && this.getFieldControlType(fieldName) === 7) {
            val = +val;
            if (isNaN(val)) {
              val = 0;
            } else {
              val = +(val.toFixed(2));
            }
          }
          this.getFieldComponentInstance(fieldName).setValue(val, decimalLength);
        } catch (e) {
          console.error(e);
          // this.props.form.setFields({ [fieldName]: { value } });
          // this.props.form.setFieldsValue({ [fieldName]: value });
        }
      }, 0);
    };

    // 给指定字段设置显示值，支持字典、选人、树形控件
    setValueByName = (fieldName, value) => {
      setTimeout(() => {
        try {
          const inst = this.getFieldComponentInstance(fieldName);
          inst.setValueByName(value);
        } catch (e) {
          console.error(e);
        }
      }, 0);
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
        return [value[rowIndex].FieldData || value[rowIndex]];
      }
      if (value && rowIndex === -1) {
        return value.map(rowVal => rowVal.FieldData || rowVal);
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

    designateDataSource = (fieldName, ids) => {
      if (ids === undefined || ids === null) return;
      this.setFieldConfig(fieldName, {
        designateDataSource: typeof ids === 'object' ? ids : (ids + ''),
        designateDataSourceByName: ''
      });
    };

    designateDataSourceByName = (fieldName, names) => {
      this.setFieldConfig(fieldName, {
        designateDataSource: '',
        designateDataSourceByName: names
      });
    };

    designateFilterDataSource = (fieldName, ids) => {
      if (ids === undefined) return;
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
      if (!names) return;
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
      this.setFieldConfig(fieldName, {
        designateNodes: [{ path: nodePath, includeSubNode }]
      });
    };

    designateNodes = (fieldName, nodePath, includeSubNode = false) => {
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
        designateNodes: '',
        designateFilterNodes: ''
      });
    };

    setVisible = (fieldName, isVisible) => {
      this.setFieldConfig(fieldName, { isVisibleJS: isVisible ? 1 : 0 });
      if (!isVisible) {
        // this.setValue(fieldName, undefined);
        this.props.form && this.props.form.setFieldsValue({ [fieldName]: '' });
      }
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

    setRowFieldReadOnly = (tableFieldName, rowIndex, columnFieldName, isReadonly) => {
      if (this.getFieldControlType(tableFieldName) !== 24) return [];
      const instance = this.getFieldComponentInstance(tableFieldName);
      if (instance && instance.setRowFieldReadOnly) {
        return instance.setRowFieldReadOnly(columnFieldName, isReadonly);
      }
    };

    getFieldConfig = fieldName => {
      const field = this.getFieldByName(fieldName);
      return field && field.fieldconfig;
    };

    setFieldConfig = (fieldName, config) => {
      const field = this.getFieldByName(fieldName);
      if (field) {
        field.fieldconfig = {
          ...field.fieldconfig,
          ...config
        };
      }
      this.setState({ fields: [...this.state.fields] });
    };

    getFieldByName = (fieldName) => {
      return _.find(this.props.fields, ['fieldname', fieldName]);
    };

    getFieldControlType = fieldName => {
      const field = this.getFieldByName(fieldName);
      return field && field.controltype;
    };

    getMainFormID = () => {
      return {
        entityid: this.props.refEntity,
        recid: this.props.refRecord
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
      const expandJS = this.fieldExpandJS[fieldName];
      if (expandJS) {
        if (this.globalJSLoading) {
          console.warn('global js 未加载完成，将不触发此次js脚本：', fieldName);
          return;
        }
        this.excuteJS(expandJS, `field value change__${fieldName}`);
      }
    };

    handleFieldControlFocus = (fieldName) => {
      const app = this;
      const filterJS = this.fieldExpandFilterJS[fieldName];
      if (filterJS) {
        if (this.globalJSLoading) {
          console.warn('global js 未加载完成，将不触发此次js脚本：', fieldName);
          return;
        }
        this.excuteJS(filterJS, `field focused__${fieldName}`);
      }
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
