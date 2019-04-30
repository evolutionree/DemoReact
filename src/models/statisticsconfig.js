import { message } from 'antd';
import { getstatisticsdata, getstatisticsdetaildata, getstatistics, savestatisticsgroupsumsetting } from '../services/statistics';

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: [],
    resList: [],
    cacheList: [{ id: '0', anafuncid: '' }, { id: '1', anafuncid: '' }, { id: '2', anafuncid: '' }],
    selectList: [],
    groupObj: {}
  },
  subscriptions: {

  },
  effects: {
    *Init(_, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      const gParams = {
        AnaFuncName: ''
      };
      const { data: groupList } = yield call(getstatisticsdata, gParams);
      const dParams = {
        GroupName: Array.isArray(groupList) && groupList[0].groupmark
      };
      const { data: resList } = yield call(getstatisticsdetaildata, dParams);

      const { data: selectList } = yield call(getstatistics, {});

      yield put({
        type: 'putState',
        payload: {
          groupList,
          resList: resList.length ? resList : [...cacheList],
          selectList,
          groupObj: Array.isArray(groupList) && groupList[0]
        }
      });
    },
    *UpdateList({ payload }, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      const { record, logic } = payload;

      if (logic === 'byValue') {
        const groupmark = record ? record.cn : '';
        const groupmark_lang = record || {};

        yield put({ type: 'putState', payload: { groupObj: { groupmark, groupmark_lang } } });
        return;
      }

      const dParams = {
        GroupName: record.groupmark
      };
      const { data: resList } = yield call(getstatisticsdetaildata, dParams);

      yield put({
        type: 'putState',
        payload: {
          resList: resList.length ? resList : [...cacheList],
          groupObj: record
        }
      });
    },
    *Submit({ payload }, { call }) {
      const { params } = payload;
      const { error_msg } = yield call(savestatisticsgroupsumsetting, params);
      message.success(error_msg || '提交成功');
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
