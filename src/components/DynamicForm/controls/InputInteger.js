import React from 'react';
import { createNormalInput } from './utils';
import InputNumberRange from './InputNumberRange';
import { addSeparator } from '../../../utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputInteger = createNormalInput('text', {
  filter: inputValue => {
    let val = inputValue.replace(/[^\d]/g, '');
    if (/^0+$/.test(val)) return 0;
    if (!val) return '';
    return parseInt(val.replace(/^0+/, ''), 10);
  },
  filterOnBlur: inputValue => {
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
