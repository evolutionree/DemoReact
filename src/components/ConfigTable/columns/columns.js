// 不设定width的为不考虑内容超出
const LoopList = [
  { title: '版本信息', key: 'taskversion' },
  { title: '任务类型', key: 'tasktype', name: 'tasktype_name', width: 150 },
  { title: '状态', key: 'taskexecstatus', name: 'taskexecstatus_name', width: 150 },
  { title: '创建时间', key: 'taskcreated', width: 150 },
  { title: '结束时间', key: 'taskendtime', width: 150 },
  { title: '操作', key: 'action' }
];

export { LoopList };
