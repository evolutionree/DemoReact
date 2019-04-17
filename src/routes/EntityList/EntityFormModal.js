import React, { Component, PropTypes } from 'react';
import { Modal, Form, Input, Select, Radio } from 'antd';
import * as _ from 'lodash';
import connectBizParam from '../../components/connectBizParam';
import SelectAppIcon from '../../components/SelectAppIcon';
import AjaxSelect from './AjaxRelObjSelect';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';

const Option = Select.Option;
const FormItem = Form.Item;

let RelateEntitySelect = (props) => {
  const bizParam = props.bizParam || [];
  const filter = entity => {
    if (props.showSimpleEntity) {
      // return entity.modeltype === 0 || (entity.modeltype === 2 && entity.relaudit === 0);
      return entity.modeltype === 0 || entity.modeltype === 2;
    } else {
      return entity.modeltype === 0;
    }
  };

  const handleSelectChange = (value) => {
    props.onChange && props.onChange(value);
  }

  return (
    <Select {...props} onChange={handleSelectChange}>
      <Option value={''}>无</Option>
      {bizParam.filter(filter).map(item => (
        <Option key={item.entityid}>{getIntlText('entityname', item)}</Option>
      ))}
    </Select>
  );
};
RelateEntitySelect = connectBizParam('allEntities', RelateEntitySelect);

class EntityFormModal extends Component {
  static propTypes = {
    showModals: PropTypes.string,
    editingRecord: PropTypes.object,
    entityTypes: PropTypes.arrayOf(React.PropTypes.object).isRequired,
    form: PropTypes.object,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !/edit|add/.test(this.props.showModals)
      && /edit|add/.test(nextProps.showModals);

    if (isOpening) {
      const { showModals, editingRecord, form } = nextProps;
      const { servicesjson } = editingRecord;
      const { entityConfig } = servicesjson;
      const setreference = entityConfig ? (JSON.parse(entityConfig).DisableRef + '') : '0';

      if (!/edit/.test(showModals)) {
        form.resetFields();
      } else {
        form.setFields(_.mapValues({
          icons: '',
          ...editingRecord,
          setreference,
          typeid: editingRecord.modeltype + ''
        }, val => ({ value: val })));
      }
    }
  }

