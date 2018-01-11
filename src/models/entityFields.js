import { message } from 'antd';
import {
  queryFields,
  saveField,
  updateField,
  delField,
  sortField,
  saveWebFieldVisible,
  saveCustomBasicConfig,
  updateFieldExpandJS,
  updateFieldExpandFilterJS
} from '../services/entity';

export default {
  namespace: 'entityFields',
  state: {
    entityId: null,
    list: [],
    showModals: '',
    editingRecord: null,
    modalPending: false
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
        const { entityId } = yield select(({ entityFields }) => entityFields);
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
        const { entityId } = yield select(({ entityFields }) => entityFields);
        const params = { ...data, entityId };
        if (params.fieldId === 'a85009a1-781f-4b99-bbfe-2620eab1742a') { // 邮箱 签名字段特殊处理
          let { fieldConfig } = params;
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
    *setWebVisibleFields({ payload: fieldIds }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });

      try {
        const entityId = yield select(state => state.entityFields.entityId);
        const params = {
          entityId,
          viewtype: 0,
          fieldids: fieldIds.join(',')
        };
        yield call(saveWebFieldVisible, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *setCustomBasicConfig({ payload: data }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });

      try {
        const entityId = yield select(state => state.entityFields.entityId);

        const params = data.fieldvisible.map((item) => {
          return {
            entityId,
            fieldid: item.fieldid,
            fieldname: item.fieldname,
            relentityid: 'ac051b46-7a20-4848-9072-3b108f1de9b0' // 客户基础资料实体
          }
        })

        yield call(saveCustomBasicConfig, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
      } catch (err) {
        message.error(err.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *saveExpandJS({ payload: { fieldId, expandJS, type } }, { put, call }) {
      yield put({ type: 'modalPending', payload: true });

      try {
        const params = type ? { fieldId, filterJS: expandJS } : { fieldId, expandJS };
        yield call(type ? updateFieldExpandFilterJS : updateFieldExpandJS, params);
        message.success('保存成功');
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'modalPending', payload: false });
      }
    }
  },

  reducers: {
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
        displayName: record.displayname,
        fieldLabel: record.fieldlabel,
        recStatus: record.recstatus.toString(),
        fieldName: record.fieldname,
        fieldConfig: record.fieldconfig,
        fieldType: record.fieldtype,
        expandJS: record.expandjs,
        filterJS: record.filterjs
      };

      return {
        ...state,
        editingRecord,
        showModals: 'edit'
      };
    },
    editExpandJS(state, { payload: { record, type } }) {
      const editingRecord = {
        fieldId: record.fieldid,
        entityId: record.entityid,
        controlType: record.controltype.toString(),
        displayName: record.displayname,
        fieldLabel: record.fieldlabel,
        recStatus: record.recstatus.toString(),
        fieldName: record.fieldname,
        fieldConfig: record.fieldconfig,
        fieldType: record.fieldtype,
        expandJS: record.expandjs,
        filterJS: record.filterjs
      };

      return {
        ...state,
        editingRecord,
        showModals: 'expandJS-' + type
      };
    },
    add(state) {
      return { ...state, editingRecord: null, showModals: 'add' };
    },
    showModals(state, { payload }) {
      return { ...state, showModals: payload };
    },
    hideModal(state) {
      return { ...state, editingRecord: null, showModals: '', modalPending: false };
    },
    modalPending(state, { payload: pending }) {
      return { ...state, modalPending: pending };
    },
    resetState() {
      return {
        entityId: null,
        list: [],
        showModals: '',
        editingRecord: null,
        modalPending: false
      };
    }
  }
};
