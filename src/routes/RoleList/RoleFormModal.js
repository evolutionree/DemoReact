import React, { PropTypes, Component } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;

class RoleFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !/edit|add/.test(this.props.showModals) && /edit|add/.test(nextProps.showModals);
    if (isOpening) {
      const { currentRecords, showModals, form } = nextProps;
      form.resetFields();

      const isEdit = /edit/.test(showModals);
      if (!isEdit) {

      } else {
        const record = currentRecords[0];
        const tmp = _.pick(record, ['rolename', 'rolegroupid', 'roleremark']);
        form.setFieldsValue(tmp);
      }
    }
  }

  render() {
    function handleSubmit(data) {
      form.validateFields((err, values) => {
        if (err) return;
        onOk({
          roleid: isEdit ? editingRecord.roleid : undefined,
          ...values
        });
      });
    }
    function handleCancel() {
      form.resetFields();
      onCancel();
    }

    const {
      form,
      showModals,
      currentRecords,
      savePending,
      roleGroups,
      onOk,
      onCancel
    } = this.props;

    const isEdit = /edit/.test(showModals);
    const editingRecord = currentRecords[0];
    const { getFieldDecorator: decorate } = form;
    const roleTypesOption = roleGroups.slice(1).filter(role => {
      return role.grouptype !== 0; //过滤掉系统默认角色
    }).map(item => (
      <Option key={item.rolegroupid} value={item.rolegroupid}>{item.rolegroupname}</Option>
    ));

    return (
      <Modal title={isEdit ? '编辑角色' : '新建角色'}
             visible={/edit|add/.test(showModals)}
             onOk={handleSubmit}
             onCancel={handleCancel}
             confirmLoading={savePending}>
        <Form>
          <FormItem label="角色名称">
            {decorate('rolename', {
              initialValue: '',
              rules: [{ required: true, message: '请输入角色名称' }]
            })(
              <IntlInput placeholder="请输入角色名称" maxLength={50} />
            )}
          </FormItem>
          <FormItem label="角色分类">
            {decorate('rolegroupid', {
              initialValue: '',
              rules: [{ required: true, message: '请选择角色分类' }]
            })(
              <Select>
                {roleTypesOption}
              </Select>
            )}
          </FormItem>
          <FormItem label="角色描述">
            {decorate('roleremark',{
              initialValue: ''
            })(
              <Input type="textarea" maxLength={200} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(RoleFormModal);
