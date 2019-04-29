import { getstatisticsdata, getstatisticsdetaildata, getstatistics } from '../services/statistics';

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: [],
    selectList: []
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
      const { data: resList } = yield call(getstatisticsdetaildata, dParams);

      const { data: selectList } = yield call(getstatistics, {});

      yield put({ type: 'putState', payload: { groupList, resList, selectList } });
    },
    *UpdateList({ payload }, { call, put }) {
      const { record } = payload;
      const dParams = {
        AnaFuncName: record.groupmark
      };
      const { data: resList } = yield call(getstatisticsdetaildata, dParams);
      yield put({ type: 'putState', payload: { resList } });
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
