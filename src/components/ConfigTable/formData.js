const Option = [
  {
    type: 'Select', label: '数据库服务器来源', fieldname: 'islocalserver', required: true,
    initialValue: '0', nodeData: ['本服务器', '其他服务器']
  },
  { type: 'Select', label: '版本选择', fieldname: 'versionRecid', required: true },
  {
    type: 'Input', span: 24, label: '数据库连接信息', fieldname: 'ConnectionString', required: false, show: false,
    message: '请输入正确的数据库连接信息'
  },
  {
    type: 'Input', span: 24, label: '数据库名称', fieldname: 'dbname', required: true,
    message: '请输入正确的数据库名称'
  }
];

export default { Option };
