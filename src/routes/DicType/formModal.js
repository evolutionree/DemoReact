/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Checkbox } from 'antd';
import DataTable from './DataTable';

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

    };
  }

  componentWillReceiveProps(nextProps) {
    const { form, editingRecord, showModals } = nextProps;
    const isEdit = /edit/.test(showModals);
    if (showModals !== this.props.showModals && isEdit) {
      form.setFieldsValue({
        ...editingRecord
      });
    }
  }


  onOk = () => {
    const { form, editingRecord } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.props.confirm({
        ...values,
        fieldconfig: JSON.stringify(values.fieldconfig),
        isconfig: values.isconfig ? 1 : 0,
        recstatus: 1,
        recorder: editingRecord.recorder ? editingRecord.recorder : '',
        dictypeid: editingRecord ? editingRecord.dictypeid : ''
      });
    });
  };

  closeModal = () => {
    this.props.form.resetFields();
    this.props.cancel();
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { showModals } = this.props;
    const isEdit = /edit/.test(showModals);
    const isconfigValue = getFieldValue('isconfig');

    const relatedictypeList = this.props.list.filter(item => item.dictypeid !== this.props.editingRecord.dictypeid)
    return (
      <Modal
        visible={/add|edit/.test(showModals)}
        title={isEdit ? '编辑字典类型' : '新增字典类型'}
        onCancel={this.closeModal}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="字典类型名称">
            {getFieldDecorator('dictypename', {
              initialValue: '',
              rules: [{ required: true, message: '请输入字典类型名称' }]
            })(
              <Input placeholder="请输入字典名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="关联字典类型">
            {getFieldDecorator('relatedictypeid', {
              initialValue: ''
            })(
              <Select placeholder="请选择关联字典类型">
                <Option value="">- 无 -</Option>
                {relatedictypeList.map(item => (
                  <Option key={item.dictypeid}>{item.dictypename}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('isconfig', {
              valuePropName: 'checked',
              initialValue: false
            })(
              <Checkbox>使用全局扩展配置</Checkbox>
            )}
          </FormItem>
          {
            isconfigValue ? null : <FormItem label="扩展字典配置">
              {getFieldDecorator('fieldconfig')(
                <DataTable />
              )}
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, list, currItem, modalPending } = state.dictype;
    return {
      showModals,
      list,
      editingRecord: /edit/.test(showModals) ? currItem : {},
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dictype/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'dictype/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
