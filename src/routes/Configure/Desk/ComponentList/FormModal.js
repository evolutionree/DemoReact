/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import InputInteger from '../../../../components/DynamicForm/controls/InputInteger';

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
        ...values,
        dscomponetid: editingRecord && editingRecord.dscomponetid
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑工作台组件' : '新增工作台组件'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="名称">
            {getFieldDecorator('comname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入组件名称' }]
            })(
              <Input placeholder="请输入组件名称" maxLength="10" />
            )}
          </FormItem>
          {/*<FormItem label="分类">*/}
            {/*{getFieldDecorator('comtype', {*/}
              {/*rules: [{ required: true, message: '请输入分类' }]*/}
            {/*})(*/}
              {/*<Input placeholder="请输入组件名称" maxLength="10" />*/}
            {/*)}*/}
          {/*</FormItem>*/}
          <FormItem label="渲染组件">
            {getFieldDecorator('comurl', {
              rules: [{ required: true, message: '请输入前端渲染的组件名' }]
            })(
              <Input placeholder="请输入前端渲染的组件名" />
            )}
          </FormItem>
          <FormItem label="宽度">
            {getFieldDecorator('comwidth', {
              rules: [{ required: true, message: '请选择宽度' }]
            })(
              <Select placeholder="请选择宽度">
                <Option key={1}>1/2</Option>
                <Option key={2}>2/2</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="最小高度">
            {getFieldDecorator('mincomheight', {
              rules: [{ required: true, message: '请输入最小高度' }]
            })(
              <InputInteger placeholder="请输入最小高度" />
            )}
          </FormItem>
          <FormItem label="最大高度">
            {getFieldDecorator('maxcomheight', {
              rules: [{ required: true, message: '请输入最大高度' }]
            })(
              <InputInteger placeholder="请输入最大高度" />
            )}
          </FormItem>
          <FormItem label="参数">
            {getFieldDecorator('comargs')(
              <Input placeholder="请输入参数" />
            )}
          </FormItem>
          <FormItem label="说明">
            {getFieldDecorator('comdesciption')(
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
    const { showModals, currItems, modalPending } = state.deskcomponentconfig;
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'deskcomponentconfig/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'deskcomponentconfig/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
