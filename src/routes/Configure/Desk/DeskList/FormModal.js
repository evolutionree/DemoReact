/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';

const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;

class FormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editingRecord: PropTypes.object,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entities: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord
        });
      } else {
        form.resetFields();
      }
    }
  }


  onOk = () => {
    const { form, editingRecord } = this.props;
    form.validateFields((err, values) => {
      if (err) return;

      // this.props.confirm({
      //   resetflag: 1,
      //   ...values,
      //   expireflag: undefined,
      //   flowid: editingRecord ? editingRecord.flowid : undefined
      // });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑工作台' : '新增工作台'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="工作台名称">
            {getFieldDecorator('name', {
              initialValue: '',
              rules: [{ required: true, message: '请输入工作台名称' }]
            })(
              <Input placeholder="请输入工作台名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="说明">
            {getFieldDecorator('remark', {
              rules: [{ required: true, message: '请输入说明' }]
            })(
              <TextArea placeholder="请输入说明" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending } = state.desk;
    // const data = [{
    //   entityid: '72d518b4-12f1-4ed7-a4ee-e9be658aa567',
    //   jilian: true,
    //   same: true
    // }, {
    //   entityid: '1',
    //   jilian: true,
    //   same: true
    // }];
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'desk/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'desk/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
