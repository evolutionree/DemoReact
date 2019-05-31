import { message } from 'antd';
import uuid from 'uuid';
import {
  addFunctionButton,
  delFunctionButton,
  editFunctionButton,
  queryFunctionButtons,
  sortFunctionButton
} from '../services/entity';
import * as _ from 'lodash';

export default {
  namespace: 'entityButtons',
  state: {
    entityId: null,
    entityType: null,
    buttons: [],
    selectedButton: '',
    formValue: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/buttons/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];

          dispatch({ type: 'Init', payload: { entityId, entityType } });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *Init({ payload }, { put }) {
      yield put({ type: 'putState', payload });
      yield put({ type: 'queryButtons' });
    },
    *queryButtons({ payload: persistSelect }, { select, put, call }) {
      const { entityId, selectedButton } = yield select(state => state.entityButtons);
      try {
        const { data } = yield call(queryFunctionButtons, entityId);
        yield put({
          type: 'putState',
          payload: {
            buttons: data
          }
        });
        if (Array.isArray(data) && data.length) {
          const newSelected = (persistSelect && _.find(data, ['id', selectedButton]))
            ? selectedButton
            : data[0].id;
          yield put({
            type: 'selectButton',
            payload: newSelected
          });
        } else {
          yield put({
            type: 'putState',
            payload: { selectedButton: '' }
          });
        }
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取按钮列表失败');
      }
    },
    *selectButton({ payload: id }, { select, put, call }) {
      function transVal(val, key) {
        if (key === 'displayposition') {
          return val.map(item => item + '');
        }
        if (key === 'selecttype') {
          return val + '';
        }
        if (key === 'extradata') {
          try {
            if ((typeof val).toLocaleLowerCase() === 'object') {
              return JSON.stringify(val);
            }
            return val;
          } catch (e) {
            return '';
          }
        }
        return val;
      }
      const { buttons } = yield select(state => state.entityButtons);
      const buttonData = _.find(buttons, ['id', id]);
      let formValue = {};
      if (buttonData) {
        formValue = _.mapValues(
          buttonData,
          (val, key) => {
            let val_ = val;
            if (val !== undefined && val !== null) {
              val_ = transVal(val, key);
            }
            return { value: val_ };
          }
        );
      }
      yield put({
        type: 'putState',
        payload: { formValue, selectedButton: id }
      });
    },
    *createButton(action, { select, put, call }) {
      const { buttons } = yield select(state => state.entityButtons);
      const newButton = {
        id: '__' + uuid.v1(),
        name: '按钮'
      };
      yield put({
        type: 'putState',
        payload: { buttons: [newButton, ...buttons] }
      });
      yield put({
        type: 'selectButton',
        payload: newButton.id
      });
    },
    *saveButton({ payload: formData }, { select, put, call }) {
      const { entityId, selectedButton: id } = yield select(state => state.entityButtons);
      const isAdd = /^__/.test(id) || !id;
      const params = {
        ...formData,
        displayposition: formData.displayposition && formData.displayposition.map(item => +item),
        selecttype: formData.selecttype && +formData.selecttype,
        id: isAdd ? undefined : id.replace(/^__/, ''),
        entityid: entityId
      };
      try {
        yield call(isAdd ? addFunctionButton : editFunctionButton, params);
        message.success('保存成功');
        yield put({
          type: 'queryButtons',
          payload: !isAdd
        });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *delButton({ payload: id }, { select, put, call }) {
      const { entityId, buttons } = yield select(state => state.entityButtons);
      if (/^__/.test(id)) {
        yield put({ type: 'queryButtons' });
        return false;
      }
      const params = { id, entityId };
      try {
        yield call(delFunctionButton, params);
        message.success('删除成功');
        yield put({ type: 'queryButtons' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *reorderButtons({ payload: newOrderButtons }, { select, put, call }) {
      if (newOrderButtons.some(item => /^__/.test(item))) {
        return message.error('请先保存新增的按钮');
      }
      const { entityId } = yield select(state => state.entityButtons);
      const params = {
        entityId,
        ordermapper: newOrderButtons.reduce((result, item, index) => {
          return { ...result, [item.id]: index };
        }, {})
      };
      try {
        yield call(sortFunctionButton, params);
        yield put({
          type: 'putState',
          payload: {
            buttons: newOrderButtons
          }
        });
      } catch (e) {
        message.error(e.message || '排序失败');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    resetState() {
      return {
        entityId: null,
        entityType: null,
        buttons: [],
        selectedButton: '',
        formValue: {}
      };
    }
  }
};
