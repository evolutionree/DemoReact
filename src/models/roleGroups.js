import { message } from 'antd';
import { queryGroups, saveGroup, updateGroup, delGroup } from '../services/role';

export default {
  namespace: 'roleGroups',
  state: {
    list: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/role-groups') {
          dispatch({ type: 'query' });
        }
      });
    }
  },
  effects: {
    *query(action, { put, call }) {
      try {
        const { data } = yield call(queryGroups);
        yield put({ type: 'querySuccess', payload: data.rolegrouplist });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *save({ payload: item }, { call, put }) {
      try {
        yield call(saveGroup, item);
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *update({ payload: item }, { call, put }) {
      try {
        if (!item.groupname) {
          message.error('角色分类名称不能为空');
          return;
        }
        yield call(updateGroup, item);
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *del({ payload: id }, { call, put }) {
      try {
        yield call(delGroup, id);
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    }
  },
  reducers: {
    querySuccess(state, { payload: list }) {
      return { ...state, list };
    }
  }
};