  handleOk = () => {
    const isEdit = /edit/.test(this.props.showModals);
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const { setreference } = values;
      let data;

      if (isEdit) {
        data = {
          icons: '00000000-0000-0000-0000-100000000001', // TODO 服务端允许icons为null
          ...values,
          entityid: this.props.editingRecord.entityid,
          typeid: parseInt(values.typeid, 10),
          servicesjson: {
            entityConfig: JSON.stringify({ DisableRef: setreference })
          }
        };
        if (!data.relentityid) {
          data.relentityid = '00000000-0000-0000-0000-000000000000';
        }
      } else {
        data = {
          icons: '00000000-0000-0000-0000-100000000001', // TODO 服务端允许icons为null
          ...values,
          typeid: parseInt(values.typeid, 10),
          styles: '',
          servicesjson: {
            entityConfig: JSON.stringify({ DisableRef: setreference === '1' ? setreference : '0' })
          }
        };
      }

      this.props.onOk(data);
    });
  };

  RelateEntitySelectChange = () => {
    this.props.form.setFieldsValue({
      relfieldid: ''
    });
  }

  entitynameRequireValidator = (rule, value, callback) => {
    let langlist = JSON.parse(window.localStorage.getItem('langlist'));
    langlist instanceof Array && langlist.map(item => {
      if (!(value && value[item.key])) {
        callback(item.dispaly + '必填');
      }
    });
    callback();
  }

  render() {
    const {
      showModals,
      entityTypes,
      editingRecord,
      form: {
        getFieldDecorator,
        getFieldValue
      },
      onCancel,
      modalPending
    } = this.props;

    const typeid = getFieldValue('typeid');
    const relentityid = getFieldValue('relentityid');
    const isEdit = /edit/.test(showModals);
    const entityId = editingRecord && editingRecord.entityid;

    return (
      <Modal title={isEdit ? '编辑实体' : '新增实体'}
        visible={/edit|add/.test(showModals)}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        onCancel={onCancel}>
        <Form horizontal>
          <FormItem label="实体名称">
            {getFieldDecorator('entityname_lang', {//<Input placeholder="实体名称" maxLength={50} />   rules: [{ required: true, message: '请输入实体名称' }],
              rules: [
                { required: true, message: '请输入实体名称' },
                { validator: this.entitynameRequireValidator }
              ]
            })(
              <IntlInput maxLength="50" />
            )}
          </FormItem>
          <FormItem label="实体表名">
            {getFieldDecorator('entitytable', {
              initialValue: '',
              normalize: (value) => (value ? value.trim() : value),
              rules: [
                { required: true, message: '请输入表名' },
                { pattern: /^[_a-z]*$/, message: '只能输入小写字母或下划线' }
              ]
            })(
              <Input placeholder="表名，例如 crm_plu_customer" disabled={isEdit} maxLength="50" />
            )}
          </FormItem>
          <FormItem label="实体类型">
            {getFieldDecorator('typeid', {
              initialValue: '0',
              rules: [{ required: true, message: '请选择实体类型' }]
            })(
              <Select disabled={isEdit}>
                {entityTypes.map(
                  ({ id, label }) => <Option value={id} key={id}>{label}</Option>
                )}
              </Select>
            )}
          </FormItem>
          {
            entityId === 'f9db9d79-e94b-4678-a5cc-aa6e281c1246' ?
              <div>
                <FormItem label="引用设置">
                  {getFieldDecorator('setreference', {
                    normalize: (value) => (value === '1' ? value : '0'),
                    initialValue: '0',
                    rules: [{ required: true, message: '请选择实体类型' }]
                  })(
                    <Select>
                      <Option value={'0'}>启用引用</Option>
                      <Option value={'1'}>关闭引用</Option>
                    </Select>
                  )}
                </FormItem>
                {/* <FormItem label="新增提示">
                {getFieldDecorator('typeid', {
                  initialValue: '0',
                  rules: [{ required: true, message: '请选择实体类型' }]
                })(
                  <Select disabled={isEdit}>
                    {entityTypes.map(
                      ({ id, label }) => <Option value={id} key={id}>{label}</Option>
                    )}
                  </Select>
                )}
              </FormItem> */}
              </div> : null
          }
          {/* 简单实体可选，动态嵌套必选，独立没得选 */}
          {typeid !== '0' ? <FormItem label="关联实体">
            {getFieldDecorator('relentityid', {
              initialValue: '',
              rules: [{ required: typeid === '1' || typeid === '3', message: '请选择关联实体' }]
            })(
              <RelateEntitySelect disabled={isEdit} showSimpleEntity={typeid === '1' || typeid === '2'} onChange={this.RelateEntitySelectChange} />
            )}
          </FormItem> : ''}
          {/* 动态实体必填 */}
          {(typeid === '3' && relentityid && !isEdit) ? <FormItem label="关联对象显示字段">
            {getFieldDecorator('relfieldid', {
              initialValue: '',
              rules: [{ required: (typeid === '3' && relentityid), message: '前输入关联对象显示字段' }]
            })(
              <AjaxSelect entityId={relentityid} />
            )}
          </FormItem> : ''}
          {/* 关联审批只有实体类型为“简单实体”或动态实体时才能设置 */}
          {typeid !== '0' && typeid !== '1' ? <FormItem label="关联审批">
            {getFieldDecorator('relaudit', {
              initialValue: 0
            })(
              <Radio.Group disabled={isEdit}>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem> : ''}
          <FormItem label="实体描述">
            {getFieldDecorator('remark', {
              initialValue: ''
            })(
              <Input placeholder="实体描述" type="textarea" maxLength="200" />
            )}
          </FormItem>
          {typeid !== '1' && <FormItem label="请选择图标">
            {getFieldDecorator('icons', {
              initialValue: '',
              rules: [{ required: true, message: '请选择图标' }]
            })(
              <SelectAppIcon usage={typeid} />
            )}
          </FormItem>}
        </Form>
      </Modal>
    );
  }
}


export default Form.create()(EntityFormModal);
