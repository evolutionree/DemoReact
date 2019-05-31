const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};
const formItemLayoutLine = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 2 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 22 }
  }
};

const formConfig = [
  { type: 'Input', span: 24, label: '函数名称', fieldname: 'funcname', formItemLayout: formItemLayoutLine },
  { type: 'TextArea2', span: 24, label: '参数名称', fieldname: 'paramsname', formItemLayout: formItemLayoutLine, autosize: { minRows: 2, maxRows: 2 } },
  {
    type: 'TextArea2', span: 24, label: '脚本内容', fieldname: 'newsql', formItemLayout: formItemLayoutLine, autosize: { minRows: 6, maxRows: 16 }
  },
  { type: 'TextArea1', span: 24, label: '变更说明', fieldname: 'remark', formItemLayout: formItemLayoutLine, required: true }
];

export default formConfig;
