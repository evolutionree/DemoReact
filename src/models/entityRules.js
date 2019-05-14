import _ from 'lodash';
import { message } from 'antd';
import { queryFields, queryTypes, queryRules, queryRulesByVocation, saveRules, saveRulesByVocation } from '../services/entity';
import { queryVocations } from '../services/functions';

export default {
  namespace: 'entityRules',
  state: {
    entityId: null,
    allFields: [],
    rules: null,
    isSavePending: false,
    menus: [],
    useType: 0, // 0 按分类设置，1 按职能设置
    currentMenu: '', // 存的是id
    list: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/rules/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'gotEntityInfo',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({ type: 'queryAllFields', payload: entityId });

          const query = location.query;
          dispatch({ type: 'queryMenus' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryAllFields({ payload: entityId }, { put, call }) {
      const { data } = yield call(queryFields, entityId);
      yield put({ type: 'queryAllFieldsSuccess', payload: data.entityfieldpros });
    },
    *queryMenus(action, { select, put, call }) {
      const { entityId, useType } = yield select(({ entityRules }) => entityRules);
      let menus = [];
      if (useType === 0) {
        const result = yield call(queryTypes, { entityId });
        menus = result.data.entitytypepros.map(item => ({
          menuName: item.categoryname,
          menuId: item.categoryid
        }));
      } else {
        const result = yield call(queryVocations, { pageIndex: 1, pageSize: 9999, vocationName: '' });
        menus = result.data.datacursor.map(item => ({
          menuName: item.vocationname,
          menuId: item.vocationid
        }));
      }
      yield put({ type: 'queryMenusSuccess', payload: menus });
      yield put({ type: 'queryRules' });
    },
    *queryRules(action, { select, put, call }) {
      const { entityId, currentMenu, useType } = yield select(({ entityRules }) => entityRules);
      let result = {};
      if (useType === 0) {
        result = yield call(queryRules, { entityId, typeId: currentMenu, useType });
      } else {
        result = yield call(queryRulesByVocation, { entityId, vocationid: currentMenu });
      }
      yield put({ type: 'queryRulesSuccess', payload: result.data });
    },
    *saveRules({ payload: newRules }, { select, put, call }) {
      const { useType, entityId, currentMenu } = yield select(({ entityRules }) => entityRules);
      let result = null;
      try {
        if (useType === 0) {
          result = yield call(saveRules, newRules);
        } else {
          const fieldRules = newRules.map(item => ({
            ...item,
            recstatus: item.recstatus === 1 ? 0 : 1,
            vocationid: currentMenu
          }));
          const params = {
            entityId,
            fieldRules
          };
          result = yield call(saveRulesByVocation, params);
        }
      } catch (e) {
        message.error(e.message || '保存失败');
      }
      if (result) {
        message.success('保存成功');
        yield put({ type: 'saveRulesSuccess' });
        yield put({ type: 'queryRules' });
      }
    },
    *selectUseType({ payload: useType }, { put, call }) {
      yield put({ type: 'putState', payload: { useType, rules: [], list: [] } });
      yield put({ type: 'queryMenus' });
    },
    *selectMenu({ payload }, { put, call }) {
      yield put({ type: 'setMenu', payload });
      yield put({ type: 'queryRules' });
    }
  },
  reducers: {
    queryAllFieldsSuccess(state, { payload: allFields }) {
      return { ...state, allFields };
    },
    queryMenusSuccess(state, { payload: menus }) {
      return {
        ...state,
        menus,
        currentMenu: menus.length ? menus[0].menuId : ''
      };
    },
    // 获取到新的rule后，需要生成list供表格使用
    queryRulesSuccess(state, { payload: rules }) {
      function generateCurrentList() {
        const alreadyExistRules = _.cloneDeep(rules);
        const allEnabledFields = allFields.filter(item => item.recstatus === 1);

        const allRules = allEnabledFields.map((field) => {
          const id = field.fieldid;

          // 先检查rule是否已经有了，没有则init一个
          let rule = _.find(alreadyExistRules, item => item.fieldid === id);
          if (!rule) {
            rule = initRule(field);
          } else {
            rule.rules = completeSubRules(rule.rules);
          }
          rule.displayname = field.displayname;
          rule.displayname_lang = field.displayname_lang;
          rule.order = field.row_number;
          rule.controlType = field.controltype;
          return rule;
        });

        return allRules.map(item => {
          return {
            ...item,
            ...flattenRule(item)
          };
        });
      }
      function completeSubRules(subRules) {
        // 补充子规则
        return [0, 1, 2, 4, 5].map(type => {
          let retRule = _.find(subRules, ['operatetype', type]);
          if (!retRule) {
            retRule = {
              fieldrulesid: '',
              operatetype: type,
              isvisible: 0,
              isreadonly: type === 2 ? 1 : 0,
              isrequired: 0,
              viewrule: { isReadOnly: type === 2 ? 1 : 0, isVisible: 0, style: 1 },
              validrule: { isRequired: 0 }
            };
          }
          return retRule;
        });
      }
      function initRule(field) {
        // 生成新增编辑查看各子规则
        const ADD = 0;
        const EDIT = 1;
        const DETAIL = 2;
        const IMPORT = 4;
        const SYNC = 5;
        const subRules = [ADD, EDIT, DETAIL, IMPORT, SYNC].map(type => {
          const readonly = type === DETAIL ? 1 : 0;
          return {
            fieldrulesid: '',
            operatetype: type,
            isvisible: 1,
            isreadonly: readonly,
            isrequired: 0,
            viewrule: { isReadOnly: readonly, isVisible: 1, style: 1 },
            validrule: { isRequired: 0 }
          };
        });
        return {
          typeid: typeId,
          fieldid: field.fieldid,
          fieldlabel: field.fieldlabel,
          recstatus: 0,
          rules: subRules
        };
      }
      function flattenRule(rule) {
        return rule.rules.reduce((retObj, rule) => {
          const opType = rule.operatetype;
          const usage = ['add', 'edit', 'detail', null, 'import', 'sync'][opType];
          retObj[`rule-${usage}-isVisible`] = !!rule.isvisible;
          retObj[`rule-${usage}-isRequired`] = !!rule.isrequired;
          retObj[`rule-${usage}-isReadOnly`] = !!rule.isreadonly;
          return retObj;
        }, {});
      }

      const { allFields, useType, currentMenu: typeId } = state;
      if (useType === 1) {
        rules.forEach(item => {
          item.recstatus = item.recstatus === 1 ? 0 : 1;
        });
      }
      const list = generateCurrentList();
      return { ...state, rules, list };
    },
    saveRulesSuccess(state) {
      return { ...state, isSavePending: false };
    },
    setMenu(state, { payload: key }) {
      return { ...state, currentMenu: key };
    },
    checkboxChange(state, { payload }) {
      const { key, value, index } = payload;
      const newList = state.list.slice();
      newList[index][key] = value ? 1 : 0;

      // 将外层的key如 rule-add-isVisible 同步到 rules 里对应规则
      const match = key.match(/rule-(\w+)-(\w+)/);
      if (match) {
        const [i, operationTypeStr, innerKey] = match;
        const operationType = ['add', 'edit', 'detail', null, 'import', 'sync'].indexOf(operationTypeStr);
        const subRule = newList[index].rules.find(item => item.operatetype === operationType);
        const boolVal = value ? 1 : 0;
        if (innerKey === 'isVisible') {
          subRule.isvisible = boolVal;
          subRule.viewrule && (subRule.viewrule.isVisible = boolVal);
        } else if (innerKey === 'isRequired') {
          subRule.isrequired = boolVal;
          subRule.validrule && (subRule.validrule.isRequired = boolVal);
        } else {
          subRule.isreadonly = boolVal;
          subRule.viewrule && (subRule.viewrule.isReadOnly = boolVal);
        }
      } else if (key === 'recstatus' && value === false && state.useType === 0) {
        Object.keys(newList[index]).forEach(k => {
          if (/^rule-/.test(k)) {
            newList[index][k] = false;
          }
        });
        newList[index].rules.forEach(subRule => {
          subRule.isvisible = 0;
          subRule.viewrule && (subRule.viewrule.isVisible = 0);
          subRule.isrequired = 0;
          subRule.validrule && (subRule.validrule.isRequired = 0);
          subRule.isreadonly = 0;
          subRule.viewrule && (subRule.viewrule.isReadOnly = 0);
        });
      }

      return { ...state, list: newList };
    },
    styleChange(state, { payload: newStyleId }) {
      const newList = _.cloneDeep(state.list);
      newList.forEach(item => {
        item.rules.forEach(rule => {
          rule.viewrule.style = newStyleId;
        });
      });
      return { ...state, list: newList };
    },
    gotEntityInfo(state, { payload: entityInfo }) {
      return {
        ...state,
        entityId: entityInfo.entityId,
        entityType: entityInfo.entityType
      };
    },
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    resetState() {
      return {
        entityId: null,
        allFields: [],
        rules: null,
        isSavePending: false,
        menus: [],
        useType: 0, // 0 按分类设置，1 按职能设置
        currentMenu: '' // 存的是id
      };
    }
  }
};
