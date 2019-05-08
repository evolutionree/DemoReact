import { message } from 'antd';
import { getstatistics, addstatistics, updatestatistics, deletestatistics, disabledstatistics } from '../services/statistics';
import { getCorrectPager } from '../utils/common';

export default {
  namespace: 'statisticsfunc',
  state: {
    queries: {},
    list: [],
    cacheList: [],
    total: null,
    currentRecords: [],
    showModals: '',
    savePending: false,
    errMsg: '',
    checked: true
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/statisticsfunc') {
          dispatch({
            type: 'search',
            payload: location.query
          });
        }
      });
    }
  },
  effects: {
    *search({ payload: queries = {} }, { select, put }) {
      const { total } = yield select(state => state.statisticsfunc);
      const { pageIndex, pageSize } = getCorrectPager({ ...queries, total });
      let { dataSourceName = '', recStatus = 1 } = queries;
      dataSourceName = dataSourceName.slice(0, 20);
      recStatus = parseInt(recStatus, 10);

      const corrected = { pageIndex, pageSize, dataSourceName, recStatus };
      yield put({
        type: 'query',
        payload: corrected
      });
    },
    *query({ payload: queries }, { call, put, select }) {
      const { checked } = yield select(state => state.statisticsfunc);
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const result = yield call(getstatistics, queries);
        yield put({
          type: 'putState',
          payload: {
            list: result.data.filter(item => !!item.recstatus === checked),
            cacheList: result.data
          }
        });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取数据失败');
      }
    },
    *save({ payload }, { select, call, put }) {
      const { currentRecords } = yield select(state => state.statisticsfunc);
      const { values, resolve, isEdit } = payload;

      try {
        yield put({ type: 'savePending' });
        const { allowinto, moreflag, anafuncname_lang, ...rest } = values;

        const params = {
          ...rest,
          anafuncid: currentRecords ? currentRecords[0].anafuncid : null,
          anafuncname: anafuncname_lang.cn,
          anafuncname_lang: JSON.stringify(anafuncname_lang),
          allowinto: allowinto ? 1 : 0,
          moreflag: moreflag ? 1 : 0
        };
        const res = yield call(isEdit ? updatestatistics : addstatistics, params);
        if (resolve) resolve(res);
        yield put({ type: 'search' });
      } catch (e) {
        yield put({ type: 'savePending', payload: false });
        message.error(e.message || '保存失败');
      }
    },
    *del({ payload: records }, { call, put }) {
      try {
        const params = {
          AnaFuncIds: Array.isArray(records) ? records.map(o => o.anafuncid) : []
        };
        yield call(deletestatistics, params);
        message.success('删除成功');
        yield put({ type: 'currentRecords', payload: [] });
        yield put({ type: 'search' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *use({ payload }, { call, put }) {
      const { currentRecords, isUse } = payload;
      try {
        const params = {
          AnaFuncIds: currentRecords.map(o => o.anafuncid),
          recstatus: isUse ? 0 : 1
        };
        yield call(disabledstatistics, params);
        message.success('操作成功');
        yield put({ type: 'currentRecords', payload: [] });
        yield put({ type: 'search' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *disable(_, { put, select }) {
      const { checked, cacheList } = yield select(state => state.statisticsfunc);
      const result = cacheList.filter(item => checked === (!item.recstatus));
      yield put({ type: 'putState', payload: { checked: !checked, list: result } });
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    queryRequest(state, { payload: queries }) {
      return {
        ...state,
        queries
      };
    },
    querySuccess(state, { payload }) {
      const { list, total } = payload;
      return {
        ...state,
        list,
        total,
        currentRecords: []
      };
    },
    savePending(state, { payload }) {
      return {
        ...state,
        savePending: payload !== undefined ? payload : true
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals
      };
    },
    hideModal(state, { payload }) {
      const { currentRecords } = payload;
      return {
        ...state,
        showModals: '',
        savePending: false,
        currentRecords
      };
    },
    currentRecords(state, { payload: records }) {
      return {
        ...state,
        currentRecords: records
      };
    }
  }
};
