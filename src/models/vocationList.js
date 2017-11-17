import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { queryVocations, updateVocation, addVocation, delVocations, copyVocation } from '../services/functions';
import { getCorrectPager } from '../utils/common';

const _ = require('lodash');

export default {
  namespace: 'vocationList',
  state: {

    queries: {},
    list: [],
    total: null,
    currentRecords: [],
    showModals: '',
    savePending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/vocations') {
          dispatch({
            type: 'search',
            payload: location.query
          });
        } else {
          dispatch({
            type: 'resetState'
          });
        }
      });
    }
  },
  effects: {
    *search({ payload: queries }, { select, call, put }) {
      const { total } = yield select(state => state.vocationList);
      const { pageIndex, pageSize } = getCorrectPager({ ...queries, total });
      let { vocationName } = queries;
      vocationName = (vocationName && vocationName.slice(0, 20)) || '';
      const corrected = { pageIndex, pageSize, vocationName };
      yield put({
        type: 'query',
        payload: corrected
      });
    },
    *query({ payload: queries }, { call, put }) {
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const result = yield call(queryVocations, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            total: result.data.pagecursor[0].total,
            list: result.data.datacursor
          }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *refreshPage({ payload: resetQuery }, { select, put }) {
      // dangerLocation
      const {query} = yield select(
        ({routing}) => routing.locationBeforeTransitions
      );
      yield put(routerRedux.replace({
        pathname: '/vocations',
        query: resetQuery ? undefined : query
      }));
    },
    *save({ payload: params }, { call, put }) {
      yield put({ type: 'savePending', payload: true });
      try {
        const isEdit = !!params.vocationid;
        yield call(isEdit ? updateVocation : addVocation, params);
        yield put({ type: 'savePending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({
          type: 'refreshPage',
          payload: !isEdit
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
        yield put({ type: 'savePending', payload: false });
      }
    },
    *saveCopy({ payload: params }, { call, put }) {
      yield put({ type: 'savePending', payload: true });
      try {
        yield call(copyVocation, params);
        yield put({ type: 'savePending', payload: false });
        yield put({ type: 'hideModal' });

        yield put({
          type: 'refreshPage',
          payload: true
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
        yield put({ type: 'savePending', payload: false });
      }
    },
    *del({ payload: ids }, { call, put }) {
      try {
        yield call(delVocations, ids);
        yield put({ type: 'refreshPage' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    }
  },
  reducers: {
    queryRequest(state, { payload: queries }) {
      return { ...state, queries };
    },
    querySuccess(state, { payload }) {
      const { list, total } = payload;
      return { ...state, list, total, currentRecords: [] };
    },
    showModals(state, { payload: showModals }) {
      return { ...state, showModals };
    },
    hideModal(state) {
      return { ...state, showModals: '' };
    },
    currentRecords(state, { payload: currentRecords }) {
      return { ...state, currentRecords };
    },
    add(state) {
      return { ...state, showModals: 'add' };
    },
    edit(state) {
      return { ...state, showModals: 'edit' };
    },
    resetState() {
      return {
        queries: {},
        list: [],
        total: null,

        currentRecords: [],
        showModals: '',
        savePending: false
      };
    }
  }
};
