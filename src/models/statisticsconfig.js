import { getstatisticsdata, getstatisticsdetaildata } from '../services/statistics';

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: []
  },
  subscriptions: {

  },
  effects: {
    *Init(_, { call, put }) {
      const gParams = {
        AnaFuncName: ''
      };
      const { data: groupList } = yield call(getstatisticsdata, gParams);
      const dParams = {
        AnaFuncName: '{NOW}当月统计'
      };
      const resList = yield call(getstatisticsdetaildata, dParams);

      yield put({ type: 'putState', payload: { groupList, resList } });
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
