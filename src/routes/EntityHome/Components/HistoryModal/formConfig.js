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
    type: 'Input', span: 24, label: '汇报关系名称', fieldname: 'reportrelationname', formItemLayout: formItemLayoutLine, required: true
  },
  {
    type: 'TextArea', span: 24, label: '描述', fieldname: 'reportremark', formItemLayout: formItemLayoutLine
  }
];

export default formConfig;
