/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';

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
      this.props.confirm({
        ...editingRecord,
        ...values
      });
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
            {getFieldDecorator('desktopname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入工作台名称' }]
            })(
              <Input placeholder="请输入工作台名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="说明">
            {getFieldDecorator('description', {
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
    const { showModals, currItems, modalPending } = state.deskconfig;
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'deskconfig/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'deskconfig/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
