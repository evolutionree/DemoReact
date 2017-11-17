import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import _ from 'lodash';
import DepartmentSelect from '../../components/DepartmentSelect';

const FormItem = Form.Item;
const Option = Select.Option;

class DepartmentFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    isEdit: PropTypes.bool,
    currentDept: PropTypes.object,
    create: PropTypes.func,
    update: PropTypes.func,
    cancel: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      modalKey: new Date().getTime() + ''
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        modalKey: new Date().getTime() + ''
      }, () => {
        const { currentDept, isEdit, form } = nextProps;
        if (!currentDept) return;
        if (isEdit) {
          form.setFieldsValue({
            deptname: currentDept.deptname,
            pdeptid: currentDept.ancestor
          });
        } else {
          form.setFieldsValue({
            deptname: '',
            pdeptid: currentDept.deptid
          });
        }
      });
    }
  }
  handleOk = () => {
    const { form, currentDept, isEdit, create, update } = this.props;

    form.validateFields((err, values) => {
      if (err) return;
      const data = { ...values };
      if (isEdit) {
        data.deptid = currentDept.deptid;
        update(data);
      } else {
        create(data);
      }
    });
  };
  render() {
    const { form, cancel, visible, isEdit } = this.props;
    return (
      <Modal
        title={isEdit ? '编辑部门' : '新增部门'}
        visible={visible}
        onCancel={cancel}
        onOk={this.handleOk}
        key={this.state.modalKey}
      >
        <FormItem label="部门名称">
          {form.getFieldDecorator('deptname', {
            initialValue: '',
            rules: [{ required: true, message: '请输入部门名称' }]
          })(
            <Input placeholder="部门名称" maxLength={50} />
          )}
        </FormItem>
        <FormItem label="上级部门">
          {form.getFieldDecorator('pdeptid', {
            rules: [{ required: true, message: '请选择上级部门' }]
          })(
            <DepartmentSelect placeholder="上级部门" width="100%" />
          )}
        </FormItem>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { queries, departments, showModals } = state.structure;
    const currentDept = _.find(departments, ['deptid', queries.deptId]);
    const visible = /addDept|editDept/.test(showModals);
    const isEdit = /editDept/.test(showModals);
    return {
      currentDept,
      visible,
      isEdit
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
)(Form.create()(DepartmentFormModal));

