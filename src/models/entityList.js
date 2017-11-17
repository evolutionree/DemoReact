import { routerRedux } from 'dva/router';
import { message, Modal } from 'antd';
import _ from 'lodash';
import {
  query,
  save,
  update,
  saveEntries,
  disableEntity,
  deleteEntity
} from '../services/entity';
import {
  correctPageSize,
  correctPageIndex
} from '../utils/common';

const confirmDelete = (callback) => {
  Modal.confirm({
    title: '该实体已有实例数据，删除实体将一并删除实例数据，请确定是否删除。选择【是】完成删除，选择【否】取消删除。',
    onOk() {
      callback(null, true);
    },
    onCancel() {
      callback(null, false);
    },
    okText: '是',
    cancelText: '否'
  });
};

export default {
  namespace: 'entityList',
  state: {
    entityTypes: [
      { label: '独立实体', id: '0' },
      { label: '嵌套实体', id: '1' },
      { label: '简单实体', id: '2' },
      { label: '动态实体', id: '3' }
    ],
    list: [],
    total: null,
    queries: {},
    showModals: '',
    currItems: [],
    editingRecord: {},
    modalPending: false
  },
  subscriptions: {
    // 订阅history，访问列表页面时，请求查询列表
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/entity') {
          dispatch({
            type: 'search',
            payload: location.query
          });
        }
      });
    }
  },
  effects: {
    *search({ payload: queries }, { select, put }) {
      // pageIndex 默认为1
      const DefaultPageSize = 10;
      const MaxLengthInput = 20;
      const DefaultMenuValue = '1';

      const { total, entityTypes } = yield select(state => state.entityList);

      let { pageIndex, pageSize, status, entityName, typeId } = queries; // 拿到想要查询的分页数据
      pageSize = correctPageSize(pageSize, DefaultPageSize);
      pageIndex = correctPageIndex(pageIndex, total, pageSize);

      // 下拉菜单类型的参数，需要校验是否存在
      if (['1', '0'].indexOf(status) === -1) {
        status = DefaultMenuValue;
      }
      if (typeId === undefined) {
        typeId = '-1';
      }
      // 输入框类型的参数，需要截断长度，甚至去特殊字符
      if (entityName && entityName.length > MaxLengthInput) {
        entityName = entityName.slice(0, MaxLengthInput);
      }
      entityName = entityName || '';
      const corrected = { pageIndex, pageSize, status: +status, entityName, typeId: +typeId };
      yield put({ type: 'query', payload: corrected });
    },
    // 查询列表数据
    *query({ payload: queries }, { put, call }) {
      yield put({ type: 'queryRequest', payload: queries });

      try {
        const { data } = yield call(query, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total
          }
        });
      } catch (e) {
        yield put({ type: 'queryFailure', payload: e.message });
      }
    },
    // 删除记录
    *del({ payload: records }, { put, call, cps }) {
      const entityid = _.map(records, 'entityid').join(',');
      try {
        const params = {
          entityid,
          recstatus: 2
        };
        yield call(disableEntity, params);
        message.success('删除成功');
        yield put({ type: 'refreshPage' });
      } catch (e) {
        // 若实体下存在实例数据，则弹窗确认
        if (e.message === 'hasdata') {
          const confirmed = yield cps(confirmDelete);
          if (confirmed) {
            try {
              yield call(deleteEntity, entityid);
              message.success('删除成功');
              yield put({ type: 'refreshPage' });
            } catch (e2) {
              message.error(e2.message || '删除失败');
            }
          }
          return;
        }
        message.error(e.message || '删除失败');
      }
    },
    *disable({ payload: records }, { put, call }) {
      try {
        const params = {
          entityid: records[0].entityid,
          recstatus: records[0].recstatus === 0 ? 1 : 0
        };
        yield call(disableEntity, params);
        message.success(records[0].recstatus === 0 ? '启用成功' : '停用成功');
        yield put({ type: 'refreshPage' });
      } catch (e) {
        message.error(e.message || (records[0].recstatus === 0 ? '启用失败' : '停用失败'));
      }
    },
    // 新增/编辑记录
    *save({ payload: data }, { put, call }) {
      const isAdd = !data.entityid;
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(isAdd ? save : update, data);
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'hideModal' });
        yield put({ type: 'refreshPage', payload: isAdd });
      } catch (e) {
        message.error(e.message || '保存失败');
        yield put({ type: 'saveFail', payload: e });
      }
    },
    *refreshPage({ payload: resetQuery }, { select, put }) {
      // TODO dangerLocation
      const dangerLocation = yield select(({ routing }) => routing.locationBeforeTransitions);
      yield put(routerRedux.replace({
        pathname: '/entity',
        query: resetQuery ? undefined : dangerLocation.query
      }));
    },
    *saveEntries({ payload: data }, { call, put }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(saveEntries, data);
        message.success('保存成功');
        yield put({ type: 'hideModal' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '保存失败');
      }
    }
  },
  reducers: {
    queryRequest(state, { payload: queries }) {
      return { ...state, queries };
    },
    querySuccess(state, { payload }) {
      return {
        ...state,
        list: payload.list,
        total: payload.total,
        currItems: []
      };
    },
    queryFailure(state, { payload: errMsg }) {
      return { ...state, errMsg };
    },
    edit(state, { payload: record }) {
      return {
        ...state,
        editingRecord: record,
        showModals: 'edit'
      };
    },
    add(state) {
      return { ...state, editingRecord: null, showModals: 'add' };
    },
    saveFail(state, { payload: errMsg }) {
      return { ...state, errMsg, modalPending: false };
    },
    showModals(state, { payload: showModals }) {
      return { ...state, showModals };
    },
    hideModal(state) {
      return { ...state, editingRecord: null, showModals: '', modalPending: false };
    },
    modalPending(state, { payload: pending }) {
      return { ...state, modalPending: pending };
    },
    currItems(state, { payload: items }) {
      return { ...state, currItems: items };
    }
  }
};
