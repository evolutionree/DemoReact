import { message } from 'antd';
import _ from 'lodash';
import { queryFields, query as queryEntities, saveEntityQueryRule } from '../services/entity';
import { queryRoleRule } from '../services/role';
import { ruleListToItems } from '../components/FilterConfigBoard';

export default {
  namespace: 'roleRule',
  state: {
    roleId: null,
    entities: [],
    currEntity: '',
    ruleDetail: {},
    fields: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/role\/([^/]+)\/([^/]+)\/([^/]+)\/rule/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const roleId = match[1];
          const roleType = match[2];
          dispatch({
            type: 'gotRoleInfo',
            payload: {
              roleId,
              roleType
            }
          });
          dispatch({ type: 'queryEntities' });
        }
      });
    }
  },
  effects: {
    *queryEntities(action, { put, call }) {
      try {
        const params = {
          pageIndex: 1,
          pageSize: 999,
          status: 1,
          entityName: '',
          typeId: -1 // 独立实体
        };
        const { data } = yield call(queryEntities, params);
        const entities = data.pagedata.filter(item => item.modeltype === 0 || item.modeltype === 2 || item.modeltype === 3);
        yield put({ type: 'queryEntitiesSuccess', payload: entities });
        if (entities && entities.length) {
          yield put({
            type: 'selectEntity',
            payload: entities[0].entityid
          });
        }
      } catch (e) {
        console.error(e);
        message.error('查询数据失败');
      }
    },
    *selectEntity({ payload: entityId }, { select, put, call }) {
      try {
        yield put({ type: 'currEntity', payload: entityId });
        // yield put({ type: 'queryFields', payload: entityId });
        // yield put({ type: 'queryRuleDetail', payload: entityId });

        const { data: fielddata } = yield call(queryFields, entityId);
        const roleId = yield select(state => state.roleRule.roleId);
        const { data: ruledata } = yield call(queryRoleRule, { roleId, entityId });
        yield put({
          type: 'putState',
          payload: {
            fields: fielddata.entityfieldpros.map(item => ({
              controlType: item.controltype,
              fieldId: item.fieldid,
              fieldLabel: item.fieldlabel,
              fieldConfig: item.fieldconfig,
              recStatus: item.recstatus
            })),
            ruleDetail: ruledata[0] || {}
          }
        });

        yield put({ type: 'queryDataSuccess' });
      } catch (err) {
        message.error('获取数据失败');
        yield put({ type: 'queryDataFail' });
      }
    },
    *queryFields({ payload: entityId }, { put, call }) {
      const { data } = yield call(queryFields, entityId);
      yield put({ type: 'queryFieldsSuccess', payload: data.entityfieldpros });
    },
    *queryRuleDetail({ payload: entityId }, { select, put, call }) {
      const roleId = yield select(state => state.roleRule.roleId);
      const { data } = yield call(queryRoleRule, { roleId, entityId });
      yield put({ type: 'queryRuleDetailSuccess', payload: data[0] });
    },
    *saveRule({ payload: data }, { select, put, call }) {
      const { ruleList, ruleSet } = data;
      const { roleId, currEntity, ruleDetail, fields } = yield select(state => state.roleRule);
      const params = {
        typeid: 0,
        id: ruleDetail.ruleid,
        ruleid: ruleDetail.ruleid,
        roleid: roleId,
        entityid: currEntity,
        rulename: '',
        // ruleitems: ruleList.map(ruleToItem),
        ruleitems: ruleListToItems(ruleList, fields, currEntity),
        ruleset: {
          ruleset: ruleSet,
          userid: 0,
          ruleformat: ''
        }
      };
      try {
        yield call(saveEntityQueryRule, params);
        message.success('保存成功');
        yield put({ type: 'query' });
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    gotRoleInfo(state, { payload }) {
      return {
        ...state,
        roleId: payload.roleId,
        roleType: payload.roleType
      };
    },
    queryEntitiesSuccess(state, { payload: entities }) {
      return {
        ...state,
        entities
      };
    },
    queryFieldsSuccess(state, { payload: fields }) {
      const formatFields = fields.map(item => ({
        controlType: item.controltype,
        fieldId: item.fieldid,
        fieldLabel: item.fieldlabel
      }));
      return {
        ...state,
        fields: formatFields
      };
    },
    queryRuleDetailSuccess(state, { payload: ruleDetail }) {
      return {
        ...state,
        ruleDetail: ruleDetail || {}
      };
    },
    queryDataSuccess(state) {
      return {
        ...state,
        errMsg: ''
      };
    },
    queryDataFail(state) {
      return {
        ...state,
        fields: [],
        ruleDetail: {},
        errMsg: '加载规则出错'
      };
    },
    currEntity(state, { payload: entityId }) {
      return {
        ...state,
        currEntity: entityId
      };
    }
  }
};
