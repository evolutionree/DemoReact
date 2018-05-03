/**
 * Created by 0291 on 2018/4/28.
 */
import React from 'react';
import { Form } from 'antd';
import FieldSet from './FieldSet';
import _ from 'lodash';

class FieldForm extends React.Component {
  static propTypes = {

  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  checkConfigs = (rule, value, callback) => {
    for (let i = 0; i < value.length; i++) {
      if ( value[i].type === 0 && value[i].relentityid === '' && value[i].fieldid === '' && value[i].fieldid === '') { //必填
        callback('统计字段设置中所有项必填');
      } else if (value[i].relentityid === '' && value[i].func === '') {
        callback('统计字段设置中所有项必填');
      }
    }
    callback();
  }

  render() {
    const { form } = this.props;
    return (
      <Form>
        {form.getFieldDecorator('configs', {
          initialValue: '',
          rules: [{
            validator: this.checkConfigs
          }]
        })(
          <FieldSet />
        )}
      </Form>
    );
  }
}

const WrappedSetFieldForm = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(FieldForm);

export default WrappedSetFieldForm;
