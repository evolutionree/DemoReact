import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Radio, message } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;

class SQLObjectFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};


  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {

    const record = nextProps.currItems[0];
    const fieldsValue = _.pick(record, ['objtype', 'objname']);
    this.props.form.setFieldsValue(fieldsValue);
    console.error(record);
    console.error(fieldsValue);
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const params = {

      };
      this.props.save(params);
    });
  };

  render() {
    const { visible, cancel, form } = this.props;
    return (
      <Modal
        visible={visible}
        title='SQL对象编辑'
        onCancel={cancel}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label="对象类型">
            {form.getFieldDecorator('objtype', {
              rules: [
                { required: true}
              ]
            })(
              <Radio.Group>
                <Radio value={1}>表</Radio>
                <Radio value={2}>函数</Radio>
                <Radio value={3}>序列</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="对象名称">
            {form.getFieldDecorator('objname', {
              rules: [{ required: true, message: '对象名称' }]
            })(
              <Input type="text" placeholder="请输入对象名称" maxLength={200} />
            )}
          </FormItem>
          <FormItem label="参数">
            {form.getFieldDecorator('objname', {
              rules: [{ required: true, message: '参数' }]
            })(
              <Input type="text" placeholder="请输入分组名称" maxLength={200}  />
            )}
          </FormItem>
          <FormItem label="分组">
            {form.getFieldDecorator('sqlpath', {
              rules: [{ required: true, message: '分组' }]
            })(
              <Input type="text" placeholder="请输入分组名称" maxLength={200} />
            )}
          </FormItem>
          <FormItem label="显示名称">
            {form.getFieldDecorator('name', {
              rules: [{ required: true, message: '显示名称' }]
            })(
              <Input type="text" placeholder="请输入显示名称" maxLength={200}  />
            )}
          </FormItem>
          <FormItem label="是否初始化">
            {form.getFieldDecorator('isneedinit', {
              rules: [{ required: true, message: '是否初始化' }]
            })(
              <Radio.Group>
                <Radio value={1}>初始化</Radio>
                <Radio value={0}>不初始化</Radio>
              </Radio.Group>
            )}
          </FormItem>

        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showInfoModals, currItems } = state.dbmanager;
    return {
      visible: /edit/.test(showInfoModals),
      isEdit: /edit/.test(showInfoModals),
      currItems: currItems
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dbmanager/showInfoModals', payload: '' });
      },
      save(formData) {
        dispatch({ type: 'dbmanager/save', payload: formData });
      }
    };
  }
)(Form.create()(SQLObjectFormModal));
