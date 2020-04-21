import React, { Component } from 'react';
import { createNormalInput } from './utils';
import InputCustomerRecName from './InputCustomerRecName';
import InputRecManage from './InputRecManage';
import { queryFields } from '../../../services/entity';

const customerEntityId = 'f9db9d79-e94b-4678-a5cc-aa6e281c1246'; // 客户实体id
const xiansuoNameFieldId = 'e61403f1-4511-49b9-a1c1-52a8cea855d1'; //线索名称的fileldId

const Text = createNormalInput('text', {
  props: {
    maxLength: '200'
  }
});

class InputRecName extends Component {
  state = {
    isCustomer: false
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  componentDidMount() {
    const { entityId, fieldId } = this.props;
    if (entityId === customerEntityId) {
      try {
        queryFields(entityId)
          .then(res => {
            if (res.data) {
              const { entityfieldpros } = res.data;
              if (Array.isArray(entityfieldpros) && entityfieldpros.length) {
                const recnameItem = entityfieldpros.find(item => item.fieldname === 'recname');
                const isCustomer = recnameItem.fieldid === fieldId;
                this.setState({ isCustomer });
              }
            }
          });
      } catch (e) {
        console.error(e);
      }
    }
  }

  render() {
    const { isCustomer } = this.state;
    //客户新增 与 其他模块的新增 有差异   客户新增的时候  客户名称键入后需要请求接口 查询重复引用

    if (isCustomer) return <InputRecManage {...this.props} />;

    return (this.props.fieldId === xiansuoNameFieldId) ?
      <InputCustomerRecName {...this.props} /> : React.createElement(Text, this.props);
  }
}


export default InputRecName;
