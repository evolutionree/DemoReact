/**
 * Created by 0291 on 2017/7/28.
 */
import { message } from 'antd';
import { querysalesstageset, insertsalesstageeventset, updatesalesstageeventset, querysalesstageinfofields, disabledsalesstageeventset, querysalesstagerelentity,
  addsalesstagedyentitysetting, savesalesstageoppinfosetting   } from '../services/saleStage.js';
import { GetArgsFromHref } from '../utils/index.js';

export default {
  namespace: 'saleStageDetailSet',
  state: {
    showModals: '',
    salesstageevent: [],
    salesstageoppinfo: [],
    salesstagedynentity: [],
    keyInfo: {
      salesstageoppinfo: [],
      salesstageoppinfovi: []
    },
    customFormDataSource: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/salestage/detail') {
          const businessTypeActiveId = GetArgsFromHref('busintypeid');
          const salesstageid = GetArgsFromHref('salesstageid');
          dispatch({ type: 'putState', payload: { businessTypeActiveId, salesstageid } });
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: queries }, { select, put }) {
      const { salesstageid } = yield select(state => state.saleStageDetailSet);
      yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      yield put({ type: 'querysalesstagerelentity', payload: { } });
    },
    *querySalesStageSet({ payload: params }, { select, put, call }) {
      try {
        const { data } = yield call(querysalesstageset, params);
        yield put({
          type: 'querySuccess',
          payload: { ...data }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *querysalesstagerelentity({ payload: params }, { select, put, call }) {
      try {
        const { data } = yield call(querysalesstagerelentity, params);
        yield put({
          type: 'querySuccess',
          payload: { customFormDataSource: data.salesstagerelentity }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *addAssign({ payload: payload }, { select, put, call }) {
      const { salesstageid } = yield select(state => state.saleStageDetailSet);
      const params = {
        eventName: payload.eventName,
        isNeedUpFile: payload.isNeedUpFile ? 1 : 0,
        salesstageid
      }
      try {
        yield call(insertsalesstageeventset, params);
        yield put({ type: 'showModal', payload: '' });
        yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      } catch (e) {
        message.error(e.message || '添加失败');
      }
    },
    *updateAssign({ payload: params }, { select, put, call }) {
      const { salesstageid } = yield select(state => state.saleStageDetailSet);
      try {
        yield call(updatesalesstageeventset, params);
        yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *delAssign({ payload: payload }, { select, put, call }) {
      const { salesstageid } = yield select(state => state.saleStageDetailSet);
      try {
        yield call(disabledsalesstageeventset, { eventsetid: payload.eventsetid });
        yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },

    *querysalesstageinfofields({ payload: payload }, { select, put, call }) {
      const { businessTypeActiveId, salesstageid } = yield select(state => state.saleStageDetailSet);
      const params = {
        entityId: "2c63b681-1de9-41b7-9f98-4cf26fd37ef1",
        salesstageid,
        salesStageTypeId: businessTypeActiveId
      };
      try {
        const { data } = yield call(querysalesstageinfofields, params);
        yield put({
          type: 'querySuccess',
          payload: { keyInfo: data }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *saveKeyInfo({ payload: payload }, { select, put, call }) {
      const { businessTypeActiveId, salesstageid } = yield select(state => state.saleStageDetailSet);
      const fieldIds = payload.salesstageoppinfovi.map((item) => {
        return item.fieldid;
      });
      const params = {
        entityId: "2c63b681-1de9-41b7-9f98-4cf26fd37ef1",
         FieldIds: fieldIds.join(','),
        salesstageid
      };
      try {
        yield call(savesalesstageoppinfosetting, params);
        yield put({ type: 'showModal', payload: '' });
        yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },

    *delKeyInfo({ payload: delfieldid }, { select, put, call }) {
      const { businessTypeActiveId, salesstageid } = yield select(state => state.saleStageDetailSet);
      const params = {
        entityId: "2c63b681-1de9-41b7-9f98-4cf26fd37ef1",
        salesstageid,
        salesStageTypeId: businessTypeActiveId
      };
      try {
        const { data } = yield call(querysalesstageinfofields, params);
        let submitData = data;
        submitData.salesstageoppinfovi = data.salesstageoppinfovi.filter((filter, index) => {
          return filter.fieldid !== delfieldid;
        });
        yield put({ type: 'saveKeyInfo', payload: submitData });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *customFormSelect({ payload: relEntityId }, { select, put, call }) {
      const { salesstageid } = yield select(state => state.saleStageDetailSet);
      const params = {
        relEntityId: relEntityId ? relEntityId : 'empty',
        salesstageid
      }
      try {
        yield call(addsalesstagedyentitysetting, params);
        yield put({ type: 'querySalesStageSet', payload: { salesstageid } });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    }
  },
  reducers: {
    queryRequest(state) {
      return { ...state };
    },
    querySuccess(state, { payload: result }) {
      return {
        ...state,
        ...result
      };
    },
    queryFailure(state) {
      return { ...state };
    },

    showModal(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      }
    },

    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  }
};
