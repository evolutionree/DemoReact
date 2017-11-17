import React, { PropTypes } from 'react';
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
    onFocus: PropTypes.func,
    quoteHandler: PropTypes.func,
    controlType: PropTypes.number.isRequired,
    fieldconfig: PropTypes.shape({
      isReadOnly: PropTypes.oneOf([0, 1]),
      maxLength: PropTypes.number
    }),
    fieldLabel: PropTypes.string,
    fieldId: PropTypes.string
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

  render() {
    const props = {
      isCommonForm: this.props.isCommonForm,
      entityId: this.props.entityId,
      entityTypeId: this.props.entityTypeId,
      isTable: this.props.isTable,
      mode: ['ADD', 'EDIT'][this.props.usage],
      value: this.props.value,
      value_name: this.props.value_name,
      fieldId: this.props.fieldId,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      quoteHandler: this.props.quoteHandler,
      ref: instRef => { this.instRef = instRef; },
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
