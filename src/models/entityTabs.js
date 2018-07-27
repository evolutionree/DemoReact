import { message } from 'antd';
import {
  queryreltablist,
  orderbyreltab,
  getreltabentity,
  addreltab,
  editreltab,
  disabledreltab,
  saverelconfig,
  getrelconfigentity,
  queryFields
} from '../services/entity';

export default {
  namespace: 'entityTabs',
  state: {
    showModals: '',
    errMsg: '',
    tablist: [],
    entityId: null,
    entityList: [],
    configentityList: [],
    currentItem: null,
    modalPending: false,
    entityFieldData: [] //页签统计配置 设置统计过滤条件  所有可选字段
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/tabs/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          dispatch({
            type: 'gotEntityId',
            payload: entityId
          });
          dispatch({
            type: 'query'
          });

          dispatch({
            type: 'queryentityProfield',
            payload: entityId
          });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *query(action, { call, put, select }) {
      try {
        const { entityId } = yield select(state => state.entityTabs);
        const { data: reltablist } = yield call(queryreltablist, entityId);
        const tablist = reltablist;
        const { data } = yield call(getreltabentity, entityId);
        const { data: configentityList } = yield call(getrelconfigentity, entityId);
        const entityList = data;
        yield put({
          type: 'querySuccess',
          payload: { tablist, entityList, configentityList }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *queryentityProfield({ payload: entityId }, { put, call }) {
      try {
        const { data } = yield call(queryFields, entityId);
        const entityFieldData = data.entityfieldpros;
        yield put({
          type: 'putState',
          payload: {
            entityFieldData: entityFieldData.map(item => ({
              controlType: item.controltype,
              fieldId: item.fieldid,
              fieldLabel: item.fieldlabel,
              fieldConfig: item.fieldconfig,
              recStatus: item.recstatus,
              fieldName: item.fieldname,
              displayName: item.displayname
            }))
          }
        });
      } catch (e) {
        message.error(e.message || '查询数据失败');
      }
    },
    *up({ payload: index }, { call, put, select }) {
      const reltablist = yield select(state => state.entityTabs.tablist.reltablist);
      const tmpItem = reltablist[index];
      reltablist[index] = reltablist[index - 1];
      reltablist[index - 1] = tmpItem;
      const RelIds = reltablist.map(item => item.relid);
      const entityId = yield select(state => state.entityTabs.entityId);
      try {
        yield call(orderbyreltab, RelIds);
        yield put({
          type: 'query',
          payload: {
            entityId
          }
        });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *down({ payload: index }, { call, put, select }) {
      const reltablist = yield select(state => state.entityTabs.tablist.reltablist);
      const tmpItem = reltablist[index];
      reltablist[index] = reltablist[index + 1];
      reltablist[index + 1] = tmpItem;
      const RelIds = reltablist.map(item => item.relid);
      const entityId = yield select(state => state.entityTabs.entityId);
      try {
        yield call(orderbyreltab, RelIds);
        yield put({
          type: 'query',
          payload: {
            entityId
          }
        });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *save({ payload: formValues }, { call, put, select }) {
      const { entityId, showModals, currentItem } = yield select(state => state.entityTabs);
      const isAdd = /add/.test(showModals);
      const params = { ...formValues, entityId };
      let postFn;
      if (isAdd) {
        // params.type = 0;
        postFn = addreltab;
      } else {
        params.type = currentItem.relentityid ? 0 : 1;
        params.relid = currentItem.relid;
        postFn = editreltab;
      }

      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(postFn, params);
        message.success(isAdd ? '新增成功' : '修改成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'query', payload: { entityId } });
      } catch (e) {
        message.error(e.message || (isAdd ? '新增失败' : '修改失败'));
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *disabledreltab({ payload: RelId }, { call, put, select }) {
      const entityId = yield select(state => state.entityTabs.entityId);
      try {
        yield call(disabledreltab, RelId);
        yield put({
          type: 'query',
          payload: {
            entityId
          }
        });
        message.success('禁用成功');
      } catch (e) {
        message.error(e.message || '禁用失败');
      }
    },
    *setCountRule({ payload: params }, { call, put, select }) {
      const { entityId, RelId } = yield select(state => state.entityTabs);
      let Configs = params.configs.map(item => {
        item.entityId = entityId;
        item.RelId = RelId;
        item.entityrule = item.entityrule ? {
          ...item.entityrule,
          ruleitems: item.entityrule.ruleitems instanceof Array && item.entityrule.ruleitems.map(ruleItem => {
            ruleItem.ruledata = typeof ruleItem.ruledata !== 'string' ? JSON.stringify(ruleItem.ruledata) : ruleItem.ruledata;
            return ruleItem;
          })
        } : null;
        return item;
      });

      let submitData = { RelId };
      submitData.configs = Configs;
      submitData.configsets = params.configsets;
      try {
        yield call(saverelconfig, submitData);
        yield put({
          type: 'query',
          payload: {
            entityId
          }
        });
        yield put({ type: 'showModals', payload: '' });
        message.success('更新成功');
      } catch (e) {
        message.error(e.message || '更新失败');
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
    gotEntityId(state, { payload: entityId }) {
      return {
        ...state,
        entityId: entityId
      };
    },
    edit(state, { payload: record }) {
      return {
        ...state,
        currentItem: record,
        showModals: 'edit'
      };
    },
    showModals(state, { payload }) {
      if (!payload) {
        return {
          ...state,
          showModals: '',
          currentItem: null
        };
      }
      return { ...state, showModals: payload };
    },
    querySuccess(state, { payload: { tablist, entityList, configentityList } }) {
      return {
        ...state,
        entityList,
        configentityList,
        tablist
      };
    },
    modalPending(state, { payload }) {
      return {
        ...state,
        modalPending: payload
      };
    },
    resetState() {
      return {
        showModals: '',
        errMsg: '',
        tablist: [],
        entityId: null,
        entityList: [],
        configentityList: [],
        currentItem: null,
        modalPending: false,
        entityFieldData: [] //页签统计配置 设置统计过滤条件  所有可选字段
      };
    }
  }
};
