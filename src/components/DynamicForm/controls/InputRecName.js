import React, { Component } from 'react';
import { createNormalInput } from './utils';
import InputCustomerRecName from './InputCustomerRecName';
import { queryFields } from '../../../services/entity';
import InputRecManage from './InputRecManage';


const custcommonEntityId = 'ac051b46-7a20-4848-9072-3b108f1de9b0'; // 客户基础资料实体id
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
    if (entityId === customerEntityId || entityId === custcommonEntityId) {
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
    const { fieldId, fieldname } = this.props
    const { isCustomer } = this.state;

    const isXianSuo = fieldId === xiansuoNameFieldId
    const isOriginal = isCustomer || isXianSuo
    if (isCustomer) return <InputRecManage {...this.props} />;

    //客户新增 与 其他模块的新增 有差异   客户新增的时候  客户名称键入后需要请求接口 查询重复引用
    return (isOriginal || fieldname === 'recname') ?
      <InputCustomerRecName {...this.props} isOriginal={isOriginal} /> : React.createElement(Text, this.props);
  }
}


export default InputRecName;
