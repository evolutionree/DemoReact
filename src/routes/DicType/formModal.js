/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';

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

  componentValueRequire = (rule, value, callback) => {
    if (!value || value instanceof Array && value.length === 0) {
      callback('请选择关联转移对象');
    } else {
      callback();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑字典' : '新增字典'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="字典名称">
            {getFieldDecorator('flowname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入字典名称' }]
            })(
              <Input placeholder="请输入字典名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="关联字典类型">
            {getFieldDecorator('entityid', {
              rules: [{ required: true, message: '请选择关联字典类型' }]
            })(
              <Select placeholder="请选择关联字典类型">
                {this.props.entities.map(entity => (
                  <Option key={entity.entityid}>{entity.entityname}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          {/*<FormItem label="关联转移对象">*/}
            {/*{getFieldDecorator('relentityid', {*/}
              {/*rules: [{*/}
                {/*validator: this.componentValueRequire*/}
              {/*}]*/}
            {/*})(*/}
              {/*<RelTable />*/}
            {/*)}*/}
          {/*</FormItem>*/}
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending } = state.dictype;
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
        dispatch({ type: 'dictype/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'dictype/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
