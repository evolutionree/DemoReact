/**
 * Created by 0291 on 2018/3/6.
 */
import React from 'react';
import { Button, Form, Radio, Input, Checkbox, Select } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import WorkTime from './component/WorkTime';
import ResetTime from './component/ResetTime';
import FlexTime from './component/FlexTime';
import LabelSelect from './component/LabelSelect';
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
    const earlysign = [{ text: '1小时', value: 1 }, { text: '2小时', value: '2' }, { text: '3小时', value: '3' }, { text: '4小时', value: '4' }, { text: '5小时', value: '5' }, { text: '6小时', value: '6' }];
    const latestsign = [{ text: '1小时', value: 1 }, { text: '2小时', value: '2' }, { text: '3小时', value: '3' }, { text: '4小时', value: '4' }, { text: '5小时', value: '5' }, { text: '6小时', value: '6' },
      { text: '7小时', value: '7' }, { text: '8小时', value: '8' }, { text: '9小时', value: '9' }, { text: '10小时', value: '10' }, { text: '11小时', value: '11' }, { text: '12小时', value: '12' }];

    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="班次名称"
        >
          {getFieldDecorator('recname', {
            initialValue: ''
          })(
            <Input placeholder="请输入班次名称" maxLength={10} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="工作时段"
        >
          {getFieldDecorator('workTime', {
            initialValue: ''
          })(
            <WorkTime />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="休息时段"
        >
          {getFieldDecorator('restTime', {
            initialValue: ''
          })(
            <ResetTime />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="允许最早签到时间"
        >
          {getFieldDecorator('earlysign', {
            initialValue: ''
          })(
            <LabelSelect dataSource={earlysign} label='上班前' />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="允许最晚签到时间"
        >
          {getFieldDecorator('latestsign', {
            initialValue: ''
          })(
            <LabelSelect dataSource={latestsign} label='下周后' />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="上班弹性时间"
        >
          {getFieldDecorator('flexTime', {
            initialValue: ''
          })(
            <FlexTime />
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

export default WrappedAddForm;