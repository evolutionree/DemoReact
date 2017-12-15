/**
 * Created by 0291 on 2017/12/7.
 */
import { message } from 'antd';
import { listDirs, listObjects } from '../services/dbmanager';

export default {
  namespace: 'dbmanager',
  state: {
    treeData: null,
    listData: [],
    queries: {},
    showInfoModals: '',
    currItems: []

  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dbmanager') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'queryTreeData' });
    },
    *queryTreeData(action, { select, put, call }) {
      try {
        const result = yield call(listDirs, {
        });
        const treeData = result.data;
        yield put({ type: 'putState', payload: { treeData } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *queryListData({ payload: queries }, { select, put, call }) {
      try {
        const result = yield call(listObjects, queries);
        const listData = result.data;
        yield put({ type: 'putState', payload: { listData } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *search({ payload }, { select, put, call }) {
      let { queries } = yield select(state => state.dbmanager);
      const newQueries = {
        ...queries,
        ...payload
      };
      yield put({ type: 'putState', payload: { queries: newQueries } });
      yield put({ type: 'queryListData', payload: newQueries });
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showInfoModals(state, { payload: showInfoModals }) {
      return {
        ...state,
        showInfoModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        treeData: null,
        listData: [],
        queries: {},
        showInfoModals: '',
        currItems: []
      };
    }
  }
};
