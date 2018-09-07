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
    const { form, editingRecord } = nextProps;
    if (isOpening) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          vocationsid: editingRecord.vocationsid && editingRecord.vocationsid.split(',')
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
        ...values,
        desktoptype: values.desktoptype * 1,
        vocationsid: values.vocationsid.join(',')
      });
    });
  };

  getHtml = () => {
    return this.props.vocations.map(item => {
      return <Option key={item.vocationid}>{item.vocationname}</Option>;
    });
  }

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
          <FormItem label="类型">
            {getFieldDecorator('desktoptype', {
              initialValue: '1'
            })(
              <Select disabled={true}>
                <Option key={0}>通用型</Option>
                <Option key={1}>岗位型</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="职能">
            {getFieldDecorator('vocationsid')(
              <Select mode="multiple">
                {
                  this.props.vocations.map(item => {
                    return <Option key={item.vocationid}>{item.vocationname}</Option>;
                  })
                }
              </Select>
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
    const { showModals, currItems, modalPending, vocations } = state.deskconfig;
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currItems[0] : undefined,
      vocations,
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
