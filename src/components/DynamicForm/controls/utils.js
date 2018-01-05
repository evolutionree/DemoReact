import React, { Component, PropTypes } from 'react';
import { Input, message } from 'antd';
import classnames from 'classnames';

function addSeparator(val) {
  if (!val) return val;

  let arr = (val + '').split('.');
  let intStr = arr[0].replace(/^0+/g, '');
  intStr = intStr || '0';
  let intArr = intStr.split('').reverse();
  let intFormatted = '';
  intArr.forEach(function(n, index) {
      if (index % 3 === 0 && index !== 0) {
          intFormatted = ',' + intFormatted;
      }
      intFormatted = n + intFormatted;
  });

  if (arr[1]) {
      return intFormatted + '.' + arr[1];
  } else {
      return intFormatted;
  }
}

export function createNormalInput(type, options) {
  return class InputComponent extends Component {
    inputRef = null;
    hasFocused = false;
    constructor(props) {
      super(props);
      this.state = {
        innerVal: props.value,
        isFocused: false
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
      this.setState({ isFocused: false });
    };

    onInputFocus = event => {
      this.setState({ isFocused: true });
      if (this.props.mode === 'EDIT' && !this.hasFocused && this.props.encrypted && event.target.value) {
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

      let val = this.state.innerVal;
      if (this.props.separator) {
        const isFocused = this.inputRef && (this.inputRef.refs.input === document.activeElement);
        if (!this.state.isFocused) {
          val = addSeparator(val);
        }
      }

      return (
        <div className={classnames({ 'input-table-view': isTable })}>
          <Input
            ref={ref => this.inputRef = ref}
            type={inputType}
            value={val}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            disabled={isReadOnly === 1}
            maxLength={maxLength}
            autoComplete="off"
            {...optProps}
            onFocus={this.onInputFocus}
          />
        </div>
      );
    }
  };
}
