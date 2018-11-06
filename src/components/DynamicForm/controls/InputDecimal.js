import React from 'react';
import { createNormalInput } from './utils';
import InputNumberRange from './InputNumberRange';
import { addSeparator } from '../../../utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputDecimal = createNormalInput('text', {
  filter: (inputValue, props) => {
    let val = inputValue.replace(/[^-?\d.。]/g, '');
    val = val.substring(0, 1) + val.substring(1).replace(/-/g, '');

    let number = val;
    if (val.substring(0, 1) === '-') {
      number = val.substring(1);
    }
    if (/^0+$/.test(number)) return '0';
    number = number.replace(/^\./, '0.').replace(/^。/, '0.')
      .replace(/^0+\./, '0.').replace(/^0+。/, '0.')
      .replace(/^0+(\d)/, '$1');

    if (val.substring(0, 1) === '-') {
      return '-' + number;
    } else {
      return number;
    }
  },
  filterOnBlur: (inputValue, props) => {
    const { decimalsLength } = props;
    if (inputValue) {
      const split = inputValue.split('.');
      let int = split[0];

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
