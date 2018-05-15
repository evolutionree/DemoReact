/**
 * Created by 0291 on 2018/5/11.
 */
import React from 'react';
import { Table, Checkbox, Input } from 'antd';

function InputGroupWrap({
                          value,
                          onChange
                        }) {

  const inputChange = (type, e) => {
    onChange && onChange(type, e.target.value);
  }
  return (
    <div>
      程序集<Input style={{ margin: '4px 0' }} value={value.assemblyname} onChange={inputChange.bind(this, 'assemblyname')} />
      类名<Input style={{ margin: '4px 0' }} value={value.classtypename} onChange={inputChange.bind(this, 'classtypename')} />
      方法名<Input style={{ margin: '4px 0' }} value={value.funcname} onChange={inputChange.bind(this, 'funcname')} />
    </div>
  );
}

export default InputGroupWrap;
