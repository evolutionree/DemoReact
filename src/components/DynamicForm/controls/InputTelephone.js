import { createNormalInput } from './utils';

const InputText = createNormalInput('text', {
  filter: inputValue => {
    return inputValue.replace(/[^\d^]+/g, '');
  },
  props: {
    maxLength: '11'
  }
});

export default InputText;
