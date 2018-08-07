import { getentrance } from '../services/app.js';

export default {
  namespace: 'app',
  state: {
    menuData: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 首次进入应用时，检查登录状态
      dispatch({ type: 'fetchMenu', payload: null });
    }
  },

  effects: {
    *fetchMenu({ payload }, { call, put }) {  // eslint-disable-line
      const { data } = yield call(getentrance);
      yield put({ type: 'putState', payload: { menuData: data } });
    }
  },

  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
