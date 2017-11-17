import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import DepartmentSelect from '../../components/DepartmentSelect';
import SelectNumber from '../../components/SelectNumber';
import ensureOpenNewModal from './ensureOpenNewModal';

const FormItem = Form.Item;
const Option = Select.Option;

function UserFormModal({
  form: {
    getFieldDecorator,
    validateFields
  },
  queries,
  showModals,
  currentItems,
  register,
  update,
  cancel
}) {
  function handleSubmit() {
    validateFields((err, val) => {
      if (err) return '';
      const values = { ...val };
      values.sex = values.usersex;
      values.tel = values.usertel;
      values.email = values.useremail;
      values.status = values.recstatus;
      values.usersex = undefined;
      values.usertel = undefined;
      values.useremail = undefined;
      values.recstatus = undefined;

      if (values.birthday) {
        values.birthday = values.birthday.format('YYYY-MM-DD');
      }
      if (values.joineddate) {
        values.joineddate = values.joineddate.format('YYYY-MM-DD');
      }

      if (isEdit) {
        const data = {
          ...currentItems[0],
          ...values
        };
        update(data);
      } else {
        register(values);
      }
    });
  }

  const isEdit = /editUser/.test(showModals);

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      visible={/editUser|addUser/.test(showModals)}
      onOk={handleSubmit}
      onCancel={cancel}
    >
      <Form>
        <FormItem label="帐号">
          {getFieldDecorator('accountname', {
            rules: [{ required: true, message: '请输入帐号' }]
          })(
            <Input placeholder="请输入帐号" maxLength={20} />
          )}
        </FormItem>
        <FormItem label="姓名">
          {getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入姓名' }]
          })(
            <Input placeholder="请输入姓名" maxLength={50} />
          )}
        </FormItem>
        <FormItem label="手机号码">
          {getFieldDecorator('userphone', {
            rules: [
              { required: true, message: '请输入手机号码' },
              { pattern: /^\d*$/, message: '请输入数字' }
            ]
          })(
            <Input placeholder="请输入手机号码" maxLength={11} />
          )}
        </FormItem>
        <FormItem label="性别">
          {getFieldDecorator('usersex', {
            initialValue: 0
          })(
            <SelectNumber>
              <Option value="0">男</Option>
              <Option value="1">女</Option>
            </SelectNumber>
          )}
        </FormItem>
        <FormItem label="团队组织" Readonly="true">
          {getFieldDecorator('deptid', {
            initialValue: queries.deptId,
            rules: [{ required: true, message: '请选择团队组织' }]
          })(
            <DepartmentSelect disabled={isEdit} />
          )}
        </FormItem>
        <FormItem label="入职日期">
          {getFieldDecorator('joineddate')(
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem label="生日">
          {getFieldDecorator('birthday', {
            initialValue: moment('1985-01-01', 'YYYY-MM-DD')
          })(
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem label="职位">
          {getFieldDecorator('userjob', {
            initialValue: ''
          })(
            <Input placeholder="请输入职位" maxLength={20} />
          )}
        </FormItem>
        <FormItem label="工号">
          {getFieldDecorator('workcode', {
            initialValue: ''
          })(
            <Input placeholder="请输入工号" maxLength={50} />
          )}
        </FormItem>
        <FormItem label="固话">
          {getFieldDecorator('usertel', {
            initialValue: ''
          })(
            <Input placeholder="请输入固话" />
          )}
        </FormItem>
        <FormItem label="邮箱">
          {getFieldDecorator('useremail', {
            initialValue: '',
            rules: [{ pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, message: '邮箱格式有误' }]
          })(
            <Input placeholder="请输入邮箱" />
          )}
        </FormItem>
        {/*登录限制 00无限制 01WEB 02MOB 10ADMIN 11WEB+ADMIN 12MOB+ADMIN*/}
        <FormItem label="登录限制">
          {getFieldDecorator('accesstype', {
            initialValue: '00',
            rules: [{ required: true, message: '请选择登录限制' }]
          })(
            <Select>
              <Option value="00">无限制</Option>
              <Option value="01">仅WEB端</Option>
              <Option value="02">仅手机端</Option>
              <Option value="10">仅管理后台</Option>
              <Option value="11">WEB端+管理后台</Option>
              <Option value="12">手机端+管理后台</Option>
              <Option value="13">手机端+WEB端</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="备注">
          {getFieldDecorator('remark', {
            initialValue: ''
          })(
            <Input placeholder="请输入备注" maxLength={100} />
          )}
        </FormItem>
        <FormItem label="状态" style={{ display: isEdit ? 'none' : 'block' }}>
          {getFieldDecorator('recstatus', {
            initialValue: 1
          })(
            <SelectNumber>
              <Option value="1">启用</Option>
              <Option value="0">停用</Option>
            </SelectNumber>
          )}
        </FormItem>
      </Form>
    </Modal>
  );
}

function mapStateToProps(state) {
  const { showModals } = state.structure;
  const visible = /editUser|addUser/.test(showModals);
  return {
    ...state.structure,
    visible
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  function bindAction(actionType, presetPayload) {
    return function bound(payload) {
      const finalPayload = presetPayload !== undefined ? presetPayload : payload;
      dispatch({ type: `structure/${actionType}`, payload: finalPayload });
    };
  }
  return {
    cancel: bindAction('showModals', ''),
    register: bindAction('registerUser'),
    update: bindAction('updateUser')
  };
}
function mapPropsToFields({ showModals, currentItems }) {
  const isEdit = /editUser/.test(showModals);
  if (!isEdit) return {};
  return _.mapValues(currentItems[0], (val, key) => {
    if (key === 'birthday' && val) {
      return { value: moment(val, 'YYYY-MM-DD hh:mm:ss') };
    }
    if (key === 'joineddate' && val) {
      return { value: moment(val, 'YYYY-MM-DD hh:mm:ss') };
    }
    return { value: val };
  });
}
const connectState = connect(mapStateToProps, mapDispatchToProps);
const connectForm = Form.create({ mapPropsToFields });

export default connectState(ensureOpenNewModal(connectForm(UserFormModal)));
