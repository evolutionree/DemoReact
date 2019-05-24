import { message } from 'antd';
import * as _ from 'lodash';
import { saveEntityScripts, queryEntityDetail } from '../services/entity';

function getScriptServerKey(scriptName) {
  const serverNameMap = {
    addScript: 'newload',
    editScript: 'editload',
    viewScript: 'checkload',
    copyScript: 'copyload'
  };
  return serverNameMap[scriptName] || '';
}

export default {
  namespace: 'entityScripts',
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
      FilterModal: ''
    }
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
      const { entityId } = yield select(state => state.entityScripts);
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
      const { entityId, addScript, editScript, viewScript, copyScript } = yield select(state => state.entityScripts);
      try {
        const params = {
          entityid: entityId,
          newload: addScript.editingContent || '',
          editload: editScript.editingContent || '',
          checkload: viewScript.editingContent || '',
          copyload: copyScript.editingContent || ''
        };
        if (scriptName) {
          const { editingContent } = yield select(state => state.entityScripts[scriptName]);
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
      const { showModals } = yield select(state => state.entityScripts);
      yield put({ type: 'showModals', payload: { ...showModals, HistoryModal: 'HistoryModal' } });
    }
  },
  reducers: {
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
