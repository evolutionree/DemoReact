import { Form } from 'antd';
import DynamicFormBase from './DynamicFormBase';
import createJSEngineProxy from './createJSEngineProxy';
import createFormErrorsStore from './createFormErrorsStore';

class DynamicFormAdd extends DynamicFormBase {
  usage = 0;
}

const withForm = Form.create({
  mapPropsToFields({ value }) {
    return value; // value with errors
  },
  onFieldsChange({ value, onChange }, values) {
    // console.log('DynamicFormAdd fieldschange: oldvalue: ', value, ' changes: ', values);
    onChange({
      ...value,
      ...values
    });
  }
});

export default createFormErrorsStore(
  withForm(
    createJSEngineProxy(DynamicFormAdd, { type: 'ADD' })
  )
);
