/**
 * Created by 0291 on 2018/7/25.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import { IntlInputRequireValidator } from '../../utils/validator';

const FormItem = Form.Item;

class FormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editData: PropTypes.object,
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
    const { form, editData } = nextProps;
    if (isOpening && JSON.stringify(this.props.editData) !== JSON.stringify(nextProps.editData)) {
      form.setFieldsValue({
        ...editData
      });
    }
  }


  onOk = () => {
    const { form, editData } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.props.confirm({
        ...editData,
        ...values
      });
    });
  };

  closeModal = () => {
    this.props.cancel();
  }

  getExtConfigForm() {
    const { getFieldDecorator } = this.props.form;
    const { extConfig } = this.props;
    const formHtml = [];
    if (extConfig && extConfig instanceof Object) {
      for (let key in extConfig) {
        formHtml.push(
          <FormItem label={extConfig[key]}>
            {getFieldDecorator(key, {
              initialValue: ''
            })(
              <Input />
            )}
          </FormItem>
        );
      }
    }
    return formHtml;
  }

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible={visible}
        title="编辑字典参数"
        onCancel={this.closeModal}
        onOk={this.onOk}
      >
        <Form>
          <FormItem label="字典参数">
            {getFieldDecorator('dataval_lang', {
              initialValue: '',
              rules: [
                { required: true, message: '请输入字典参数' },
                { validator: IntlInputRequireValidator }
              ]
            })(
              <IntlInput placeholder="请输入字典参数" />
            )}
          </FormItem>
          {
            this.getExtConfigForm()
          }
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, editData, modalPending, extConfig } = state.dic;
    return {
      visible: /edit/.test(showModals),
      editData: /edit/.test(showModals) ? editData : {},
      modalPending,
      extConfig
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dic/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'dic/update', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
