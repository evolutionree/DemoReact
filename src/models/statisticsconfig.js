import { message } from 'antd';
import {
  getstatisticsdata, getstatisticsdetaildata, getstatistics, savestatisticsgroupsumsetting,
  updatestatisticsgroupsetting
} from '../services/statistics';

function resultResList(list, caches) {
  const _list = [...list];
  return _list.length < 3 ? resultResList([..._list, caches[_list.length]], caches) : _list.slice(0, 3);
}

export default {
  namespace: 'statisticsconfig',
  state: {
    groupList: [],
    cacheGroupList: [],
    resList: [],
    cacheList: [{ id: 0, anafuncid: '' }, { id: 1, anafuncid: '' }, { id: 2, anafuncid: '' }],
    selectList: [],
    active: false,
    record: {}
  },
  effects: {
    *Init(_, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      try {
        const params = { AnaFuncName: '' };
        const { data: groupList } = yield call(getstatisticsdata, params);
        const resultGroupList = groupList.map((o, id) => ({ ...o, id, displayname: o.groupmark, displayname_lang: o.groupmark_lang }));

        let resList = [];
        if (resultGroupList.length && resultGroupList[0].groupmark) {
          const params1 = {
            GroupName: resultGroupList[0].groupmark
          };
          const { data: resData } = yield call(getstatisticsdetaildata, params1);
          resList = resData;
        }

        const { data: selectList } = yield call(getstatistics, {});

        yield put({
          type: 'putState',
          payload: {
            groupList: resultGroupList,
            cacheGroupList: resultGroupList,
            resList: resList.length ? resultResList(resList, cacheList) : [...cacheList],
            selectList,
            record: resultGroupList[0]
          }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *QueryList({ payload }, { call, put, select }) {
      const { cacheList } = yield select(state => state.statisticsconfig);
      const { groupmark, isdel } = payload;

      try {
        const params = { AnaFuncName: groupmark || '' };
        const { data: groupList } = yield call(getstatisticsdata, params);
        const len = groupList.length;

        const resultGroupList = groupList.map((o, id) => ({ ...o, id, displayname: o.groupmark, displayname_lang: o.groupmark_lang }));
        const newRecord = resultGroupList[isdel !== 1 ? resultGroupList.findIndex(o => o.groupmark === groupmark) : (len - 1)] || { id: 0, groupmark: '' };
        if (isdel === 1) newRecord.id = len - 1;

        const params1 = { GroupName: isdel !== 1 ? groupmark : (len ? newRecord.groupmark : '') };
        const { data: resList } = yield call(getstatisticsdetaildata, params1);

        yield put({
          type: 'putState',
          payload: {
            groupList: resultGroupList,
            cacheGroupList: resultGroupList,
            resList: resList.length ? resultResList(resList, cacheList) : [...cacheList],
            record: newRecord
          }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *UpdateList({ payload }, { call, put, select }) {
      const { cacheList, cacheGroupList } = yield select(state => state.statisticsconfig);
      const { record } = payload;
      const isNew = !cacheGroupList.some(item => item.id === record.id);

      try {
        const GroupName = record ? record.displayname_lang && record.displayname_lang.cn : '';
        const params = { GroupName };

        const { data: resList } = yield call(getstatisticsdetaildata, params);

        yield put({
          type: 'putState',
          payload: {
            record,
            resList: !isNew ? resultResList(resList, cacheList) : [...cacheList]
          }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *SubmitData({ payload }, { put, call, select }) {
      const { record, cacheGroupList } = yield select(state => state.statisticsconfig);
      const { values } = payload;
      const _list = Object.values(values).map((anafuncid, index) => {
        return ({
          groupname: record.groupmark || '',
          groupname_lang: JSON.stringify(record.groupmark_lang),
          anafuncid: anafuncid || null,
          recorder: index
        });
      });
      const isNew = !cacheGroupList.some(o => o.id === record.id);
      const isdel = _list.every(o => !o.anafuncid) ? 1 : 0;

      if (isNew && isdel) {
        message.warn('检测到新分组，请先选择 [统计项] 再提交');
        return;
      } else if (!record.groupmark) {
        message.warn('[分组名称] 不能为空！');
        return;
      }
      const params = { data: _list, isdel };
      const { error_msg } = yield call(savestatisticsgroupsumsetting, params);
      message.success(error_msg || '提交成功');

      yield put({ type: 'QueryList', payload: { groupmark: record.groupmark, isdel: params.isdel } });
    },
    *Submit({ payload }, { put, call, select }) {
      const { record, cacheGroupList } = yield select(state => state.statisticsconfig);
      try {
        for (const item of cacheGroupList) {
          if (item.id === record.id && record.groupmark && item.groupmark !== record.groupmark) {
            const nameParams = {
              groupname: item.groupmark,
              newgroupname: record.groupmark,
              newgroupname_lang: JSON.stringify(record.groupmark_lang)
            };
            yield call(updatestatisticsgroupsetting, nameParams);
            yield put({ type: 'SubmitData', payload });
            return;
          }
        }

        yield put({ type: 'SubmitData', payload });
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
