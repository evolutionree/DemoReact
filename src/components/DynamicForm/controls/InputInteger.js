import React from 'react';
import { createNormalInput } from './utils';
import InputNumberRange from './InputNumberRange';
import { addSeparator } from '../../../utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputInteger = createNormalInput('text', {
  filter: inputValue => {
    let val = inputValue.replace(/[^0-9-]+/, '');
    val = val.substring(0, 1) + val.substring(1).replace(/-/g, '');

    if (/^0+$/.test(val)) return 0;
    if (!val) return '';

    if (val === '-') {
      return '-';
    } else if (val.substring(0, 1) === '-') {
      val = parseInt(val.substring(1).replace(/^0+/, ''), 10);
      return -val;
    } else {
      return parseInt(val.replace(/^0+/, ''), 10);
    }
  },
  filterOnBlur: inputValue => {
    if (inputValue === '-') {
      return '';
    }
    return parseInt(inputValue, 10);
  }
});

InputInteger.View = (props) => {
  const { value, separator } = props;
  if (value && separator) {
    const text = addSeparator(value);
    return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</div>;
  } else {
    return <DefaultTextView {...props} />;
  }
};

InputInteger.AdvanceSearch = InputNumberRange;

export default InputInteger;
