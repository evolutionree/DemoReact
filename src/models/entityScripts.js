import { message } from 'antd';
import * as _ from 'lodash';
import { saveEntityScripts, queryEntityDetail } from '../services/entity';
import { setSessionItem, getCacheData } from '../utils/newStorage';

function getScriptServerKey(scriptName) {
  const serverNameMap = {
    addScript: 'newload',
    editScript: 'editload',
    viewScript: 'checkload',
    copyScript: 'copyload'
  };
  return serverNameMap[scriptName] || '';
}

const NAMESPACE = 'entityScripts';

export default {
  namespace: NAMESPACE,
  state: {
    addScript: {
      title: '新增JS',
      name: 'addScript',
      content: '',
      editingContent: '',
      editing: false
    },
    editScript: {
      title: '编辑装载',
      name: 'editScript'
    },
    viewScript: {
      title: '查看装载',
      name: 'viewScript'
    },
    copyScript: {
      title: '复制新增装载',
      name: 'copyScript'
    },
    showingScript: 'addScript',
    fetchDataLoading: {
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
      columnFilter: null //字段查询
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
            addScript: entityproinfo[0].newload,
            editScript: entityproinfo[0].editload,
            viewScript: entityproinfo[0].checkload,
            copyScript: entityproinfo[0].copyload
          }
        });
      } catch (e) {
        message.error(e.message || '获取js脚本数据失败');
      }
    },
    *saveScript({ payload: scriptName }, { call, select, put }) {
      const { entityId, addScript, editScript, viewScript, copyScript } = yield select(state => state[NAMESPACE]);
      try {
        const params = {
          entityid: entityId,
          newload: addScript.editingContent || '',
          editload: editScript.editingContent || '',
          checkload: viewScript.editingContent || '',
          copyload: copyScript.editingContent || ''
        };
        if (scriptName) {
          const { editingContent } = yield select(state => state[NAMESPACE][scriptName]);
          const serverKey = getScriptServerKey(scriptName);
          params[serverKey] = editingContent;
        }
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
      const { initParams } = yield select(state => state[NAMESPACE]);
      const params = { ...(payload || initParams) };

      try {
        const { data } = yield call(queryEntityDetail, params);
        const historyList = data.datalist || [];
        yield put({ type: 'putState', payload: { historyList } });
      } catch (e) {
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
    editScript(state, { payload: scriptName }) {
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
    contentChange(state, { payload: { scriptName, value } }) {
      return {
        ...state,
        [scriptName]: {
          ...state[scriptName],
          editingContent: value
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
        addScript: {
          title: '新增JS',
          name: 'addScript',
          content: '',
          editingContent: '',
          editing: false
        },
        editScript: {
          title: '编辑装载',
          name: 'editScript'
        },
        viewScript: {
          title: '查看装载',
          name: 'viewScript'
        },
        copyScript: {
          title: '复制新增装载',
          name: 'copyScript'
        },
        showingScript: 'addScript'
      };
    }
  }
};
