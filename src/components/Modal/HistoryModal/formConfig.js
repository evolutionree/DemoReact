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
    type: 'TextArea1', span: 24, label: '变更说明', fieldname: 'commitremark', formItemLayout: formItemLayoutLine, required: true
  },
  {
    type: 'TextArea2', span: 24, label: '脚本内容', fieldname: 'newcode', formItemLayout: formItemLayoutLine, autosize: { minRows: 6, maxRows: 16 }
  }
];

export default formConfig;
