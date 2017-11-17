import React from 'react';
import { createNormalInput } from './utils';

function RelObject({
  value,
  value_name
}) {
  return (
    <div>
      {value_name}
    </div>
  );
}

RelObject.AdvanceSearch = createNormalInput('text');

export default RelObject;
