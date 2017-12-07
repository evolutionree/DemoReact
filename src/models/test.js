/**
 * Created by 0291 on 2017/12/7.
 */
import { message } from 'antd';
import { getSeries, getProducts } from '../services/products';

export default {
  namespace: 'test',
  state: {
    treeData: null,
    listData: [],
    queries: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/test') {
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
        const result = yield call(getSeries, {
          ProductsetId: '',
          Direction: 'DOWNER'
        });
        const treeData = result.data;
        yield put({ type: 'putState', payload: { treeData } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *queryListData({ payload: queries }, { select, put, call }) {
      try {
        const result = yield call(getProducts, {
          "productSeriesId":"09eba659-6d2c-4a97-9eb1-a2d8017ec5bd",
          "recStatus":"0",
          "pageIndex":"1",
          "pageSize":10,
          "searchKey":"",
          "includeChild":true,
          "recVersion":1
        });
        const listData = result.data;
        yield put({ type: 'putState', payload: { listData } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *search({ payload: { key, value } }, { select, put, call }) {
      let { queries } = yield select(state => state.test);
      const newQueries = {
        ...queries,
        [key]: value
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
    resetState() {
      return {
        treeData: null,
        listData: [],
        queries: {}
      };
    }
  }
};
