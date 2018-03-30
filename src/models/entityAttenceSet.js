/**
 * Created by 0291 on 2018/3/7.
 */
import _ from 'lodash';
import { message } from 'antd';
import { queryFields } from '../services/entity';

export default {
  namespace: 'entityAttenceSet',
  state: {

  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/attenceset/;
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
          dispatch({ type: 'queryAllFields', payload: entityId });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryAllFields({ payload: entityId }, { put, call }) {

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

      };
    }
  }
};
