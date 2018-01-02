import React from 'react';
import { createNormalInput } from './utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputText = createNormalInput('text');

InputText.View = (props) => {
  const { value, encrypted } = props;
  if (value && encrypted) {
    return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>********</div>;
  } else {
    return <DefaultTextView {...props} />;
  }
};

export default InputText;
