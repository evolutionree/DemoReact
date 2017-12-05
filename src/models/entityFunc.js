/**
 * Created by 0291 on 2017/12/5.
 */
import { message } from 'antd';
import {
  queryFields
} from '../services/entity';

export default {
  namespace: 'entityFunc',
  state: {
    entityId: null,
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/func/;
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
    showModals(state, { payload }) {
      return { ...state, showModals: payload };
    },
    resetState() {
      return {
        entityId: null,
        showModals: ''
      };
    }
  }
};
