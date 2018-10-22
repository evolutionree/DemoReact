import React, { PropTypes, Component } from 'react';
import { Button, Form, Input, Radio, Select, message } from 'antd';
import SelectAppIcon from '../../../../components/SelectAppIcon';
import PowerTextArea from '../../../../components/PowerTextArea';
import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
import { IntlInputRequireValidator } from '../../../../utils/validator';

const FormItem = Form.Item;
const Option = Select.Option;

class EntityButtonForm extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      this.props.onSubmit(values);
    });
  };

  render() {
    const { form } = this.props;
    const itemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <FormItem {...itemLayout} label="按钮名称">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请填写按钮名称' }]
          })(
            <Input maxLength="50" />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="按钮标题">
          {form.getFieldDecorator('title_lang', {
            rules: [
              { required: true, message: '请填写按钮标题' },
              { validator: IntlInputRequireValidator }
            ]
          })(
            <IntlInput maxLength="50" />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="FunctionCode">
          {form.getFieldDecorator('buttoncode', {
            rules: [{ required: true, message: '请填写FunctionCode' }]
          })(
            <Input maxLength="50" />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="数据选择范围">
          {form.getFieldDecorator('selecttype', {
            rules: [{ required: true, message: '请选择数据选择范围' }]
          })(
            <Select>
              <Option value="0">全部数据</Option>
              <Option value="1">单选</Option>
              <Option value="2">多选</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...itemLayout} label="显示位置">
          {form.getFieldDecorator('displayposition', {
            rules: [{ required: true, message: '请选择显示位置' }]
          })(
            <Select mode="multiple">
              <Option value="0">web列表</Option>
              <Option value="1">web详情</Option>
              <Option value="100">手机列表</Option>
              <Option value="101">手机详情</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...itemLayout} label="按钮关联的url服务">
          {form.getFieldDecorator('routepath', {
            // rules: [{ required: true, message: '请设置按钮关联的url服务' }]
          })(
            <Input maxLength="100" />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="extraData(json字符串)">
          {form.getFieldDecorator('extradata', {
            // rules: [{ required: true, message: '请设置按钮关联的url服务' }]
          })(
            <PowerTextArea />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="图标">
          {form.getFieldDecorator('icon', {
            // rules: [{ required: true, message: '请填写Code' }]
          })(
            <SelectAppIcon usage="3" />
          )}
        </FormItem>
        <FormItem {...itemLayout} label="调用后是否刷新页面">
          {form.getFieldDecorator('isrefreshpage', {
            rules: [{ required: true, message: '请设置是否刷新页面' }]
          })(
            <Radio.Group>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 12, offset: 6 }}>
          <Button htmlType="submit">保存</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create({
  mapPropsToFields(props) {
    return props.value;
  },
  onFieldsChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(EntityButtonForm);
