import React, { Component, PropTypes } from 'react';
import DepartmentSelect from '../../../components/DepartmentSelect';

class SelectDepartment extends Component {
  static propTypes = {};
  static defaultProps = {};

  setValue = (...args) => {
    // this.props.onChange(val);
    const inst = this.getDepartmentComponentInstance();
    inst.setValue(...args);
  };

  setValueByName = (...args) => {
    const inst = this.getDepartmentComponentInstance();
    inst.setValueByName(...args);
  };
  getDepartmentComponentInstance = () => {
    let inst = this.componentInst;
    while (inst && inst.getWrappedInstance) {
      inst = inst.getWrappedInstance();
    }
    return inst;
  };
  render() {
    const {
      value,
      onChange,
      multiple,
      isReadOnly,
      width,
      onFocus,
      designateNodes,
      designateFilterNodes
    } = this.props;
    return (
      <div style={{ height: 32, overflow: 'hidden' }}>
        <DepartmentSelect
          value={value ? value.split(',') : []}
          onChange={val => {
            if (multiple) {
              onChange((val && val.length) ? val.join(',') : undefined);
            } else {
              onChange(val);
            }
          }}
          multiple={multiple === 1}
          disabled={isReadOnly === 1}
          designateNodes={designateNodes}
          designateFilterNodes={designateFilterNodes}
          onFocus={onFocus}
          ref={inst => this.componentInst = inst}
          width={width || '100%'}
        />
      </div>
    );
  }
}

export default SelectDepartment;
