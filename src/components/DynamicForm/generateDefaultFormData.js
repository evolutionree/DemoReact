import moment from 'moment';

export default function generateDefaultFormData(fields, initFormData = {}) {
  const formData = {};
  fields.forEach(field => {
    let defaultVal;
    if (initFormData[field.fieldname] === undefined) {
      defaultVal = field.fieldconfig && field.fieldconfig.defaultValue;
    } else {
      defaultVal = initFormData[field.fieldname];
    }
    // TODO 时间控件 默认值 now 转为当前时间
    if (defaultVal === 'now' && (field.controltype === 8 || field.controltype === 9)) {
      defaultVal = getNowTimeString(field.fieldconfig.format, field.controltype);
    }
    if (defaultVal && (field.controltype === 6 || field.controltype === 7)) {
      if (typeof defaultVal !== 'number') {
        defaultVal = +defaultVal;
        if (isNaN(defaultVal)) {
          defaultVal = undefined;
        }
      }
    }
    if (defaultVal !== undefined && defaultVal !== null) {
      formData[field.fieldname] = defaultVal;
    }

    for (let key in initFormData) {
      if (!formData[key]) {
        formData[key] = initFormData[key];
      }
    }
  });
  return formData;
}

function getNowTimeString(format, controlType) {
  return moment().format(toMomentFormat(format, controlType));
}
function toMomentFormat(format, controlType) {
  const defaultFormat = controlType === 8 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
  if (!format) return defaultFormat;
  return format.replace(/y/g, 'Y')
    .replace(/d/g, 'D')
    .replace(/h/g, 'H');
}
