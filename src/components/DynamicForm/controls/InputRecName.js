import React, { Component } from 'react';
import { createNormalInput } from './utils';
import InputCustomerRecName from './InputCustomerRecName';

const custNameFieldId = '046ed3f6-8c81-41ab-baff-339c339eddf5'; //客户名称的fileldId
const xiansuoNameFieldId = 'e61403f1-4511-49b9-a1c1-52a8cea855d1'; //线索名称的fileldId

const Text = createNormalInput('text', {
  props: {
    maxLength: 200
  }
});

class InputRecName extends Component {
  setValue = val => {
    this.props.onChange(val, true);
  };

  render() {
    //客户新增 与 其他模块的新增 有差异   客户新增的时候  客户名称键入后需要请求接口 查询重复引用
    return (this.props.fieldId === custNameFieldId || this.props.fieldId === xiansuoNameFieldId) ?
      <InputCustomerRecName {...this.props} /> : React.createElement(Text, this.props);
  }
}


export default InputRecName;
