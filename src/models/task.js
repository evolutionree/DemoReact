import { message } from 'antd';
import { taskStart, getTaskList } from "../services/importTask";
import { queryEntityDetail } from '../services/entity';

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
    modalPending: false,
    entityId: '',
    products: '',
    structure: '',
    salesTarget: '',
    entity: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg0 = /^\/entcomm-list\/([^/]+)$/;
        const pathReg2 = /^\/entcomm-application\/([^/]+)$/;
        const pathReg3 = /^\/entcomm-dynamic\/([^/]+)$/;
        const pathRegProducts = /^\/products+$/;
        const pathRegStructure = /^\/structure+$/;
        const pathRegSalesTarget = /^\/salesTarget+$/;
        const pathRegEntity = /^\/entity+$/;
        const match0 = location.pathname.match(pathReg0);
        const match2 = location.pathname.match(pathReg2);
        const match3 = location.pathname.match(pathReg3);
        const structure = location.pathname.match(pathRegStructure);
        const products = location.pathname.match(pathRegProducts);
        const salesTarget = location.pathname.match(pathRegSalesTarget);
        const entity = location.pathname.match(pathRegEntity);
        if (match0) {
          dispatch({ type: 'putState', payload: { entityId: match0[1] } });
        } else if (match2) {
          dispatch({ type: 'putState', payload: { entityId: match2[1] } });
        } else if (match3) {
          dispatch({ type: 'putState', payload: { entityId: match3[1] } });
        } else if (structure) {
          dispatch({ type: 'putState', payload: { structure: !!structure } });
        } else if (products) {
          dispatch({ type: 'putState', payload: { products: !!products } });
        } else if (salesTarget) {
          dispatch({ type: 'putState', payload: { salesTarget: !!salesTarget } });
        } else if (entity) {
          dispatch({ type: 'putState', payload: { entity: !!entity } });
        } else {
          dispatch({ type: 'resetState' }); 
        }
      });
    }
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
    *taskStart({ payload: taskId }, { put, call, select }) {
      const { entityId, products, structure, salesTarget, entity } = yield select(state => state.task);
      try {
        const params = { taskId };
        yield call(taskStart, params);
        if (entityId) {
          const { data: { entityproinfo } } = yield call(queryEntityDetail, entityId);
          const modeltype = Array.isArray(entityproinfo) && entityproinfo.length > 0 && entityproinfo[0].modeltype;
          switch (modeltype) {
            case 0:
              yield put({ type: 'entcommList/queryList' });
              break;
            case 1:
              // 暂时不用处理嵌套实体
              break;
            case 2:
              yield put({ type: 'entcommApplication/queryList' });
              break;
            case 3:
              yield put({ type: 'entcomm-dynamic/queryList' });
              break;
            default:
              message.error('不匹配的实体类型，请检查entityId');
          }
        } else if (structure) {
          yield put({ type: 'structure/queryList' });
        } else if (products) {
          yield put({ type: 'productManager/queryList' });
        } else if (salesTarget) {
          yield put({ type: 'salesTarget/queryList' });
        } else if (entity) {
          yield put({ type: 'entityList/query' });
        }
        // RelTable
      } catch (e) {
        message.error(e.message || '启动失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
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
    },
    resetState() {
      return {
        showModals: '',
        templateKey: undefined,
        templateType: undefined,
        importUrl: '',
        importTemplate: '',
        impTask: [],
        selectTask: undefined,
        callTaskList: [],
        showOperatorType: true,
        modalPending: false,
        entityId: '',
        products: '',
        structure: '',
        salesTarget: '',
        entity: ''
      };
    }
  }
};
