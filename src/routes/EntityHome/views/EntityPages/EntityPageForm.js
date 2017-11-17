import React, { PropTypes, Component } from 'react';
import { Button, Form, Input, Radio, Select, message } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class EntityPageForm extends Component {
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
    const itemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} > 
        <FormItem {...itemLayout} label="WEB列表页面">
          {form.getFieldDecorator('weblistpage')(
            <Input maxLength="50" />
          )}
        </FormItem>    
        <FormItem {...itemLayout} label="WEB_TAB详细页面">
          {form.getFieldDecorator('webtabinfopage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="WEB实体主页">
          {form.getFieldDecorator('webindexpage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="WEB简单实体查看页面">
          {form.getFieldDecorator('webviewpage')(
            <Input maxLength="50" />
          )}
        </FormItem>  
        <FormItem {...itemLayout} label="WEB简单实体编辑页面">
          {form.getFieldDecorator('webeditpage')(
            <Input maxLength="50" />
          )}
        </FormItem>          
        <FormItem {...itemLayout} label="安卓列表页面">
          {form.getFieldDecorator('androidlistpage')(
            <Input maxLength="50" />
          )}
        </FormItem>    
        <FormItem {...itemLayout} label="安卓编辑页面">
          {form.getFieldDecorator('androideditpage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="安卓实体主页">
          {form.getFieldDecorator('androidindexpage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="安卓查看页面">
          {form.getFieldDecorator('androidviewpage')(
            <Input maxLength="50" />
          )}
        </FormItem> 
        <FormItem {...itemLayout} label="苹果列表页面">
          {form.getFieldDecorator('ioslistpage')(
            <Input maxLength="50" />
          )}
        </FormItem>    
        <FormItem {...itemLayout} label="苹果编辑页面">
          {form.getFieldDecorator('ioseditpage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="苹果实体主页">
          {form.getFieldDecorator('iosindexpage')(
            <Input maxLength="50" />
          )}
        </FormItem>   
        <FormItem {...itemLayout} label="苹果查看页面">
          {form.getFieldDecorator('iosviewpage')(
            <Input maxLength="50" />
          )}
        </FormItem>    
        <FormItem  wrapperCol={{ span: 2, offset: 16 }}>
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
})(EntityPageForm);
