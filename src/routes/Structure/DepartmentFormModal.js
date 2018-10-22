import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import _ from 'lodash';
import DepartmentSelect from '../../components/DepartmentSelect';
import ensureOpenNewModal from './ensureOpenNewModal';

const FormItem = Form.Item;
const Option = Select.Option;

function DepartmentFormModal({
  form: {
    getFieldDecorator,
    validateFields,
    getFieldValue
  },
  showModals,
  currentDept,
  create,
  update,
  cancel
}) {
  function handleCancel() {
    cancel();
  }
  function handleOk() {
    validateFields((err, values) => {
      if (err) return;
      const data = {
        ...values
      };
      if (isEdit) {
        data.deptid = currentDept.deptid;
        update(data);
      } else {
        create(data);
      }
    });
  }
  const isEdit = /editDept/.test(showModals);
  const designateFilterNodes = (isEdit && currentDept) ? [currentDept.deptname] : [];
  return (
    <Modal
      title={isEdit ? '编辑部门' : '新增部门'}
      visible={/addDept|editDept/.test(showModals)}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <FormItem label="部门名称">
        {getFieldDecorator('deptname', {
          initialValue: '',
          rules: [{ required: true, message: '请输入部门名称' }]
        })(
          <Input placeholder="部门名称" maxLength={50} />
        )}
      </FormItem>
      <FormItem label="上级部门">
        {getFieldDecorator('pdeptid', {
          rules: [
            { required: true, message: '请选择上级部门' },
            { validator: (rule, val, callback) => {
              if (isEdit && val === currentDept.deptid) {
                callback('不能选择当前部门');
              } else {
                callback();
              }
            } }
          ]
        })(
          <DepartmentSelect disabled={(isEdit && currentDept) ? currentDept.nodepath === 0 : false} designateFilterNodes={designateFilterNodes} placeholder="上级部门" width="100%" />
        )}
      </FormItem>
      {/*<FormItem label="团队级别">*/}
        {/*{getFieldDecorator('oglevel', {*/}
          {/*// initialValue: ''*/}
          {/*rules: [{ required: true, message: '请选择团队级别' }]*/}
        {/*})(*/}
          {/*<Select placeholder="团队级别">*/}
            {/*<Option value="0">顶级(如集团)</Option>*/}
            {/*<Option value="1">分公司</Option>*/}
            {/*<Option value="2">事业群</Option>*/}
            {/*<Option value="3">3事业部</Option>*/}
            {/*<Option value="4">分管区域</Option>*/}
            {/*<Option value="5">部门</Option>*/}
          {/*</Select>*/}
        {/*)}*/}
      {/*</FormItem>*/}
    </Modal>
  );
}

export default connect(
  state => {
    const { queries, departments, showModals } = state.structure;
    const currentDept = _.find(departments, ['deptid', queries.deptId]);
    const visible = /addDept|editDept/.test(showModals);
    return {
      ...state.structure,
      currentDept,
      visible
    };
  },
  dispatch => {
    return {
      create: data => {
        dispatch({ type: 'structure/createDepartment', payload: data });
      },
      update: data => {
        dispatch({ type: 'structure/updateDepartment', payload: data });
      },
      cancel: () => {
        dispatch({ type: 'structure/showModals', payload: '' });
      }
    };
  }
)(ensureOpenNewModal(Form.create({
  mapPropsToFields: ({ currentDept, showModals }) => {
    if (!currentDept) return {};
    let fields;
    const isEdit = /editDept/.test(showModals);
    if (isEdit) {
      fields = {
        deptname_lang: currentDept.deptname_lang,
        pdeptid: currentDept.ancestor
      };
    } else {
      fields = {
        deptname_lang: '',
        pdeptid: currentDept.deptid
      };
    }
    return _.mapValues(fields, value => ({ value }));
  }
})(DepartmentFormModal)));

