import { Form } from 'antd';
import DynamicFormBase from './DynamicFormBase';
import createJSEngineProxy from './createJSEngineProxy';
import createFormErrorsStore from './createFormErrorsStore';

class DynamicFormEdit extends DynamicFormBase {
  usage = 1;
}

const withForm = Form.create({
  mapPropsToFields({ value }) {
    return value; // value with errors
  },
  onFieldsChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
});

export default createFormErrorsStore(
  withForm(
    createJSEngineProxy(DynamicFormEdit, { type: 'EDIT' })
  )
);
