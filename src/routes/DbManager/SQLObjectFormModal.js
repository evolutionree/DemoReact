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

  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      this.props.save(values);
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
          {form.getFieldDecorator('id')(
            <Input disabled type="hidden" />
          )}
          <FormItem label="对象类型">
            {form.getFieldDecorator('objtype')(
              <Radio.Group disabled>
                <Radio value={1}>表</Radio>
                <Radio value={2}>函数</Radio>
                <Radio value={3}>序列</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="对象名称">
            {form.getFieldDecorator('objname')(
              <Input disabled type="text" />
            )}
          </FormItem>
          <FormItem label="参数">
            {form.getFieldDecorator('procparam')(
              <Input disabled type="text" />
            )}
          </FormItem>
          <FormItem label="分组">
            {form.getFieldDecorator('sqlpath', {
              rules: [{ required: true, message: ' ' }]
            })(
              <Input type="text" placeholder="请输入分组名称" maxLength={200} />
            )}
          </FormItem>
          <FormItem label="显示名称">
            {form.getFieldDecorator('name', {
              rules: [{ required: true, message: ' ' }]
            })(
              <Input type="text" placeholder="请输入显示名称" maxLength={200} />
            )}
          </FormItem>
          <FormItem label="是否初始化">
            {form.getFieldDecorator('needinitsql', {
              initialValue: 0
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
    const { showInfoModals, currItem } = state.dbmanager;
    return {
      visible: /editList/.test(showInfoModals),
      currItem: currItem
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dbmanager/showInfoModals', payload: '' });
      },
      save(formData) {
        dispatch({ type: 'dbmanager/saveobjectforbase', payload: formData });
      }
    };
  }
)(Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  }
})(SQLObjectFormModal));
