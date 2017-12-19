import _ from 'lodash';
import FilterConfigBoard from './FilterConfigBoard';

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
      fieldId: item.fieldid,
      operator: item.operate,
      ruleData: item.ruledata,
      ruleType: item.ruletype
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
      itemname: `规则${index + 1}`,
      entityid: entityId,
      controltype,
      fieldid: rule.fieldId || defaultUUID,
      operate: rule.operator || '',
      ruledata: JSON.stringify(rule.ruleData),
      ruletype,
      usetype: 0,
      relation: {
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


export default FilterConfigBoard;

