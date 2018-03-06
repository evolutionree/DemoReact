/**
 * Created by 0291 on 2018/3/6.
 */
import React from 'react';
import { Button, Form, Radio, Input, Checkbox, Select } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import classnames from 'classnames';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
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
          label="班次名称"
        >
          {getFieldDecorator('relateBusin', {
            initialValue: ''
          })(
            <Input placeholder="请输入班次名称" />
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
