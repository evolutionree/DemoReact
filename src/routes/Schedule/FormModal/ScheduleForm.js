/**
 * Created by 0291 on 2017/12/27.
 */
import React from 'react';
import { Button, Select, Form, Radio, Input, Checkbox } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import SelectInput from '../componnet/Form/SelectInput';
import TimePicker from '../componnet/Form/TimePicker';
import InputAddress from '../../../components/DynamicForm/controls/InputAddress';
import SelectUser from '../../../components/DynamicForm/controls/SelectUser';
import InputTextarea from '../../../components/DynamicForm/controls/InputTextarea';
import Attachment from '../../../components/DynamicForm/controls/Attachment';
import Styles from './ScheduleForm.less';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

class ScheduleForm extends React.Component {
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
    const typeData = [{ value: 'meet', text: <div className={Styles.SelectList}>会议</div> }, { value: 'custom', text: '拜访客户' }, { value: 'other', text: '其他' }]

    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="类型"
        >
          {getFieldDecorator('Ctype', {
            initialValue: ''
          })(
            <SelectInput data={typeData} placeholder="请选择左侧类型并描述日程内容" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="位置"
        >
          {getFieldDecorator('address', {
            initialValue: ''
          })(
            <InputAddress />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="起止时间"
        >
          {getFieldDecorator('time', {
            initialValue: ''
          })(
            <TimePicker />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="定时提醒"
        >
          {getFieldDecorator('info', {
            initialValue: ''
          })(
            <SelectInput toolTip="设置提醒后，将通过手机端发送提醒推送。请提前安装客户端" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="参与人员"
        >
          {getFieldDecorator('user', {
            initialValue: ''
          })(
            <SelectUser />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="关联业务"
        >
          {getFieldDecorator('test1', {
            initialValue: ''
          })(
            <SelectInput placeholder="请选择并输入" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label=" "
          colon={false}
        >
          {getFieldDecorator('test1', {
            initialValue: ''
          })(
            <Checkbox>私密(仅参与人与上级可见)</Checkbox>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="备注"
        >
          {getFieldDecorator('remark', {
            initialValue: ''
          })(
            <InputTextarea />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="附件"
        >
          {getFieldDecorator('attach', {
            initialValue: ''
          })(
            <Attachment />
          )}
        </FormItem>
      </Form>
    );
  }
}
const WrappedScheduleForm = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(ScheduleForm);

export default connect(
  state => state.schedule,
  dispatch => {
    return {

    };
  },
  undefined,
  { withRef: true }
)(WrappedScheduleForm);
