/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';

const columns = [{
  title: '转移方案名',
  dataIndex: 'name'
}, {
  title: '目标转移对象',
  dataIndex: 'age'
}, {
  title: '备注',
  dataIndex: 'address'
}];

const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    recid: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

export default {
  namespace: 'transferscheme',
  state: {
    protocol: columns,
    queries: {},
    list: data,
    total: 46,
    currItems: [],
    showModals: '',
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/transferscheme') {
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
      const { query } = yield select(({ routing }) => routing.locationBeforeTransitions);
      const queries = {
        pageIndex: 1,
        pageSize: 10,
        searchName: '',
        flowStatus: 1,
        ...query
      };
      yield put({ type: 'putState', payload: { queries } });
      // try {
      //   const { data } = yield call(queryList, queries);
      //   yield put({
      //     type: 'putState',
      //     payload: {
      //       list: data.data,
      //       total: data.page[0].total,
      //       currentItems: []
      //     }
      //   });
      // } catch (e) {
      //   message.error(e.message || '获取列表数据失败');
      // }
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
    },
    *searchKeyword({ payload: keyword }, { select, call, put }) {
      const searchData = JSON.stringify({ recname: keyword || undefined });
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 0 } });
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
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
        protocol: [],
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
