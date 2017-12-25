import React, { Component, PropTypes } from 'react';
import { Input, message } from 'antd';
import classnames from 'classnames';

export function createNormalInput(type, options) {
  return class InputComponent extends Component {
    inputRef = null;
    hasFocused = false;
    constructor(props) {
      super(props);
      this.state = {
        innerVal: props.value
      };
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.value !== this.props.value) {
        this.setState({ innerVal: nextProps.value });
      }
    }

    setValue = val => {
      this.props.onChange(val, true);
    };

    onInputChange = event => {
      let val = event.target.value;
      if (val && options && options.filter) {
        val = options.filter(val, this.props);
      }
      this.setState({ innerVal: val });
    };

    onInputBlur = event => {
      let val = event.target.value;
      if (val && options && options.filterOnBlur) {
        val = options.filterOnBlur(val, this.props);
      }
      this.props.onChange(val);
    };

    onInputFocus = event => {
      if (this.props.mode === 'EDIT' && !this.hasFocused && event.target.value) {
        this.hasFocused = true;
        this.props.onChange('');
      }
    };

    render() {
      const { value, isReadOnly, maxLength, isTable, encrypted } = this.props;

      let optProps = {};
      if (options && options.props) {
        optProps = { ...options.props };
        if (type === 'textarea' && isTable) {
          optProps.autosize = { minRows: 2, maxRows: 5 };
        }
      }

      let inputType = type;
      if (this.state.innerVal && encrypted) {
        inputType = 'password';
      }

      return (
        <div className={classnames({ 'input-table-view': isTable })}>
          <Input
            ref={ref => this.inputRef = ref}
            type={inputType}
            value={this.state.innerVal}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            disabled={isReadOnly === 1}
            maxLength={maxLength}
            autocomplete="off"
            {...optProps}
            onFocus={this.onInputFocus}
          />
        </div>
      );
    }
  };
}
