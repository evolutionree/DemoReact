/**
 * Created by 0291 on 2018/5/11.
 */
import React from 'react';
import { Table, Checkbox, Radio } from 'antd';
const RadioGroup = Radio.Group;

function RadioGroupWrap({
                          value,
                          onChange
                    }) {
  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  const onRadioChange = (e) => {
    onChange && onChange(e.target.value);
  }

  return (
    <RadioGroup onChange={onRadioChange} value={value}>
      <Radio style={radioStyle} value={-1}>无</Radio>
      <Radio style={radioStyle} value={0}>数据库函数</Radio>
      <Radio style={radioStyle} value={1}>代码服务</Radio>
    </RadioGroup>

  );
}

export default RadioGroupWrap;
