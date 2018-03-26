/**
 * Created by 0291 on 2018/3/8.
 */
import { Form } from 'antd';
import DynamicFormBase from '../../../components/DynamicForm/DynamicFormBase';
import createJSEngineProxy from '../../../components/DynamicForm/createJSEngineProxy';
import createFormErrorsStore from '../../../components/DynamicForm/createFormErrorsStore';
import SelectInput from '../componnet/Form/SelectInput';
import TimePicker from '../componnet/Form/TimePicker';

const FormItem = Form.Item;

const typeCombine = ['recname', 'scheduleType'];
const typeCombineFieldName = 'typeCombine';

const startEndTimeCombine = ['starttime', 'endtime', 'allday', 'repeatType', 'repeatEnd'];
const startEndTimeCombineFieldName = 'typeCombine12';
class DynamicFormAdd extends DynamicFormBase {
  usage = 0;
  getFieldControlInstance = fieldName => {
    if (typeCombine.indexOf(fieldName) > -1) {
      return this[`fieldControlInst${typeCombineFieldName}`];
    } else if (startEndTimeCombine.indexOf(fieldName) > -1) {
      return this[`fieldControlInst${startEndTimeCombineFieldName}`];
    } else {
      const fieldControl = this[`fieldControlInst${fieldName}`];
      return (fieldControl && fieldControl.getControlRef()) || null;
    }
  };

  renderField = field => {
    let fields = this.processFields(this.props.fields).map(item => {
      let { fieldconfig } = item;
      if (fieldconfig && fieldconfig.isReadOnly !== 1 && (fieldconfig.isReadOnlyJS === 0 || fieldconfig.isReadOnlyJS === 1)) {
        fieldconfig = {
          ...fieldconfig,
          isReadOnly: fieldconfig.isReadOnlyJS
        };
      }
      return { ...item, fieldconfig };
    });

    const typeCombineFields = fields && fields instanceof Array && fields.filter(item => typeCombine.indexOf(item.fieldname) > -1);
    const startEndTimeCombineFields = fields && fields instanceof Array && fields.filter(item => startEndTimeCombine.indexOf(item.fieldname) > -1);
    if (typeCombine.indexOf(field.fieldname) > -1) {
      if (field.fieldname === 'scheduleType') {
        return (
          <FormItem key={typeCombineFieldName}>
            {this.props.form.getFieldDecorator(typeCombineFieldName, {
              initialValue: ''
            })(<SelectInput ref={this.onFieldControlRef.bind(this, typeCombineFieldName)}
                            fields={typeCombineFields}
                            onChange={(value, fileldName, isFromApi) => { this.onFieldValueChange(fileldName, value, isFromApi) }} />)}
          </FormItem>
        );
      } else {
        return null;
      }
    } else if (startEndTimeCombine.indexOf(field.fieldname) > -1) {
      if (field.fieldname === 'starttime') {
        return (
          <FormItem key={startEndTimeCombineFieldName}>
            {this.props.form.getFieldDecorator(startEndTimeCombineFieldName, {
              initialValue: ''
            })(<TimePicker ref={this.onFieldControlRef.bind(this, startEndTimeCombineFieldName)}
                           fields={startEndTimeCombineFields}
                           onChange={(value, fileldName, isFromApi) => { this.onFieldValueChange(fileldName, value, isFromApi) }} />)}
          </FormItem>
        );
      } else {
        return null;
      }
    } else {
      const fieldControl = this.renderFieldControl(field);
      return this.renderFieldControlWrapper(field)(fieldControl);
    }
  };
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
