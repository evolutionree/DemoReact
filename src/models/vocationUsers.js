import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { queryVocationUsers, delVocationUsers } from '../services/functions';
import { getCorrectPager } from '../utils/common';

const _ = require('lodash');

export default {
  namespace: 'vocationUsers',
  state: {
    queries: {},
    list: [],
    total: null,
    currentRecords: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/vocation\/([^/]+)\/([^/]+)\/users/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const vocationId = match[1]
          dispatch({
            type: 'gotVocationInfo',
            payload: {
              vocationId
            }
          });
          dispatch({
            type: 'search',
            payload: location.query
          });
        }
      });
    }
  },
  effects: {
    // 通过路由变化，自动触发查询，可保证url与页面一致性
    *search({ payload: queries }, { select, call, put }) {
      const { vocationId } = yield select(state => state.vocationUsers);
      const { total } = yield select(state => state.vocationUsers);
      const { pageIndex, pageSize } = getCorrectPager({ ...queries, total });
      let { userName, deptId } = queries;
      userName = (userName && userName.slice(0, 20)) || '';
      if (!deptId) deptId = '7f74192d-b937-403f-ac2a-8be34714278b';
      const corrected = { vocationId, pageIndex, pageSize, userName, deptId };
      yield put({
        type: 'query',
        payload: corrected
      });
    },
    *query({ payload: queries }, { call, put }) {
      yield put({
        type: 'queryRequest',
        payload: queries
      });
      try {
        const { data } = yield call(queryVocationUsers, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.datacursor,
            total: data.pagecursor[0].total
          }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *del({ payload: userids }, { select, call, put }) {
      try {
        const vocationId = yield select(state => state.vocationUsers.vocationId);
        yield call(delVocationUsers, { vocationId, userids });
        yield put({ type: 'refreshPage' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *refreshPage({ payload: resetQuery }, { select, put }) {
      // dangerLocation
      const { query, pathname } = yield select(
        ({ routing }) => routing.locationBeforeTransitions
      );
      yield put(routerRedux.replace({
        pathname: pathname,
        query: resetQuery ? undefined : location.query
      }));
    }
  },
  reducers: {
    gotVocationInfo(state, { payload }) {
      return {
        ...state,
        vocationId: payload.vocationId
      };
    },
    queryRequest(state, { payload: queries }) {
      return { ...state, queries };
    },
    querySuccess(state, { payload }) {
      const { list, total } = payload;
      return { ...state, list, total, currentRecords: [] };
    },
    add(state) {
      return { ...state, showModals: 'add' };
    },
    edit(state) {
      return { ...state, showModals: 'edit' };
    },
    savePending(state, { payload }) {
      return { ...state, savePending: payload };
    },
    showModals(state, { payload: showModals }) {
      return { ...state, showModals };
    },
    hideModal(state) {
      return { ...state, showModals: '' };
    },
    currentRecords(state, { payload: currentRecords }) {
      return { ...state, currentRecords };
    }
  }
};
