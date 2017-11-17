import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { queryList, addFlow, updateFlow, updateFlowStatus, unDeleteWorkFlow } from '../services/workflow';

export default {
  namespace: 'workflowList',
  state: {
    queries: {},
    list: [],
    total: 0,
    currentItems: [],
    showModals: '',
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/workflow') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *search({ payload }, { select, put, call }) {
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
    *queryList(action, { select, put, call }) {
      const { query } = yield select(({ routing }) => routing.locationBeforeTransitions);
      const queries = {
        pageIndex: 1,
        pageSize: 10,
        searchName: '',
        flowStatus: 1,
        ...query
      };
      yield put({ type: 'putState', payload: { queries } });
      try {
        const { data } = yield call(queryList, queries);
        yield put({
          type: 'putState',
          payload: {
            list: data.data,
            total: data.page[0].total,
            currentItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *save({ payload: data }, { select, put, call }) {
      yield put({ type: 'putState', payload: { modalPending: true } });
      try {
        const isEdit = !!data.flowid;
        yield call(isEdit ? updateFlow : addFlow, data);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        if (isEdit) {
          yield put({ type: 'queryList', payload: '' });
        } else {
          yield put({ type: 'search', payload: { pageIndex: 1 } });
        }
      } catch (e) {
        yield put({ type: 'putState', payload: { modalPending: false } });
        message.error(e.message || '保存失败');
      }
    },
    *toggleStatus(action, { select, put, call }) {
      const { currentItems } = yield select(state => state.workflowList);
      try {
        const item = currentItems[0];
        // yield call(updateFlowStatus, {
        //   flowid: item.flowid,
        //   status: item.recstatus ? 0 : 1
        // });
        yield call(updateFlowStatus, {
          flowids: item.flowid
        });
        message.success('操作成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *unDeleteWorkFlow(action, { select, put, call }) {
      const { currentItems } = yield select(state => state.workflowList);
      try {
        const item = currentItems[0];
        yield call(unDeleteWorkFlow, {
          flowids: item.flowid
        });
        message.success('操作成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
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
    }
  }
};
