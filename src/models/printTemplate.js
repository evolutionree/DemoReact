import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { query as queryEntities } from '../services/entity';
import {
  queryPrintTemplates, addPrintTemplates, updatePrintTemplates,
  togglePrintTemplatesStatus, deletePrintTemplates, saveConfigJS, haspaaspermission
} from '../services/printTemplate';

export default {
  namespace: 'printTemplate',
  state: {
    queries: {},
    list: [],
    total: 0,
    currentItems: [],
    entitySearchKey: '',
    entities: [],
    showModals: '',
    modalPending: false,
    Haspaaspermission: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/print-template') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryEntities({ payload: selectEntityId }, { select, call, put }) {
      try {
        yield put({ type: 'Haspaaspermission' });

        const { entitySearchKey } = yield select(state => state.printTemplate);
        const params = {
          pageIndex: 1,
          pageSize: 999,
          status: 1,
          entityName: entitySearchKey || '',
          typeId: -1,
          typeids: '0,1'
        };
        const { data } = yield call(queryEntities, params);
        const entities = data.pagedata.filter(item => item.modeltype === 0 || item.modeltype === 2);
        yield put({ type: 'putState', payload: { entities: entities } });
        if (entities && entities.length) {
          yield put({
            type: 'selectEntity',
            payload: selectEntityId || entities[0].entityid
          });
        }
      } catch (e) {
        message.error(e.message || '获取数据实体失败');
      }
    },
    *searchEntity({ payload: searchKey }, { put }) {
      yield put({ type: 'putState', payload: { entitySearchKey: searchKey } });
      yield put({ type: 'queryEntities' });
    },
    *selectEntity({ payload: entityId }, { put }) {
      yield put({ type: 'search', payload: { entityId: entityId } });
    },
    *search({ payload }, { select, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          ...payload
        }
      }));
    },
    *queryList(action, { put, call, select }) {
      const { query } = yield select(state => state.routing.locationBeforeTransitions);
      const { entities } = yield select(state => state.printTemplate);
      if (!entities.length) {
        yield put({ type: 'queryEntities', payload: query.entityId });
        return;
      }
      try {
        const params = {
          recState: '1',
          ...query
        };
        yield put({ type: 'putState', payload: { queries: params } });
        const { data } = yield call(queryPrintTemplates, params);
        yield put({ type: 'putState', payload: { list: data, currentItems: [] } });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *save({ payload: data }, { call, put }) {
      yield put({ type: 'putState', payload: { modalPending: true } });
      try {
        if (data.recid) {
          yield call(updatePrintTemplates, data);
        } else {
          yield call(addPrintTemplates, data);
        }
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        yield put({ type: 'putState', payload: { modalPending: false } });
        message.error(e.message || '保存失败');
      }
    },
    *del(action, { select, put, call }) {
      try {
        const { currentItems } = yield select(state => state.printTemplate);
        const params = {
          recids: currentItems.map(i => i.recid)
        };
        yield call(deletePrintTemplates, params);
        message.success('操作成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *toggleStatus(action, { select, put, call }) {
      try {
        const { currentItems } = yield select(state => state.printTemplate);
        const params = {
          recids: currentItems.map(i => i.recid),
          recstatus: currentItems[0].recstatus ? 0 : 1
        };
        yield call(togglePrintTemplatesStatus, params);
        message.success('操作成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *saveconfigJS({ payload: { recid, ucode } }, { put, call }) {
      yield put({ type: 'modalPending', payload: true });

      try {
        const params = { recid, ucode };
        yield call(saveConfigJS, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *Haspaaspermission(_, { put, call }) {
      try {
        const params = {};
        const { data: Haspaaspermission } = yield call(haspaaspermission, params);
        yield put({ type: 'putState', payload: { Haspaaspermission } });
      } catch (e) {
        message.error(e.message || '请求失败');
        yield put({ type: 'modalPending', payload: false });
      }
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        queries: {},
        list: [],
        total: 0,
        currentItems: [],
        entitySearchKey: '',
        entities: [],
        showModals: '',
        modalPending: false
      }
    }
  }
};
