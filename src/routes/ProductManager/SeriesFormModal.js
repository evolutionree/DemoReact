import React, { PropTypes, Component } from 'react';
import { Form, Modal, Input, message } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';

const FormItem = Form.Item;

class SeriesFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    currentSeries: PropTypes.object,
    modalPending: PropTypes.bool,
    visible: PropTypes.bool,
    isEdit: PropTypes.bool,
    cancel: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
  };
  static defaultProps = {
    currentSeries: {},
    modalPending: false,
    visible: false,
    isEdit: false
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, currentSeries, isEdit } = nextProps;
      if (isEdit) {
        form.setFieldsValue({
          seriesName_lang: currentSeries.productsetname,
          seriesCode: currentSeries.productsetcode || ''
        });
      } else {
        form.setFieldsValue({
          seriesName_lang: '',
          seriesCode: ''
        });
      }
    }
  }

  submitForm = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return message.error('请检查表单');
      this.props.save(values);
    });
  };

  render() {
    const { isEdit, form, visible, cancel, modalPending } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={isEdit ? '编辑产品系列' : '新增产品系列'}
        visible={visible}
        onCancel={cancel}
        onOk={this.submitForm}
        confirmLoading={modalPending}
      >
        <Form>
          <FormItem label="名称">
            {getFieldDecorator('seriesName_lang', {
              initialValue: '',
              rules: [{ required: true, message: '请输入名称' }]
            })(
              <Input placeholder="请输入名称" />
            )}
          </FormItem>
          <FormItem label="编码">
            {getFieldDecorator('seriesCode', {
              initialValue: '',
              rules: [{ required: true, message: '请输入编码' }]
            })(
              <Input placeholder="请输入编码" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, series, queries, modalPending } = state.productManager;
    const currentSeries = _.find(series, ['productsetid', queries.productSeriesId]);
    return {
      currentSeries,
      modalPending,
      visible: /addSeries|editSeries/.test(showModals),
      isEdit: /editSeries/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'productManager/showModals', payload: '' });
      },
      save(data) {
        dispatch({ type: 'productManager/saveSeries', payload: data });
      }
    };
  }
)(Form.create()(SeriesFormModal));
