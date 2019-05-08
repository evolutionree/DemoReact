import { message } from 'antd';
import { getstatisticsdata, getstatisticsdetaildata, getstatistics, savestatisticsgroupsumsetting } from '../services/statistics';

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: [],
    cacheGroupList: [],
    resList: [],
    cacheList: [{ id: '0', anafuncid: '' }, { id: '1', anafuncid: '' }, { id: '2', anafuncid: '' }],
    selectList: [],
    groupObj: {},
    active: false
  },
  subscriptions: {

  },
  effects: {
    *QueryList({ payload }, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      try {
        const gParams = { AnaFuncName: payload ? payload.groupname : '' };
        const { data: groupList } = yield call(getstatisticsdata, gParams);

        const resultGroupList = groupList.map(o => ({ ...o, name: o.groupmark }));

        const dParams = { GroupName: payload ? payload.groupname : resultGroupList.length && resultGroupList[0].groupmark };
        const { data: resList } = yield call(getstatisticsdetaildata, dParams);

        const { data: selectList } = yield call(getstatistics, {});

        const resultResList = (list) => {
          const _list = [...list];
          return _list.length < 3 ? resultResList([..._list, cacheList[_list.length]]) : _list.slice(0, 3);
        };

        yield put({
          type: 'putState',
          payload: {
            groupList: resultGroupList,
            cacheGroupList: resultGroupList,
            resList: resList.length ? resultResList(resList) : [...cacheList],
            selectList,
            groupObj: (Array.isArray(resultGroupList) && resultGroupList.length) ? resultGroupList[0] : {}
          }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *UpdateList({ payload }, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      const { record, value } = payload;

      try {
        const dParams = {
          GroupName: value && value.cn
        };

        const groupmark = record ? record.displayname_lang && record.displayname_lang.cn : '';
        const groupmark_lang = record.displayname_lang || {};

        const { data: resList } = yield call(getstatisticsdetaildata, dParams);

        const resultResList = (data) => {
          const _list = [...data];
          return _list.length < 3 ? resultResList([..._list, cacheList[_list.length]]) : _list.slice(0, 3);
        };

        yield put({
          type: 'putState',
          payload: {
            resList: resList.length ? resultResList(resList) : [...cacheList],
            groupObj: { groupmark, groupmark_lang }
          }
        });

        yield put({ type: 'QueryList', payload: { groupname: groupmark } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *Submit({ payload }, { put, call, select }) {
      const { groupObj } = yield select(state => state.statisticsconfig);
      try {
        const { params } = payload;
        const { error_msg } = yield call(savestatisticsgroupsumsetting, params);
        message.success(error_msg || '提交成功');
        yield put({ type: 'QueryList', payload: { groupname: groupObj.groupmark } });
      } catch (e) {
        message.error(e.message || '提交失败');
      }
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
