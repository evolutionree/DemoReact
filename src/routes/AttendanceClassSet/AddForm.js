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

  componentValueRequire = (fileName, rule, value, callback) => {
    const form = this.props.form;
    switch (fileName) {
      case 'workTime':
        if (!value.startworktime || !value.offworktime) {
          callback('请选择工作时段');
        } else {
          callback();
        }
        break;
      case 'earlysign':
        if (!value) {
          callback('请选择');
        } else {
          callback();
        }
        break;
      case 'latestsign':
        if (!value) {
          callback('请选择');
        } else {
          callback();
        }
        break;
      case 'restTime':
        if (value.hasresttime === 1 && (!value.startresttime || !value.endresttime)) {
          callback('请选择休息时段');
        } else {
          callback();
        }
      case 'flexTime':
        if (value.hasflextime === 1 && !value.flextime) {
          callback('请选择上班弹性时间');
        } else {
          callback();
        }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const earlysign = [{ text: '1小时', value: 1 }, { text: '2小时', value: 2 }, { text: '3小时', value: 3 }, { text: '4小时', value: 4 },
      { text: '5小时', value: 5 }, { text: '6小时', value: 6 }];
    const latestsign = [{ text: '1小时', value: 1 }, { text: '2小时', value: 2 }, { text: '3小时', value: 3 }, { text: '4小时', value: 4 },
      { text: '5小时', value: 5 }, { text: '6小时', value: 6 },
      { text: '7小时', value: 7 }, { text: '8小时', value: 8 }, { text: '9小时', value: 9 }, { text: '10小时', value: 10 }, { text: '11小时', value: 11 }, { text: '12小时', value: 12 }];

    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="班次名称"
        >
          {getFieldDecorator('recname', {
            initialValue: '',
            rules: [{
              required: true, message: '请输入班次名称'
            }]
          })(
            <Input placeholder="请输入班次名称" maxLength={10} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="工作时段"
        >
          {getFieldDecorator('workTime', {
            initialValue: '',
            rules: [{
              required: true, message: '请选择工作时段'
            }, {
              validator: this.componentValueRequire.bind(this, 'workTime')
            }]
          })(
            <WorkTime />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="休息时段"
        >
          {getFieldDecorator('restTime', {
            initialValue: '',
            rules: [{
              validator: this.componentValueRequire.bind(this, 'restTime')
            }]
          })(
            <ResetTime />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="允许最早签到时间"
        >
          {getFieldDecorator('earlysign', {
            initialValue: '',
            rules: [{
              required: true, message: '请选择工作时段'
            }, {
              validator: this.componentValueRequire.bind(this, 'earlysign')
            }]
          })(
            <LabelSelect dataSource={earlysign} label='上班前' />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="允许最晚签到时间"
        >
          {getFieldDecorator('latestsign', {
            initialValue: '',
            rules: [{
              required: true, message: '请选择工作时段'
            }, {
              validator: this.componentValueRequire.bind(this, 'latestsign')
            }]
          })(
            <LabelSelect dataSource={latestsign} label='下周后' />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="上班弹性时间"
        >
          {getFieldDecorator('flexTime', {
            initialValue: '',
            rules: [{
              validator: this.componentValueRequire.bind(this, 'flexTime')
            }]
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
