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
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 }
  }
};

const formConfig = [
  {
    type: 'UserSelect', span: 24, label: '汇报人', fieldname: 'reportuser',
    formItemLayout: formItemLayoutLine, required: true, bindArgument: ['reportuser', 'reportleader']
  },
  {
    type: 'UserSelect', span: 24, label: '汇报上级', fieldname: 'reportleader', 
    formItemLayout: formItemLayoutLine, bindArgument: ['reportleader', 'reportuser']
  }
];

export default formConfig;
