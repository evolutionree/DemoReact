import { Form } from 'antd';
import _ from 'lodash';
import DynamicFormBase from './DynamicFormBase';
import createFormErrorsStore from './createFormErrorsStore';

class _DynamicFormAdvanceSearch extends DynamicFormBase {
  usage = 2;
  processFields = fields => {
    const notSupportControlTypes = [1007, 1008];
    return fields.filter(field => {
      if (field.controltype === 1012) {
        field.controltype = 1;
      } else if (field.controltype === 14) {
        field.controltype = 1;
      }
      return notSupportControlTypes.indexOf(field.controltype) === -1;
    });
  }
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

const DynamicFormAdvanceSearch = createFormErrorsStore(
  withForm(_DynamicFormAdvanceSearch)
);

/**
 * 处理数据
 * 1. 数据源格式 '{"id":"6a52a298-af06-4acf-afbb-07004bf53ac3","name":"导入客户测试08"}' => '6a52a298-af06-4acf-afbb-07004bf53ac3'
 */
DynamicFormAdvanceSearch.formatFormData = (formData, fields) => {
  const retFormData = {};
  Object.keys(formData).forEach(fieldName => {
    const value = formData[fieldName];
    const matchField = _.find(fields, ['fieldname', fieldName]);
    if (matchField && matchField.controltype === 18 && value) {
      let formatValue = '';
      const json = JSON.parse(value);
      if (Array.isArray(json)) {
        formatValue = json.map(item => item.id).join(',');
      } else {
        formatValue = json.id;
      }
      retFormData[fieldName] = formatValue;
      return;
    }
    retFormData[fieldName] = value;
  });
  return retFormData;
};

export default DynamicFormAdvanceSearch;
