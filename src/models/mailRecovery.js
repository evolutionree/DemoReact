/**
 * Created by 0291 on 2017/12/13.
 */
import { message } from 'antd';
import { getreconvertmaillst } from '../services/mailRecovery';

export default {
  namespace: 'mailrecovery',
  state: {
    mailAddressList: []
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

    },
    *queryList({ payload: params }, { select, call, put }) {
      try {
        const result = yield call(getreconvertmaillst, {
          ...params,
          pageindex: 1,
          pagesize: 10
        });

      } catch (e) {
        message.error(e.message || '获取邮件列表失败');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return { ...state, ...payload };
    },
    resetState() {
      return {
        mailAddressList: []
      };
    }
  }
};
