/**
 * Created by 0291 on 2017/12/7.
 */
import { message } from 'antd';
import { listTriggers, addTrigger, updateTrigger, changeTriggerStatus, listTriggerInstances } from "../services/ukqrtz";

export default {
  namespace: 'ukqrtzmanager',
  state: {
    triggerList: [],
    currItems: [],
    instanceList: [],
    curSelectedTriggerIds: [],
    curEditTriggerId: '',
    queries: {
      searchkey: ''
    },
    instqueries: {

    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/ukqrtzmanager') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'queryTriggerList' });
    },
    *queryTriggerList(action, { select, put, call }) {
      try {
        let { queries } = yield select(state => state.ukqrtzmanager);
        const result = yield call(listTriggers, { ...queries, SearchNormalStatus:1,SearchStopStatus:1,SearchDeletedStatus:1 });
        const triggerList = result.data.datalist;
        yield put({
          type: 'putState',
          payload: {
            triggerList: triggerList,
            total:  result.data.pageinfo.totalcount,
            currItems: []
          }});
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *search({ payload }, { select, put, call }) {
      let { queries } = yield select(state => state.ukqrtzmanager);
      const newQueries = {
        ...queries,
        ...payload
      };
      yield put({ type: 'putState', payload: { queries: newQueries } });
      yield put({ type: 'queryTriggerList' });
    },
    *add({ payload: params }, { put, call }) {
      try {
        yield put({ type: 'putState', payload: { modalPending: true } });
        yield call(addTrigger, params);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        if (params.recid) {
          yield put({ type: 'queryTriggerList' });
        } else {
          yield put({ type: 'queryTriggerList' });
        }
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'showModals', payload: '' });
      }
    },
    *update({ payload: params }, { put, call }) {
      try {
        yield put({ type: 'putState', payload: { modalPending: true } });
        yield call(updateTrigger, params);
        message.success('保存成功');
        yield put({ type: 'showInfoModals', payload: '' });
        if (params.recid) {
          yield put({ type: 'queryTriggerList' });
        } else {
          yield put({ type: 'queryTriggerList' });
        }
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'showInfoModals', payload: '' });
      }
    },
    *startTrigger({ payload: params }, { put, select, call }){
      try {
        let { currItems } = yield select(state => state.ukqrtzmanager);
        const params1 = {
          RecId: currItems[0].recid,
          Status: 1
        };
        yield call(changeTriggerStatus, params1);
        yield put({ type: 'queryTriggerList' });
        yield put({ type: 'resetState' });
      } catch (e) {
        message.error(e.message||'启动失败');
        yield put({ type: 'queryTriggerList' });
      }
    },
    *stopTrigger({ payload: params }, { put, select, call }){
      try {
        let { currItems } = yield select(state => state.ukqrtzmanager);
        const params1 = {
          RecId: currItems[0].recid,
          Status: 0
        };
        yield call(changeTriggerStatus, params1);
        yield put({ type: 'queryTriggerList' });
        yield put({ type: 'resetState' });
      } catch (e) {
        message.error(e.message||'启动失败');
        yield put({ type: 'queryTriggerList' });
      }
    },
    *showInstances({ payload }, { select, put, call }){

      try {
        let { instqueries, currItems } = yield select(state => state.ukqrtzmanager);
        const result = yield call(listTriggerInstances, { ...instqueries, triggerid:currItems[0].recid,pageIndex:1,pageSize:10 });
        const instanceList = result.data.datalist;
        yield put({
          type: 'putState',
          payload: {
            instanceList: instanceList,
            instancetotal:  result.data.pageinfo.totalcount
          }});
        yield put({ type: 'showInfoModals', payload: 'instances' });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *searchinstances({ payload }, { select, put, call }){
      let { instqueries } = yield select(state => state.ukqrtzmanager);
      const newQueries = {
        ...instqueries,
        ...payload
      };
      yield put({ type: 'putState', payload: { instqueries: newQueries } });
      yield put({ type: 'queryInstanceList' });
    },
    *queryInstanceList(action, { select, put, call }) {
      try {
        let { instqueries, currItems } = yield select(state => state.ukqrtzmanager);
        const result = yield call(listTriggerInstances, { ...instqueries, triggerid:currItems[0].recid });
        const instanceList = result.data.datalist;
        yield put({
          type: 'putState',
          payload: {
            instanceList: instanceList,
            instancetotal:  result.data.pageinfo.totalcount
          }});
        yield put({ type: 'showInfoModals', payload: 'instances' });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showInfoModals(state, { payload: showInfoModals }) {
      return {
        ...state,
        showInfoModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        triggerList: [],
        currItems: [],
        curSelectedTriggerIds: [],
        curEditTriggerId: '',
        queries: {
          searchkey: ''
        },
        instqueries: {

        }
      };
    }
  }
};
