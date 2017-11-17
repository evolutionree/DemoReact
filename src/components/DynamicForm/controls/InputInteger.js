import { createNormalInput } from './utils';
import InputNumberRange from './InputNumberRange';

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

InputInteger.AdvanceSearch = InputNumberRange;

export default InputInteger;
