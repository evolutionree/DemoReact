/**
 * Created by 0291 on 2018/6/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input } from 'antd';

const { TextArea } = Input;
const FormItem = Form.Item;

class FormModal extends Component {
  static propTypes = {
    form: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

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
    const { form, showModals, editingRecord } = this.props;

    form.validateFields((err, values) => {
      if (err) return;
      if (/edit/.test(showModals)) {
        this.props.edit({
          recid: editingRecord.recid,
          ...values
        });
      } else {
        this.props.add(values);
      }
    });
  };

  render() {
    const { visible, showModals } = this.props;
    const { getFieldDecorator } = this.props.form;
    const isEdit = /edit/.test(showModals);
    return (
      <Modal
        visible={visible}
        title={isEdit ? '编辑规则' : '新增规则'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="规则名称">
            {getFieldDecorator('recname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入规则名称' }]
            })(
              <Input placeholder="请输入流程名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="规则描述">
            {getFieldDecorator('remark')(
              <TextArea />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItem, modalPending } = state.qrcodeentrance;

    return {
      visible: /add|edit/.test(showModals),
      showModals: showModals,
      editingRecord: /edit/.test(showModals) ? currItem : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'qrcodeentrance/showModals', payload: '' });
      },
      add(data) {
        dispatch({ type: 'qrcodeentrance/add', payload: data });
      },
      edit(data) {
        dispatch({ type: 'qrcodeentrance/edit', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
