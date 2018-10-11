/**
 * Created by 0291 on 2018/6/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input } from 'antd';
import _ from 'lodash';

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
    const { form, showModals, editingRecord, columnsDataSource } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (/edit/.test(showModals)) {
        const newColumnsDataSource = columnsDataSource.map(item => {
          if (item.recorder * 1 === editingRecord.recorder * 1) {
            return {
              ...values,
              recorder: editingRecord.recorder * 1
            };
          }
          return item;
        });
        this.props.updateColumnsDataSource(newColumnsDataSource);
      } else {
        const newColumnsDataSource = [
          ...columnsDataSource,
          {
            ...values,
            recorder: columnsDataSource.length + 1
          }
        ]
        this.props.updateColumnsDataSource(newColumnsDataSource);
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
        title={isEdit ? '编辑列定义' : '新增列定义'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
      >
        <Form>
          <FormItem label="字段名">
            {getFieldDecorator('fieldname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入字段名' }]
            })(
              <Input placeholder="请输入字段名" maxLength="20" />
            )}
          </FormItem>
          <FormItem label="显示名">
            {getFieldDecorator('displayname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入字段显示名' }]
            })(
              <Input placeholder="请输入字段显示名" maxLength="10" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, editData, columnsDataSource } = state.dSourceHome;

    return {
      visible: /add|edit/.test(showModals),
      showModals: showModals,
      editingRecord: /edit/.test(showModals) ? editData : undefined,
      columnsDataSource
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dSourceHome/showModals', payload: '' });
      },
      updateColumnsDataSource(data) {
        dispatch({ type: 'dSourceHome/updateColumnsDataSource', payload: data });
        dispatch({ type: 'dSourceHome/showModals', payload: '' });
      }
    };
  }
)(Form.create()(FormModal));
