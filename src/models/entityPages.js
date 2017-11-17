import { message } from 'antd';
import uuid from 'uuid';
import {
  queryEntryPages,
  saveEntryPages
} from '../services/entity';
import * as _ from 'lodash';

export default {
  namespace: 'entityPages',
  state: {
    entityId: null,
    formValue: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/pages/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          dispatch({
            type: 'putState',
            payload: {
              entityId
            }
          });
          dispatch({ type: 'queryEntryPages' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryEntryPages(action,{ select, put, call }) {
      const { entityId } = yield select(state => state.entityPages);
      try {
        const { data } = yield call(queryEntryPages, entityId);
        let formValue = {};
        formValue = _.mapValues(
          data,
          (val, key) => {
            let val_ = val;
            if (val !== undefined && val !== null) {
              val_ = val;
            }
            return { value: val_ };
          }
        );
        yield put({
          type: 'putState',
        payload: { formValue}
        });
      } catch (e) {
        message.error(e.message || '获取按钮列表失败');
      }
    },
    *savePage({ payload: formData }, { select, put, call }) {
      const { entityId} = yield select(state => state.entityPages);
      const params = {
        ...formData,
        entityid: entityId
      };
      try {
        const {data}=yield call(saveEntryPages, params);
        message.success(data);
        yield put({
          type: 'queryEntryPages'
        });
      } catch (e) {
        message.error(e.message || '保存失败');
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
        formValue: {}
      };
    }
  }
};
