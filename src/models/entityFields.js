import { message } from 'antd';
import { setSessionItem, getCacheData } from '../utils/newStorage';
import {
  queryFields,
  saveField,
  updateField,
  delField,
  sortField,
  saveWebFieldVisible,
  saveCustomBasicConfig,
  updateFieldExpandJS,
  updateFieldExpandFilterJS,
  updateentitycondition
} from '../services/entity';

const NAMESPACE = 'entityFields';


export default {
  namespace: NAMESPACE,
  state: {
    entityId: null,
    list: [],
    // showModals: '',
    editingRecord: null,
    modalPending: false,
    nodeCell: null,
    showModals: {
      FieldFormModal: '',
      FieldSortModal: '',
      WebListConfigModal: '',
      MobileListConfigModal: '',
      SetMainFieldModal: '',
      SelListFilterModal: '',
      SetDynamicFieldsModal: '',
      SetCustomBasicConfigModal: '',
      SetCustomMailConfigModal: '',
      SetCheckRepeatConfigModal: '',
      ExpandJSModal: '',
      HistoryModal: '',
      FilterModal: ''
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
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/fields/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'gotEntityInfo',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({ type: 'query' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *query(action, { select, put, call }) {
      try {
        const { entityId } = yield select(state => (state[NAMESPACE]));
        const { data } = yield call(queryFields, entityId);
        yield put({ type: 'querySuccess', payload: data.entityfieldpros });
      } catch (err) {
        message.error(err.message || '查询失败');
      }
    },
    *save({ payload: { data, callback } }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const isEdit = !!data.fieldId;
        const { entityId } = yield select(state => (state[NAMESPACE]));
        const params = { ...data, entityId };
        if (params.fieldId === 'a85009a1-781f-4b99-bbfe-2620eab1742a') { // 邮箱 签名字段特殊处理
          const { fieldConfig } = params;
          if (fieldConfig) {
            params.fieldConfig = JSON.stringify({
              ...JSON.parse(fieldConfig),
              textType: 1 // 富文本
            });
          }
        }
        yield call(isEdit ? updateField : saveField, params);
        message.success('保存成功');
        callback(null);
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({ type: 'query' });
      } catch (err) {
        message.error(err.message || '保存失败');
        callback(err);
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *sort({ payload: data }, { put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(sortField, data);
        message.success('排序成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({ type: 'query' });
      } catch (err) {
        message.error(err.message || '排序失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *del({ payload: fieldId }, { put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(delField, fieldId);
        message.success('删除成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({ type: 'query' });
      } catch (err) {
        message.error(err.message || '删除失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *setWebVisibleFields({ payload }, { select, put, call }) {
      const { fieldIds, callback } = payload;
      yield put({ type: 'modalPending', payload: true });

      try {
        const { entityId } = yield select(state => (state[NAMESPACE]));
        const params = {
          entityId,
          viewtype: 0,
          fieldids: fieldIds.join(',')
        };
        yield call(saveWebFieldVisible, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        if (callback) callback();
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *setCheckRepeatConfig({ payload }, { select, put, call }) {
      const { visibleFields: data, callback } = payload;
      yield put({ type: 'modalPending', payload: true });
      try {
        const { entityId: EntityId } = yield select(state => (state[NAMESPACE]));
        const params = {
          EntityId,
          FieldIds: data.fieldvisible.map(item => item.fieldid).join(',')
        };
        yield call(updateentitycondition, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        if (callback) callback();
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *setCustomBasicConfig({ payload }, { select, put, call }) {
      const { visibleFields: data, callback } = payload;
      yield put({ type: 'modalPending', payload: true });

      try {
        const { entityId } = yield select(state => (state[NAMESPACE]));

        const params = data.fieldvisible.map((item) => {
          return {
            entityId,
            fieldid: item.fieldid,
            fieldname: item.fieldname,
            relentityid: 'ac051b46-7a20-4848-9072-3b108f1de9b0' // 客户基础资料实体
          };
        });

        yield call(saveCustomBasicConfig, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        if (callback) callback();
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *saveExpandJS({ payload }, { put, call }) {
      const { params: data, callback } = payload;
      const { fieldId, expandJS, type } = data;
      yield put({ type: 'modalPending', payload: true });

      try {
        const params = type ? { fieldId, filterJS: expandJS } : { fieldId, expandJS };
        yield call(type ? updateFieldExpandFilterJS : updateFieldExpandJS, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        if (callback) callback();
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *nodeCell({ payload }, { put, select }) {
      const { nodeCell } = yield select(state => (state[NAMESPACE]));
      if (nodeCell === payload) return;
      if (nodeCell) nodeCell.check();
      yield put({ type: 'updateNodeCell', payload });
    },
    *Search({ payload }, { put }) {
      yield put({ type: 'setListParams', payload });
      yield put({ type: 'QueryList' });
    },
    *QueryList({ payload }, { select, put, call }) {
      const { initParams } = yield select(state => state[NAMESPACE]);
      const params = { ...(payload || initParams) };

      try {
        const { data } = yield call(queryFields, params);
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
    gotEntityInfo(state, { payload: entityInfo }) {
      return {
        ...state,
        entityId: entityInfo.entityId,
        entityType: entityInfo.entityType
      };
    },
    querySuccess(state, { payload: list }) {
      return { ...state, list };
    },
    edit(state, { payload: record }) {
      const editingRecord = {
        fieldId: record.fieldid,
        entityId: record.entityid,
        controlType: record.controltype.toString(),
        displayname_lang: record.displayname_lang,
        fieldlabel_lang: record.fieldlabel_lang,
        recStatus: record.recstatus.toString(),
        fieldName: record.fieldname,
        fieldConfig: record.fieldconfig,
        fieldType: record.fieldtype,
        expandJS: record.expandjs,
        filterJS: record.filterjs
      };

      return {
        ...state,
        editingRecord
      };
    },
    editExpandJS(state, { payload: { record, type } }) {
      const editingRecord = {
        fieldId: record.fieldid,
        entityId: record.entityid,
        controlType: record.controltype.toString(),
        displayname_lang: record.displayname_lang,
        fieldlabel_lang: record.fieldlabel_lang,
        recStatus: record.recstatus.toString(),
        fieldName: record.fieldname,
        fieldConfig: record.fieldconfig,
        fieldType: record.fieldtype,
        expandJS: record.expandjs,
        filterJS: record.filterjs
      };

      return {
        ...state,
        editingRecord
      };
    },
    hideModal(state) {
      return { ...state, editingRecord: null, showModals: '', modalPending: false };
    },
    modalPending(state, { payload: pending }) {
      return { ...state, modalPending: pending };
    },
    updateNodeCell(state, { payload: nodeCell }) {
      return { ...state, nodeCell };
    },
    resetState() {
      return {
        entityId: null,
        list: [],
        showModals: '',
        editingRecord: null,
        modalPending: false,
        nodeCell: null
      };
    }
  }
};
