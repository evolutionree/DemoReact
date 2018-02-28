/**
 * Created by 0291 on 2017/12/27.
 */
import React from 'react';
import { Button, Select, Form, Radio, Input } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import SelectInput from '../componnet/Form/SelectInput';
import TimePicker from '../componnet/Form/TimePicker';

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

    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="类型"
        >
          {getFieldDecorator('Ctype', {
            initialValue: 0
          })(
            <SelectInput />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="关键字"
        >
          {getFieldDecorator('KeyWord', {
            initialValue: ''
          })(
            <TimePicker />
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
