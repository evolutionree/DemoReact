import { createNormalInput } from './utils';

const InputText = createNormalInput('text', {
  props: {
    maxLength: '50'
  }
});

export default InputText;
