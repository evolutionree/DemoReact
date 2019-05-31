import { message } from 'antd';
import * as _ from 'lodash';
import { saveEntityScripts, queryEntityDetail, getucodelist } from '../services/entity';
import { setSessionItem, getCacheData } from '../utils/newStorage';

const NAMESPACE = 'entityScripts';

export default {
  namespace: NAMESPACE,
  state: {
    entityId: '',
    showingScript: 'EntityAddNew',
    EntityAddNew: {
      type: 1,
      title: '新增JS',
      name: 'EntityAddNew',
      content: '',
      editingContent: '',
      remark: '',
      editing: false
    },
    EntityView: {
      type: 2,
      title: '查看装载',
      name: 'EntityView',
      remark: ''
    },
    EntityEdit: {
      type: 3,
      title: '编辑装载',
      name: 'EntityEdit',
      remark: ''
    },
    EntityCopyNew: {
      type: 4,
      title: '复制新增装载',
      name: 'EntityCopyNew',
      remark: ''
    },
    fetchDataLoading: {
      HistoryModal: false,
      FilterModal: false
    },
    showModals: {
      HistoryModal: '',
      FilterModal: '',
      FormModal: ''
    },
    initParams: {
      pageIndex: 1,
      pageSize: 10000,
      searchOrder: '',
      columnFilter: null, //字段查询
      codetype: 'EntityAddNew',
      recid: ''
    },
    historyList: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/scripts/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'putState',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({ type: 'queryScripts' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryScripts(action, { call, select, put }) {
      const { entityId } = yield select(state => state[NAMESPACE]);
      try {
        const { data: { entityproinfo } } = yield call(queryEntityDetail, entityId);
        yield put({
          type: 'queryScriptsSuccess',
          payload: {
            EntityAddNew: entityproinfo[0].newload,
            EntityEdit: entityproinfo[0].editload,
            EntityView: entityproinfo[0].checkload,
            EntityCopyNew: entityproinfo[0].copyload
          }
        });
      } catch (e) {
        message.error(e.message || '获取js脚本数据失败');
      }
    },
    *saveScript({ payload: scriptName }, { call, select, put }) {
      const { showingScript, entityId, EntityAddNew, EntityView, EntityEdit, EntityCopyNew } = yield select(state => state[NAMESPACE]);
      // const keyname = scriptName || showingScript;

      // const allInfo = { EntityAddNew, EntityView, EntityEdit, EntityCopyNew };
      // const type = allInfo[keyname].type;
      // const load = allInfo[keyname].editingContent;
      // const remark = allInfo[keyname].remark;

      try {
        const params = {
          entityid: entityId,
          details: [
            { type: 1, load: EntityAddNew.editingContent, remark: EntityAddNew.remark },
            { type: 2, load: EntityView.editingContent, remark: EntityView.remark },
            { type: 3, load: EntityEdit.editingContent, remark: EntityEdit.remark },
            { type: 4, load: EntityCopyNew.editingContent, remark: EntityCopyNew.remark }
          ]
        };
        yield call(saveEntityScripts, params);
        message.success('保存成功');
        yield put({ type: 'queryScripts' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *showHistoryModal({ payload }, { put, select }) {
      const { showModals } = yield select(state => state[NAMESPACE]);
      yield put({ type: 'showModals', payload: { ...showModals, HistoryModal: 'HistoryModal' } });
    },
    *Search({ payload }, { put }) {
      yield put({ type: 'setListParams', payload });
      yield put({ type: 'QueryList' });
    },
    *QueryList({ payload }, { select, put, call }) {
      const { initParams, fetchDataLoading } = yield select(state => state[NAMESPACE]);
      const params = { ...(payload || initParams) };

      yield put({ 
        type: 'putState', 
        payload: { fetchDataLoading: { ...fetchDataLoading, HistoryModal: true } } 
      });

      try {
        const { data } = yield call(getucodelist, params);
        const historyList = data || [];
        yield put({ type: 'putState', payload: { historyList } });

        yield put({ 
          type: 'putState',
          payload: { fetchDataLoading: { ...fetchDataLoading, HistoryModal: false } } 
        });
      } catch (e) {
        yield put({ 
          type: 'putState', 
          payload: { fetchDataLoading: { ...fetchDataLoading, HistoryModal: false } } 
        });
        message.error(e.message || '获取列表失败');
      }
    }
  },
  reducers: {
    setListParams(state, { payload }) {
      const key = `${NAMESPACE}_Params`;
      const cacheKey = `cache${NAMESPACE}_Params`;
      const cacheData = getCacheData(cacheKey, state.initParams);

      setSessionItem(cacheKey, cacheData);
      setSessionItem(key, payload);
      return {
        ...state,
        initParams: payload
      };
    },
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showModals(state, { payload }) {
      return { ...state, showModals: payload };
    },
    queryScriptsSuccess(state, { payload }) {
      const data = _.mapValues(payload, (scriptContent, scriptName) => {
        return {
          ...state[scriptName],
          content: scriptContent,
          editingContent: scriptContent,
          editing: false
        };
      });
      return {
        ...state,
        ...data
      };
    },
    EntityEdit(state, { payload: scriptName }) {
      return {
        ...state,
        [scriptName]: {
          ...state[scriptName],
          editing: true
        }
      };
    },
    cancelEdit(state, { payload: scriptName }) {
      return {
        ...state,
        [scriptName]: {
          ...state[scriptName],
          editing: false,
          editingContent: state[scriptName].content
        }
      };
    },
    contentChange(state, { payload: { scriptName, key, value } }) {
      return {
        ...state,
        [scriptName]: {
          ...state[scriptName],
          [key]: value
        }
      };
    },
    toggleShowing(state, { payload: scriptName }) {
      return {
        ...state,
        showingScript: scriptName
      };
    },
    resetState() {
      return {
        EntityAddNew: {
          title: '新增JS',
          name: 'EntityAddNew',
          content: '',
          editingContent: '',
          editing: false
        },
        EntityEdit: {
          title: '编辑装载',
          name: 'EntityEdit'
        },
        EntityView: {
          title: '查看装载',
          name: 'EntityView'
        },
        EntityCopyNew: {
          title: '复制新增装载',
          name: 'EntityCopyNew'
        },
        showingScript: 'EntityAddNew'
      };
    }
  }
};
