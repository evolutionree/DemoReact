import { queryEntityDetail } from '../services/entity';

export default {
  namespace: 'entityHome',
  state: {
    entityId: null,
    entityName: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          dispatch({ type: 'init', payload: entityId });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: entityId }, { select, put, call }) {
      const { entityId: lastEntityId } = yield select(state => state.entityHome);
      if (entityId !== lastEntityId) {
        yield put({ type: 'putState', payload: { entityId } });
        yield put({ type: 'queryEntityDetail' });
      }
    },
    *queryEntityDetail(action, { select, put, call }) {
      const { entityId } = yield select(state => state.entityHome);
      const { data: { entityproinfo } } = yield call(queryEntityDetail, entityId);
      yield put({ type: 'entityName', payload: entityproinfo[0].entityname });
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    entityName(state, { payload: entityName }) {
      return {
        ...state,
        entityName
      };
    },
    resetState() {
      return {
        entityId: null,
        entityName: ''
      };
    }
  }
};
