import { message } from 'antd';
import _ from 'lodash';
import { getGeneralProtocol, editEntcomm } from '../services/entcomm';

export default {
  namespace: 'entcommInfo',
  state: {
    editing: false,
    // detailData: {},
    detailProtocol: [],
    editData: {},
    editForm: null,
    editProtocol: [],
    permission: true,
    excutingJSLoading: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/info/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          dispatch({ type: 'putState', payload: { entityId, recordId } });
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, take }) {
      // 确保主页拿到详情数据后，再去拿详情协议
      const { recordDetail: { rectype } } = yield select(state => state.entcommHome);
      if (rectype) {
        yield put({ type: 'fetchDetailProtocol' });
      } else {
        let result;
        while (true) {
          result = yield take('entcommHome/putState');
          if (result.payload && result.payload.recordDetail) {
            yield put({ type: 'fetchDetailProtocol' });
            break;
          }
        }
      }
    },
    *fetchDetailProtocol(action, { select, put, call }) {
      const { recordDetail: { rectype } } = yield select(state => state.entcommHome);
      try {
        const { data: detailProtocol } = yield call(getGeneralProtocol, {
          typeid: rectype,
          operatetype: 2
        });
        yield put({ type: 'putState', payload: { detailProtocol } });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *fetchEditProtocol(action, { select, put, call }) {
      const { recordDetail: { rectype } } = yield select(state => state.entcommHome);
      if (!rectype) return;
      try {
        const { data: editProtocol } = yield call(getGeneralProtocol, {
          typeid: rectype,
          operatetype: 1
        });
        yield put({ type: 'putState', payload: { editProtocol } });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *startEdit(action, { select, put, call }) {
      let { editProtocol } = yield select(state => state.entcommInfo);
      const { recordDetail } = yield select(state => state.entcommHome);
      if (!editProtocol.length) {
        const { recordDetail: { rectype } } = yield select(state => state.entcommHome);
        if (!rectype) return;
        try {
          const result = yield call(getGeneralProtocol, {
            typeid: rectype,
            operatetype: 1
          });
          editProtocol = result.data;
          yield put({ type: 'putState', payload: { editProtocol } });
        } catch (e) {
          message.error(e.message || '获取协议失败');
          return;
        }
      }
      yield put({
        type: 'putState',
        payload: {
          editing: true,
          editData: genEditData()
        }
      });

      // fix 表格控件，加typeid
      function genEditData() {
        const retData = { ...recordDetail };
        editProtocol.forEach(field => {
          const { controltype, fieldname, fieldconfig } = field;
          if (controltype === 24 && retData[fieldname]) {
            retData[fieldname] = retData[fieldname].map(item => {
              return {
                TypeId: fieldconfig.entityId,
                FieldData: item
              };
            });
          }
        });
        return retData;
      }

    },
    *cancelEdit(action, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editing: false,
          editData: {}
        }
      });
    },
    *saveEdit(action, { select, put, call, cps }) {
      const { editForm } = yield select(state => state.entcommInfo);
      try {
        const values = yield cps(editForm.validateFields);
        yield put({ type: 'postEdit', payload: values });
      } catch (e) {
        message.error('请检查表单');
      }
    },
    *postEdit({ payload: formData }, { select, put, call }) {
      const { recordDetail } = yield select(state => state.entcommHome);
      try {
        const params = {
          typeid: recordDetail.rectype,
          recid: recordDetail.recid,
          fielddata: formData
        };
        yield call(editEntcomm, params);
        message.success('保存成功');
        yield put({ type: 'cancelEdit' });
        yield put({ type: 'entcommHome/fetchRecordDetail' });
      } catch (e) {
        message.error(e.message || '保存失败');
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
    resetState() {
      return {
        editing: false,
        detailProtocol: [],
        editData: {},
        editForm: null,
        editProtocol: [],
        permission: true,
        excutingJSLoading: false
      };
    }
  }
};
