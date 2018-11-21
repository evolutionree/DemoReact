import { createNormalInput } from './utils';

const InputText = createNormalInput('text', {
  filter: inputValue => {
    return inputValue.replace(/[^\d^\-]+/g, '');
  },
  props: {

  }
});

export default InputText;
