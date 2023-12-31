import { message } from 'antd';
import { add, update, del, getpgcodelist, getpgcodedetail } from '../services/historyscript';
import { setSessionItem, getCacheData } from '../../utils/newStorage';

const NAMESPACE = 'historyscript';

export default {
  namespace: NAMESPACE,
  state: {
    list: [],
    selectedRows: [],
    confirmLoading: {
      FormModal: false,
      FilterModal: false
    },
    fetchDataLoading: {
      FormModal: false,
      FilterModal: false
    },
    showModals: {
      FormModal: '',
      FilterModal: '',
      CodeMerge: ''
    },
    initParams: {
      pageIndex: 1,
      pageSize: 10000,
      searchOrder: '',
      columnFilter: null //字段查询
    },
    formInfo: {
      fieldData: {}
    }
  },
  effects: {
    *Init({ payload }, { put }) {
      yield put({ type: 'QueryList', payload });
    },
    *Search({ payload }, { put }) {
      yield put({ type: 'setListParams', payload });
      yield put({ type: 'QueryList' });
    },
    *QueryList({ payload }, { select, put, call }) {
      const { initParams } = yield select(state => state[NAMESPACE]);
      const params = { ...(payload || initParams) };

      try {
        const { data } = yield call(getpgcodelist, params);
        const list = data.datalist || [];
        yield put({ type: 'putState', payload: { list } });
      } catch (e) {
        message.error(e.message || '获取列表失败');
      }
    },
    *Del({ payload }, { put, call }) {
      const params = {
        ReportRelationIds: payload,
        recstatus: 0
      };
      try {
        const { error_msg } = yield call(del, params);
        message.success(error_msg || '删除成功！');
        yield put({ type: 'QueryList' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *SubmitForm({ payload }, { select, call, put }) {
      const { confirmLoading, recid } = yield select(state => state[NAMESPACE]);
      const { params, resolve, isEdit } = payload;
      try {
        yield put({ type: 'handelLoading', payload: { ...confirmLoading, FormModal: true } });

        const resultParams = {
          ...params,
          recid: recid || null
        };
        const response = yield call((!isEdit ? add : update), resultParams);
        if (resolve) resolve(response);
        yield put({ type: 'QueryList' });
        yield put({ type: 'handelLoading', payload: { ...confirmLoading, FormModal: false } });
      } catch (e) {
        yield put({ type: 'handelLoading', payload: { ...confirmLoading, FormModal: false } });
        message.error(e.message);
      }
    },
    *FecthAllFormData({ payload }, { select, call, put }) {
      const { fetchDataLoading } = yield select(state => state[NAMESPACE]);
      const { recid, resolve } = payload;

      try {
        if (recid) { // 编辑
          yield put({
            type: 'putState',
            payload: { fetchDataLoading: { ...fetchDataLoading, FormModal: true } }
          });

          const { data } = yield call(getpgcodedetail, {});
          const list = data.datalist || [];
          yield put({
            type: 'putState',
            payload: {
              list,
              selectedRows: list.filter(o => o.reportrelationid === recid),
              fetchDataLoading: { ...fetchDataLoading, FormModal: false }
            }
          });
        }

        if (resolve) resolve({});
      } catch (e) {
        yield put({
          type: 'putState',
          payload: { fetchDataLoading: { ...fetchDataLoading, FormModal: false } }
        });
        message.error(e.message);
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
    handelLoading(state, { payload }) {
      return { ...state, confirmLoading: payload };
    },
    showModals(state, { payload }) {
      return { ...state, showModals: payload };
    }
  }
};
