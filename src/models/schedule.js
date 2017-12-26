/**
 * Created by 0291 on 2017/12/26.
 */
import { message } from 'antd';
import { listDirs, listObjects, saveobjectforbase, getobjectsql, saveobjectsql } from '../services/dbmanager';

export default {
  namespace: 'schedule',
  state: {
    scheduleWays: [{ name: 'day', title: '日', active: true }, { name: 'week', title: '周', active: false }, { name: 'month', title: '月', active: false }]
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/schedule') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'queryData' });
    },
    *queryData(action, { select, put, call }) {
      try {

      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
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

      };
    }
  }
};
