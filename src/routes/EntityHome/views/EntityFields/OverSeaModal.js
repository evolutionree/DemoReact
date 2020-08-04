import React, { Component } from 'react';
import { Modal, Select, Button, Icon, message } from 'antd';

const options = [
    { id: 'id3a', label: '3A编码' },
    { id: 'companyname', label: '企业名称' },
    { id: 'tradingname', label: '贸易名称' },
    { id: 'aliasname', label: '别名' },
    { id: 'countrycode', label: '国家代码' },
    { id: 'country', label: '国家' },
    { id: 'stateprovince', label: '省或州' },
    { id: 'city', label: '城市' },
    { id: 'region', label: '区域' },
    { id: 'street', label: '街道' },
    { id: 'postcode', label: '邮政编码' },
    { id: 'website', label: '网站' },
    { id: 'email', label: '邮箱' },
    { id: 'telephone', label: '电话' },
    { id: 'status', label: '状态' },
    { id: 'listed', label: '是否上市' },
    { id: 'typeofentity', label: '企业类型' },
    { id: 'dateofincorporation', label: '公司成立日期' },
    { id: 'saleslastyear', label: '销售年度' },
    { id: 'lastyear', label: '最后一年' }
];

class OverSeaModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      options1: [],
      overseaBackfill: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const { fields } = nextProps;
      const recnameField = fields.find(o => o.fieldname === 'recname');
      const { overseaBackfill = [] } = recnameField ? recnameField.fieldconfig : {};
      const options1 = fields.filter(f => f.controltype === 1 || f.controltype === 5).map(o => ({ id: o.fieldname, label: o.fieldlabel || o.displayname }));
      this.setState({ overseaBackfill, options1, recnameField });
    }
  }

  handleOk = () => {
    const { recnameField, overseaBackfill } = this.state;
    const { 
      controltype: controlType, recstatus: recStatus, fieldname: fieldName, fieldtype: fieldType, entityid: entityId, fieldid: fieldId,
      fieldlabel_lang, displayname_lang, fieldconfig
    } = recnameField;
    const newField = {
      controlType,
      fieldlabel_lang,
      displayname_lang,
      recStatus,
      fieldName,
      fieldType,
      fieldId,
      entityId,
      fieldConfig: JSON.stringify({ ...fieldconfig, overseaBackfill })
    };
    const { onOk, onCancel } = this.props;
    if (onOk) onOk(newField, onCancel);
  }

  addItem = () => {
    const { overseaBackfill, options1 } = this.state;
    const result = [...overseaBackfill];
    const _list = result.map(s => s.split(':')[1]);
    const restArr = options1.filter(o => (!_list.includes(o.id)));
    if (!restArr.length) return message.error('已无可选文本字段');
    const key = options[0].id;
    const name = restArr[0].id;
    const newStr = `${key}:${name}`;
    result.push(newStr);
    this.setState({ overseaBackfill: result });
  }

  delItem = (index) => {
    const { overseaBackfill } = this.state;
    const result = [...overseaBackfill];
    delete result[index];
    this.setState({ overseaBackfill: result.filter(v => !!v) });
  }

  handleCahgne = (index, action, newStr) => {
    const { overseaBackfill } = this.state;
    const result = [...overseaBackfill];
    const itemArr = result[index].split(':');
    const left = action === 'left' ? newStr : itemArr[0];
    const right = action === 'right' ? newStr : itemArr[1];
    result[index] = `${left}:${right}`;
    this.setState({ overseaBackfill: result });
  }

  render() {
    const { visible, onCancel } = this.props;
    const { modalPending, overseaBackfill, options1 } = this.state;
    return (
      <Modal
        title={'设置国外回填映射字段'}
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        onCancel={onCancel}
      >
        <div>
          {
            overseaBackfill.length ? overseaBackfill.map((item, idx) => {
              const valueArr = item.split(':');
              const leftValue = valueArr[0];
              const rightValue = valueArr[1];
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Select style={{ width: '40%' }} value={leftValue} onChange={this.handleCahgne.bind(this, idx, 'left')}>
                    {options.map(o => <Select.Option key={o.id} value={o.id}>{o.label}</Select.Option>)}
                  </Select>
                  <Icon type="swap" style={{ marginLeft: '1em', marginRight: '1em' }} />
                  <Select style={{ width: '40%' }} value={rightValue} onChange={this.handleCahgne.bind(this, idx, 'right')}>
                    {options1.map(o => <Select.Option key={o.id} value={o.id}>{o.label}</Select.Option>)}
                  </Select>
                  <Icon type="delete" style={{ marginLeft: '1em', cursor: 'pointer' }} onClick={() => this.delItem(idx)} />
                </div>
              );
            }) : null
          }
          <Button style={{ marginTop: '1em' }} onClick={this.addItem}>新增</Button>
        </div>
      </Modal>
    );
  }
}

export default OverSeaModal;
