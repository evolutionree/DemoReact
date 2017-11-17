import { message, Modal } from 'antd';
import { routerRedux } from 'dva/router';
import { queryReminderList, saveReminder, activateReminder } from '../services/reminder';

let modelDirty = false;

export default {
  namespace: 'reminderList',
  state: {
    list: [],
    total: null,
    queries: {},
    showModals: '',
    currItems: [],
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/reminder-list') {
          dispatch({
            type: 'queryList',
            payload: location.query
          });
          modelDirty = true;
        } else {
          modelDirty && dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *search({ payload }, { select, put }) {
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
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { query } = location;
      const queries = {
        pageIndex: 1,
        pageSize: 10,
        recStatus: 1,
        keyword: '',
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex);
      queries.pageSize = parseInt(queries.pageSize);
      queries.recStatus = parseInt(queries.recStatus);
      yield put({ type: 'putState', payload: { queries } });
      try {
        const params = {
          rectype: 0,
          remindername: queries.keyword,
          ...queries
        };
        delete params.keyword;
        const { data } = yield call(queryReminderList, params);
        yield put({
          type: 'putState',
          payload: {
            list: data.datacursor,
            total: data.pagecursor[0].total,
            currItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *save({ payload: params }, { put, call }) {
      try {
        yield put({ type: 'putState', payload: { modalPending: true } });
        yield call(saveReminder, params);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        if (params.reminderid) {
          yield put({ type: 'queryList' });
        } else {
          yield put({ type: 'search' });
        }
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'showModals', payload: '' });
      }
    },
    *activate(action, { select, put, call }) {
      const items = yield select(state => state.reminderList.currItems);
      if (items.length) {
        try {
          yield call(activateReminder, items[0].reminderid);
          message.success('操作成功');
        } catch (e) {
          message.error(e.message || '操作失败');
        }
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
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
        list: [],
        total: null,
        queries: {},
        showModals: '',
        currItems: [],
        modalPending: false
      };
    }
  }
};
