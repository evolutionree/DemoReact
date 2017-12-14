/**
 * Created by 0291 on 2017/12/13.
 */
import React from 'react';
import { Button, Select, Form, Radio, Input } from 'antd';
import { connect } from 'dva';
import SelectUser from './SelectUser';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 3 },
    sm: { span: 3 },
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
          {getFieldDecorator('userid', {
            initialValue: '',
            rules: [{
              required: true, message: ' '
            }]
          })(
            <SelectUser />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="账号"
        >
          {getFieldDecorator('MailAddress', {
            initialValue: ''
          })(
            <Select style={{ width: 200 }}>
              <Option value="">所有邮箱账号</Option>
              {
                this.props.mailAddressList && this.props.mailAddressList instanceof Array && this.props.mailAddressList.map((item, index) => {
                  return <Option value={item} key={index}>{item}</Option>
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="类型"
        >
          {getFieldDecorator('Ctype', {
            initialValue: 0
          })(
            <Select style={{ width: 200 }}>
              <Option value={0}>所有邮件</Option>
              <Option value={1}>发出的邮件</Option>
              <Option value={2}>收到的邮件</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="关键字"
        >
          {getFieldDecorator('KeyWord', {
            initialValue: ''
          })(
            <Input style={{ width: 200 }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="过滤删除邮件范围"
        >
          {getFieldDecorator('DateRange', {
            initialValue: 0
          })(
            <Radio.Group>
              <Radio.Button value={0}>两周内</Radio.Button>
              <Radio.Button value={1}>三个月内</Radio.Button>
              <Radio.Button value={2}>半年内</Radio.Button>
              <Radio.Button value={3}>一年内</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
    )
  }
}
const WrappedMailRecovery = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(Search);

export default connect(
  state => state.mailrecovery,
  dispatch => {
    return {

    };
  },
  undefined,
  { withRef: true }
)(WrappedMailRecovery);
