import _ from 'lodash';
import FilterConfigBoard from './FilterConfigBoard';

const workflowFields = [
  {
    isWorkflow: true,
    controlType: 2001,
    fieldId: '00000000-0000-0000-0000-000000000000',
    fieldLabel: '发起人',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2002,
    fieldId: '00000000-0000-0000-0000-000000000001',
    fieldLabel: '发起人部门',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2003,
    fieldId: '00000000-0000-0000-0000-000000000002',
    fieldLabel: '发起人上级部门',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2004,
    fieldId: '00000000-0000-0000-0000-000000000003',
    fieldLabel: '发起人角色',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2005,
    fieldId: '00000000-0000-0000-0000-000000000004',
    fieldLabel: '发起人是否是领导',
    fieldConfig: {},
    recStatus: 1
  }
];

export const parseRuleDetail = ruleDetail => {
  if (!ruleDetail || !ruleDetail.ruleset) {
    return {
      ruleList: [],
      ruleSet: ''
    };
  }
  const ruleSet = ruleDetail.ruleset.ruleset || '';
  const ruleList = [];
  ruleDetail.ruleitems.forEach(item => {
    if (item.ruletype === undefined) return;
    if (item.ruletype !== 2 && (!item.fieldid || !item.operate || !item.ruledata)) return;
    if (item.ruletype === 2 && !item.ruledata) return;
    const rule = {
      itemid: item.itemid,
      fieldId: item.fieldid,
      operator: item.operate,
      ruleData: typeof item.ruledata === 'string' ? JSON.parse(item.ruledata) : item.ruledata,
      ruleType: item.ruletype,
      entityId: item.entityid
    };
    if (rule.ruleType > 2000) {
      rule.ruleType = 20;
    }
    ruleList.push(rule);
  });
  return {
    ruleSet,
    ruleList
  };
};

export const ruleListToItems = (ruleList, fields, entityId) => {
  return ruleList.map(function ruleToItem(rule, index) {
    const defaultUUID = '00000000-0000-0000-0000-000000000000';
    const controltype = getControlType(rule.fieldId, fields);
    const ruletype = rule.ruleType === 20 ? controltype : rule.ruleType;
    return {
      itemid: rule.itemid,
      itemname: `规则${index + 1}`,
      entityid: entityId,
      controltype,
      fieldid: rule.fieldId || defaultUUID,
      operate: rule.operator || '',
      ruledata: JSON.stringify(rule.ruleData),
      ruletype,
      usetype: 0,
      relation: {
        itemid: rule.itemid,
        userid: 0,
        rolesub: 1, // userid为0，则rolesub为1；否则为0
        paramindex: 1
      }
    };
    function getControlType(fieldId) {
      const field = _.find(fields, item => item.fieldId === fieldId);
      return field && field.controlType;
    }
  });
};


export const getAllFields = (flowEntities) => {
  const oldFields = _.flatMap(flowEntities, item => item.fields)
    .map(field => ({
      controlType: field.controltype,
      fieldId: field.fieldid,
      fieldLabel: field.fieldlabel,
      fieldConfig: field.fieldconfig,
      recStatus: field.recstatus,
      entityId: field.entityid
    }));
  const allFields = [...oldFields, ...workflowFields]

  return allFields
}


export default FilterConfigBoard;

