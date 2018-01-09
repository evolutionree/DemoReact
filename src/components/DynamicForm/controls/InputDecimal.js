import React from 'react';
import { createNormalInput } from './utils';
import InputNumberRange from './InputNumberRange';
import { addSeparator } from '../../../utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputDecimal = createNormalInput('text', {
  filter: (inputValue, props) => {
    let val = inputValue.replace(/[^\d.]/g, '');
    if (/^0+$/.test(val)) return '0';
    val = val.replace(/^\./, '0.')
      .replace(/^0+\./, '0.')
      .replace(/^0+(\d)/, '$1');
    return val;
  },
  filterOnBlur: (inputValue, props) => {
    const { decimalsLength } = props;
    if (inputValue) {
      const split = inputValue.split('.');
      const int = split[0];
      if (split.length === 1) {
        return int;
      } else if (split.length >= 2 && !split[1]) {
        return int;
      } else if (split.length >= 2 && split[1]) {
        const decimals = decimalsLength !== undefined
          ? split[1].slice(0, decimalsLength)
          : split[1];
        return parseFloat([int, decimals].join('.'));
      }
    } else {
      return parseFloat(inputValue);
    }
  }
});

InputDecimal.View = (props) => {
  const { value, separator } = props;
  if (value && separator) {
    const text = addSeparator(value);
    return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</div>;
  } else {
    return <DefaultTextView {...props} />;
  }
};

InputDecimal.AdvanceSearch = InputNumberRange;

export default InputDecimal;
