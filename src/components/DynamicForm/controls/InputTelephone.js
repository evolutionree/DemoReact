import { createNormalInput } from './utils';

const InputText = createNormalInput('text', {
  props: {
    maxLength: '20'
  }
});

export default InputText;
