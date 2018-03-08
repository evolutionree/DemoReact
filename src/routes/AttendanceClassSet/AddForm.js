/**
 * Created by 0291 on 2018/3/6.
 */
import React from 'react';
import { Button, Form, Radio, Input, Checkbox, Select } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import WorkDaySet from './component/WorkDaySet';
import OtherDaySet from './component/OtherDaySet';
import SelectDept from './component/SelectDept';
import AddressSet from './component/AddressSet';
import classnames from 'classnames';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};

class AddForm extends React.Component {
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
          label="考勤组名称"
        >
          {getFieldDecorator('1', {
            initialValue: ''
          })(
            <Input placeholder="请输入考勤组名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="考勤组负责人"
        >
          {getFieldDecorator('2', {
            initialValue: ''
          })(
            <Input placeholder="请输入负责人名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="参与考勤人员"
        >
          {getFieldDecorator('3', {
            initialValue: ''
          })(
            <SelectDept />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="考勤"
        >
          {getFieldDecorator('set', {
            initialValue: ''
          })(
            <Checkbox>固定班制</Checkbox>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="工作日设置"
        >
          {getFieldDecorator('se1t', {
            initialValue: ''
          })(
            <WorkDaySet />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="特殊日期设置"
        >
          {getFieldDecorator('ss', {
            initialValue: ''
          })(
            <OtherDaySet />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="考勤点设置"
        >
          {getFieldDecorator('ss', {
            initialValue: ''
          })(
            <AddressSet />
          )}
        </FormItem>
      </Form>
    );
  }
}
const WrappedAddForm = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(AddForm);

export default connect(
  state => state.attendanceClassSet,
  dispatch => {
    return {

    };
  },
  undefined,
  { withRef: true }
)(WrappedAddForm);
