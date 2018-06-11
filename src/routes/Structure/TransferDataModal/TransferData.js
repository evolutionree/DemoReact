/**
 * Created by 0291 on 2018/5/24.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Button } from 'antd';
import FormList from './FormList';

const FormItem = Form.Item;
const Option = Select.Option;

class TransferData extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
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
      const { form } = nextProps;
      form.resetFields();
    }
  }

  formRequire = (rule, value, callback) => {
    if (!value) {
      callback('请选择待转移数据');
    } else {
      callback();
    }
  }

  onOk = () => {
    const { form } = this.props;
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
    return (
      <Modal
        visible={this.props.visible}
        title="一键转移数据"
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="选择待转移数据">
            {getFieldDecorator('flowname', {
              initialValue: '',
              rules: [{
                validator: this.formRequire
              }]
            })(
              <FormList model={[1, 2]} />
            )}
          </FormItem>
          <FormItem label="选择新负责人">
            {getFieldDecorator('remark', {
              initialValue: ''
            })(
              <Input type="textarea" placeholder="选择新负责人" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending, entities } = state.structure;
    return {
      visible: /transferData/.test(showModals),
      entities,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'structure/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'structure/save', payload: data });
      }
    };
  }
)(Form.create()(TransferData));
