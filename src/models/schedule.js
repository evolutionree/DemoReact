/**
 * Created by 0291 on 2017/12/26.
 */
import { message } from 'antd';
import { listDirs, listObjects, saveobjectforbase, getobjectsql, saveobjectsql } from '../services/dbmanager';

const tabModules = [
  { name: 'customer', title: '待跟进的客户' },
  { name: 'sale', title: '销售记录' },
  { name: 'notice', title: '公告通知' },
  { name: 'audit', title: '审批通知' }
];

export default {
  namespace: 'schedule',
  state: {
    modules: tabModules,
    activeModule: 'audit',
    scheduleWays: [{ name: 'day', title: '日', active: true }, { name: 'week', title: '周', active: false }, { name: 'month', title: '月', active: false }],
    taskWays: [{ name: 'myTask', title: '我的任务', active: true }, { name: 'myAssignment', title: '我分配的任务', active: false }],
    schedulePanelVisible: false,
    showModals: ''
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
        modules: tabModules,
        activeModule: 'audit',
        scheduleWays: [{ name: 'day', title: '日', active: true }, { name: 'week', title: '周', active: false }, { name: 'month', title: '月', active: false }],
        taskWays: [{ name: 'myTask', title: '我的任务', active: true }, { name: 'myAssignment', title: '我分配的任务', active: false }],
        schedulePanelVisible: false,
        showModals: ''
      };
    }
  }
};
