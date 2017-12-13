/**
 * Created by 0291 on 2017/12/13.
 */
import React from 'react';
import { Table, Select, Form, Radio, Input } from 'antd';
import { connect } from 'dva';
import SelectUser from '../../components/DynamicForm/controls/SelectUser';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class Search extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }


  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户"
        >
          {getFieldDecorator('userid')(
            <SelectUser style={{ width: 200 }} onChange={this.props.onChange} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="账号"
        >
          {getFieldDecorator('MailAddress')(
            <Select>
              <Option value="0">所有邮箱账号</Option>
              <Option value="1">Option 1</Option>
              <Option value="2">Option 2</Option>
              <Option value="3">Option 3</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="类型"
        >
          {getFieldDecorator('Ctype')(
            <Select>
              <Option value="1">所有邮件</Option>
              <Option value="2">发出的邮件</Option>
              <Option value="3">收到的邮件</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="关键字"
        >
          {getFieldDecorator('KeyWord')(
            <Input maxLength={20} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="过滤删除邮件范围"
        >
          {getFieldDecorator('DateRange')(
            <Radio.Group>
              <Radio.Button value="horizontal">两周内</Radio.Button>
              <Radio.Button value="vertical">三个月内</Radio.Button>
              <Radio.Button value="inline">半年内</Radio.Button>
              <Radio.Button value="inline">一年内</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
    )
  }
}
const WrappedMailRecovery = Form.create({
  mapPropsToFields({ value }) {
    return value; // value with errors
  },
  onFieldsChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(Search);

export default WrappedMailRecovery;
