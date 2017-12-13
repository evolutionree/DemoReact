/**
 * Created by 0291 on 2017/12/13.
 */
import { message } from 'antd';

export default {
  namespace: 'mailrecovery',
  state: {

  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mailrecovery') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put }) {

    }
  },
  reducers: {
    putState(state, { payload }) {
      return { ...state, ...payload };
    },
    resetState() {
      return {

      };
    }
  }
};
