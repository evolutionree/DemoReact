import { message } from 'antd';
import { taskStart, getTaskList } from "../services/importTask";

export default {
  namespace: 'task',
  state: {
    showModals: '',
    templateKey: undefined,
    templateType: undefined,
    importUrl: '',
    importTemplate: '',
    impTask: [],
    selectTask: undefined,
    callTaskList: [],
    showOperatorType: true,
    modalPending: false
  },
  subscriptions: {

  },
  effects: {
    *queryTaskList__({ payload: taskIds }, { select, put, call }) {
      try {
        const params = {
          taskIds
        };
        const { data } = yield call(getTaskList, params);
        const callTaskList = data;

        yield put({
          type: 'querySuccess',
          payload: callTaskList
        });
        // 找出对应的selectTask ，更新正在打开的进度界面
        const selectTask = yield select(state => state.task.selectTask);
        if (selectTask) {
          const targetTask = callTaskList.filter(entity => {
            if (selectTask.taskid === entity.taskid) return entity;
          });
          if (targetTask.length > 0) {
            yield put({
              type: 'selectTask',
              payload: targetTask[0]
            });
          }
        }

      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *taskStart({ payload: taskId }, { put, call }) {
      try {
        const params = {
          taskId
        };
        yield call(taskStart, params);
      } catch (e) {
        message.error(e.message || '启动失败');
      }
    }
  },
  reducers: {
    showModals(state, { payload }) {
      return {
        ...state,
        showModals: payload
      };
    },
    impModals(state, { payload: { templateType, templateKey, importUrl, importTemplate, explainInfo, showOperatorType } }) {
      return {
        ...state,
        templateType,
        templateKey,
        importUrl,
        importTemplate,
        showOperatorType: showOperatorType !== false,
        showModals: 'import',
        modalPending: false,
        explainInfo
      };
    },
    prepareTask(state, { payload }) {

    },
    addTask(state, { payload }) {
      const { impTask } = state;
      const newImpTask = [...impTask, payload];
      return {
        ...state,
        impTask: newImpTask
      };
    },
    selectTask(state, { payload: selectTask }) {
      return {
        ...state,
        selectTask
      };
    },
    querySuccess(state, { payload: callTaskList }) {
      return {
        ...state,
        callTaskList
      };
    }
  }
};
