export default function generateFieldDecorators(fields, formInstance) {
  const decorators = {};
  fields.forEach(field => {
    const { fieldname, fieldconfig } = field;
    const initialValue = fieldconfig && fieldconfig.defaultValue;
    const rules = generateValidateRules(field, formInstance);
    decorators[fieldname] = formInstance.props.form.getFieldDecorator(fieldname, {
      initialValue,
      rules,
      trigger: 'onChange',
      validateTrigger: 'onChange'
    });
  });
  return decorators;
}

function generateValidateRules(field, formInstance) {
  const rules = [];
  const fieldConfig = field.fieldconfig;
  const { maxLength, regExp } = fieldConfig;
  if (regExp) {
    rules.push({
      pattern: new RegExp(regExp),
      message: '请检查格式'
    });
  }
  if (maxLength) {
    rules.push({
      validator(rule, value, callback) {
        if (value && value.length > maxLength) {
          return callback('最大长度为' + maxLength);
        }
        callback();
      }
    });
  }
  if (field.isrequire) {
    rules.push({
      validator(rule, value, callback) {
        if (value === undefined || value === '') {
          return callback('请输入' + field.displayname);
        }
        callback();
      }
    });
  }
  if (field.controltype === 24) {
    rules.push({
      validator: (rule, value, callback) => {
        const tableInstance = formInstance && formInstance.getFieldControlInstance(field.fieldname);
        tableInstance.validate().then(() => {
          callback();
        }, (err) => {
          callback(err || '表格数据校验不通过');
        });
      }
    });
  }
  if (field.controltype === 10) {
    rules.push({
      validator(rule, value, callback) {
        if (value && !/[0-9]{11}/.test(value)) {
          return callback('请输入11位的手机号码');
        }
        callback();
      }
    });
  }

  return rules;
}
