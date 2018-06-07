/**
 * Created by 0291 on 2018/6/6.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { queryDicTypes } from '../services/dictionary.js';

export default {
  namespace: 'dictype',
  state: {
    queries: {},
    list: [],
    currItems: [],
    showModals: '',
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dictype') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put, call, select }) {
      yield put({ type: 'queryList' });
    },
    *queryList(action, { put, call, select }) {
      try {
        const { data } = yield call(queryDicTypes);
        yield put({ type: 'putState', payload: { list: data.fielddictype } });
      } catch (e) {
        console.error(e);
        message.error('查询列表数据失败');
      }
    },
    *search({ payload }, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          ...payload
        }
      }));
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    queries(state, { payload: queries }) {
      return { ...state, queries };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    resetState() {
      return {
        queries: {},
        list: [],
        total: 0,
        currItems: [],
        showModals: '',
        modalPending: false
      };
    }
  }
};
