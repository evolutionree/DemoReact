import { message } from 'antd';
import {
  queryEntityDetail,
  queryFields,
  queryDynamicRuleInfo,
  saveEntityQueryRule
} from '../services/entity';
import { parseRuleDetail, ruleListToItems } from '../components/FilterConfigBoard';

export default {
  namespace: 'entityDynamicVisible',
  state: {
    entityId: '',
    relFields: [],
    relEntityId: '',
    ruleDetail: undefined,
    ruleList: [],
    ruleSet: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/dynamic-visible/;
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
          dispatch({
            type: 'queryRelFields'
          });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryRelFields(action, { select, put, call }) {
      try {
        const { entityId } = yield select(state => state.entityDynamicVisible);
        const res = yield call(queryEntityDetail, entityId);
        const relEntityId = res.data.entityproinfo[0].relentityid;
        const res2 = yield call(queryFields, relEntityId);
        const relFields = res2.data.entityfieldpros.map(field => ({
          controlType: field.controltype,
          fieldId: field.fieldid,
          fieldLabel: field.fieldlabel,
          fieldConfig: field.fieldconfig,
          recStatus: field.recstatus
        }));
        yield put({
          type: 'relEntityId',
          payload: relEntityId
        });
        yield put({
          type: 'relFields',
          payload: relFields
        });
        yield put({
          type: 'queryRuleDetail'
        });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取数据出错');
      }
    },
    *queryRuleDetail(action, { select, put, call }) {
      try {
        const { entityId } = yield select(state => state.entityDynamicVisible);
        const result = yield call(queryDynamicRuleInfo, entityId);
        const ruleDetail = result.data[0] || {};
        yield put({
          type: 'queryRuleDetailSuccess',
          payload: ruleDetail
        });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取数据出错');
      }
    },
    *save(action, { select, put, call }) {
      const {
        ruleList,
        ruleSet,
        entityId,
        ruleDetail,
        relFields,
        relEntityId
      } = yield select(state => state.entityDynamicVisible);
      const params = {
        typeid: 2,
        id: ruleDetail.ruleid,
        ruleid: ruleDetail.ruleid,
        entityid: entityId,
        relentityid: relEntityId,
        rulename: '',
        ruleitems: ruleListToItems(ruleList, relFields, relEntityId),
        ruleset: {
          ruleset: ruleSet,
          userid: 0,
          ruleformat: ''
        }
      };
      try {
        yield call(saveEntityQueryRule, params);
        message.success('保存成功');
        yield put({ type: 'queryRuleDetail' });
      } catch (err) {
        console.error(err);
        message.error(err.message || '保存失败');
      }
    }
  },
  reducers: {
    gotEntityInfo(state, { payload: entityInfo }) {
      const { entityId, entityType } = entityInfo;
      return { ...state, entityId, entityType };
    },
    relFields(state, { payload: relFields }) {
      return { ...state, relFields };
    },
    queryRuleDetailSuccess(state, { payload: ruleDetail }) {
      const { ruleList, ruleSet } = parseRuleDetail(ruleDetail);
      return {
        ...state,
        ruleList,
        ruleSet,
        ruleDetail
      };
    },
    ruleList(state, { payload: ruleList }) {
      return { ...state, ruleList };
    },
    ruleSet(state, { payload: ruleSet }) {
      return { ...state, ruleSet };
    },
    relEntityId(state, { payload: relEntityId }) {
      return { ...state, relEntityId };
    },
    resetState() {
      return {
        entityId: '',
        relFields: [],
        relEntityId: '',
        ruleDetail: undefined,
        ruleList: [],
        ruleSet: ''
      };
    }
  }
};
