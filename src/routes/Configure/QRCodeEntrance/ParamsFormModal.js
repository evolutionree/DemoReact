/**
 * Created by 0291 on 2018/6/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import CodeEditor from '../../../components/CodeEditor';

const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;

class ParamsFormModal extends Component {
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
      console.log(values)
    });
  };

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible={visible}
        title={'新增规则'}
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
              <Select style={{ width: 120 }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="规则描述">
            {getFieldDecorator('remark')(
              <TextArea />
            )}
          </FormItem>
          <FormItem label="规则描述">
            {getFieldDecorator('rluwe')(
              <CodeEditor
                style={{ border: '1px solid #ddd', height: '400px' }}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending } = state.qrcodeentrance;

    return {
      visible: /test/.test(showModals),
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
)(Form.create()(ParamsFormModal));
