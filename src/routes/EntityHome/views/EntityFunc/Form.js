/**
 * Created by 0291 on 2017/12/6.
 */
import React from 'react';
import { Form, Select, Input, Button, Checkbox } from 'antd';
import { webFuncodeSelectData, mobileFuncodeSelectData } from './selectData';
import uuid from 'uuid';
import _ from 'lodash';

const Option = Select.Option;
const FormItem = Form.Item;

class FuncForm extends React.Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submitType === 'add' && nextProps.submitType !== this.props.submitType) {
      const { resetFields, setFieldsValue } = this.props.form;
      resetFields(); //清空表单数据
      setFieldsValue({
        parentid: nextProps.value && nextProps.value.funcid
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.submit && this.props.submit(values);
      }
    });
  }

  render() {
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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };
    const { getFieldDecorator } = this.props.form;

    const selectData = { //this.props.treeType 当前数节点对应的类型（web or mobile）
      web: webFuncodeSelectData[this.props.entityType],
      mobile: mobileFuncodeSelectData[this.props.entityType]
    }
    return (
      <Form onSubmit={this.handleSubmit.bind(this)}>
        <FormItem {...formItemLayout} label="">
          {getFieldDecorator('parentid', {
            initialValue: ''
          })(
            <Input type='hidden' />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="">
          {getFieldDecorator('funcid', {
            initialValue: uuid.v4()
          })(
            <Input type='hidden' />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="实体">
          {getFieldDecorator('entityid', {
            rules: [{ required: true, message: '请完成实体填写' }],
            initialValue: ''
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="功能名称">
          {getFieldDecorator('funcname', {
            rules: [{ required: true, message: '请完成功能名称填写' }],
            initialValue: ''
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="功能code">
          {getFieldDecorator('funccode', {
            rules: [{ required: true, message: '请选择下拉列表数据' }],
            initialValue: ''
          })(
            <Select style={{ width: 226 }}>
              {
                selectData[this.props.treeType].map((item, index) => {
                  return (
                    <Option value={item.value} key={index}>{item.name}</Option>
                  );
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="当前功能关联的业务数据">
          {getFieldDecorator('relationvalue', {
            initialValue: ''
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="路径">
          {getFieldDecorator('routepath', {
            initialValue: ''
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          {getFieldDecorator('islastchild', {
            initialValue: '',
            valuePropName: 'checked'
          })(
            <Checkbox>是否配置数据权限</Checkbox>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">{this.props.submitType === 'edit' ? '修改' : '新增'}</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onFieldsChange({ value, onChange }, values) {
    // console.log('RelTableRow fieldschange: oldvalue: ', value, ' changes: ', values);
    // onChange({
    //   ...value,
    //   ...values
    // });
  }
})(FuncForm);
