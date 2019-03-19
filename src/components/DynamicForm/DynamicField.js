import React, { PropTypes } from 'react';
import { is } from 'immutable';
import { controlMap } from './constants';

class DynamicField extends React.Component {
  static propTypes = {
    isCommonForm: PropTypes.bool,
    entityId: PropTypes.string,
    entityTypeId: PropTypes.string,
    usage: PropTypes.oneOf([0, 1, 2]), // 新增 编辑 高级搜索
    isTable: PropTypes.bool,
    value: PropTypes.any,
    value_name: PropTypes.string, // 给控件显示值用，如用户控件
    onChange: PropTypes.func,
    onChangeWithName: PropTypes.func,
    onFocus: PropTypes.func,
    quoteHandler: PropTypes.func,
    controlType: PropTypes.number.isRequired,
    fieldconfig: PropTypes.shape({
      isReadOnly: PropTypes.oneOf([0, 1]),
      maxLength: PropTypes.number
    }),
    fieldLabel: PropTypes.string,
    fieldId: PropTypes.string,
    allowadd: PropTypes.Bool,
    jsEngine: PropTypes.object
  };
  static defaultProps = {
    isAdvanceSearch: false,
    isTable: false,
    mode: 'ADD'
  };

  getControlRef = () => {
    let controlRef = this.instRef;
    while (controlRef && controlRef.getWrappedInstance) {
      controlRef = controlRef.getWrappedInstance();
    }
    return controlRef;
  };

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length) {
      return true;
    }

    for (const key in nextProps) {
      if (['onFocus', 'data-__meta'].indexOf(key) === -1 && !is(thisProps[key], nextProps[key])) {
        // console.error(this.props.fieldname, key);
        // console.log(nextProps[key])
        return true;
      }
    }
    return false;
  }

  render() {
    const props = {
      key: this.props.fieldId,
      isCommonForm: this.props.isCommonForm,
      entityId: this.props.entityId,
      mainEntityId: this.props.entityId, //嵌套表格的实体定义属性名 跟 独立实体 简单实体 重名了，重新加一个  （嵌套实体 导入用到）
      entityTypeId: this.props.entityTypeId,
      isTable: this.props.isTable,
      mode: ['ADD', 'EDIT'][this.props.usage],
      value: this.props.value,
      value_name: this.props.value_name,
      fieldId: this.props.fieldId,
      allowadd: this.props.allowadd,
      onChange: this.props.onChange,
      onChangeWithName: this.props.onChangeWithName,
      onFocus: this.props.onFocus,
      quoteHandler: this.props.quoteHandler,
      ref: instRef => { this.instRef = instRef; },
      jsEngine: this.props.jsEngine,
      ...this.props.config
    };
    let ControlComponent = controlMap[this.props.controlType];
    if (!ControlComponent) {
      console.error(`无法识别控件类型: [controlType]${this.props.controlType}`);
      return null;
    }
    if (this.props.usage === 2) {
      ControlComponent = ControlComponent.AdvanceSearch || ControlComponent;
    }
    return React.createElement(ControlComponent, props);
  }
}

export default DynamicField;
