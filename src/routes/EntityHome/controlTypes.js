// 特殊控件
// 1001 记录ID
// 1002 创建人
// 1003 更新人
// 1004 创建时间
// 1005 更新时间
// 1006 负责人
// 1007 审批状态
// 1008 记录状态
// 1009 记录类型
// 1011 活动时间
// 1012 实体名称

export const fieldModels = [
  { name: '文本', value: 1, requires: ['maxLength', 'encrypted'] }, // TODO 加defaultValue
  { name: '提示文本', value: 2, requires: ['tipContent', 'tipColor'] },
  { name: '单选', value: 3, requires: ['dataSource', 'defaultValue'] },
  { name: '多选', value: 4, requires: ['dataSource'] },
  { name: '大文本', value: 5, requires: ['defaultValue']},
  { name: '整数文本', value: 6, requires: ['maxLength', 'defaultValue', 'separator'] },
  { name: '小数文本', value: 7, requires: ['maxLength', 'decimalsLength', 'defaultValue', 'separator'] },
  { name: '日期', value: 8, requires: ['format', 'defaultValue'] },
  { name: '日期时间', value: 9, requires: ['format', 'defaultValue'] },
  { name: '手机号', value: 10 },
  { name: '邮箱', value: 11 },
  { name: '电话', value: 12 },
  { name: '地址', value: 13 },
  { name: '定位', value: 14 },
  { name: '头像', value: 15, requires: ['headShape'] },
  { name: '行政区域', value: 16 },
  { name: '团队组织', value: 17, requires: ['multiple'] },
  { name: '数据源', value: 18, requires: ['dataSource', 'multiple'] },
  { name: '分组', value: 20, requires: ['foldable'] },
  // { name: '树形控件', value: 21, disabled: true },
  { name: '图片控件', value: 22, requires: ['pictureType', 'limit'] },
  { name: '附件控件', value: 23, requires: ['limit'] },
  { name: '表格控件', value: 24, requires: ['entityId', 'titleField'] },
  { name: '选人控件', value: 25, requires: ['dataRange', 'multiple'] },
  // { name: '树形控件多选', value: 27 },
  { name: '产品', value: 28, requires: ['multiple'] },
  { name: '产品系列', value: 29, requires: ['multiple'] },
  { name: '引用对象', value: 31, requires: ['originEntity', 'originField', 'controlField'] }
];
