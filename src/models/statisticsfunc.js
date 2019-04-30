import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getstatistics, addstatistics, updatestatistics, deletestatistics, disabledstatistics } from '../services/statistics';
import { getCorrectPager } from '../utils/common';

export default {
  namespace: 'statisticsfunc',
  state: {
    queries: {},
    list: [],
    total: null,
    currentRecords: [],
    showModals: '',
    savePending: false,
    errMsg: ''
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
    *search({ payload: queries }, { select, call, put }) {
      const { total } = yield select(state => state.statisticsfunc);
      const { pageIndex, pageSize } = getCorrectPager({ ...queries, total });
      let { dataSourceName = '', recStatus = 1 } = queries;
      dataSourceName = dataSourceName.slice(0, 20);
      recStatus = parseInt(recStatus);

      const corrected = { pageIndex, pageSize, dataSourceName, recStatus };
      yield put({
        type: 'query',
        payload: corrected
      });
    },
    *query({ payload: queries }, { call, put }) {
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const result = yield call(getstatistics, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            list: result.data
          }
        });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取数据失败');
      }
    },
    *save({ payload: values }, { select, call, put }) {
      const { showModals, currentRecords } = yield select(state => state.statisticsfunc);
      const isEdit = /edit/.test(showModals);

      try {
        yield put({ type: 'savePending' });
        const { allowinto, moreflag, anafuncname_lang, ...rest } = values;
        const params = {
          ...currentRecords[0],
          ...rest,
          anafuncname: anafuncname_lang.cn,
          anafuncname_lang: JSON.stringify(anafuncname_lang),
          allowinto: allowinto ? 1 : 0,
          moreflag: moreflag ? 1 : 0
        };
        yield call(isEdit ? updatestatistics : addstatistics, params);
        yield put({ type: 'hideModal' });
        message.success('保存成功');

        yield put({
          type: 'refreshPage',
          payload: !isEdit
        });
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
        yield put({ type: 'refreshPage', payload: false });
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
        yield put({ type: 'refreshPage', payload: false });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *refreshPage({ payload: resetQuery }, { select, put }) {
      // dangerLocation
      const { query } = yield select(
        ({ routing }) => routing.locationBeforeTransitions
      );
      yield put(routerRedux.replace({
        pathname: '/statisticsfunc',
        query: resetQuery ? undefined : query
      }));
    }
  },
  reducers: {
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
    hideModal(state) {
      return {
        ...state,
        showModals: '',
        savePending: false
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
