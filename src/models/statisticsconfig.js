import { getvertionmsglist } from '../services/statistics';

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: []
  },
  subscriptions: {

  },
  effects: {
    *Init(_, { call, put }) {
      const params = {

      };
      const res = yield call(getvertionmsglist, params);
      yield put({ type: 'putState', payload: { groupList: [] } });
    },
    *UpdateList({ payload }, { call, put }) {
      const { record } = payload;
      console.log(record);
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
