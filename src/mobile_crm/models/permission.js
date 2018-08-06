import { message } from 'antd';
import { queryPermission } from '../../services/functions';

function getEntityId(routePath) {
  if (routePath === '/structure') {
    return '3d77dfd2-60bb-4552-bb69-1c3e73cf4095';
  }
}

const STATUS = {
  INIT: 0,
  PENDING: 1,
  READY: 2,
  EXPIRED: 3
};

export default {
  namespace: 'permission',
  state: {
    permissionFuncs: {},
    dataStatus: {}
  },
  subscriptions: {
    // setup({ dispatch, history }) {
    //   return history.listen(location => {
    //     const entityId = getEntityId(location.pathname);
    //     if (entityId) {
    //       dispatch({
    //         type: 'queryPermission',
    //         payload: entityId
    //       });
    //     }
    //   });
    // }
  },
  effects: {
    *queryPermission({ payload: entityId }, { select, put, call }) {
      const { dataStatus, permissionFuncs } = yield select(state => state.permission);
      const status = dataStatus[entityId];
      if (status === STATUS.PENDING) return;
      try {
        yield put({
          type: 'putState',
          payload: {
            dataStatus: {
              ...dataStatus,
              [entityId]: STATUS.PENDING
            }
          }
        });
        const { data } = yield call(queryPermission, entityId);
        yield put({
          type: 'receivePermissionFunc',
          payload: {
            entityId,
            permissionData: data
          }
        });
      } catch (e) {
        message.error(e.message || '获取权限数据失败');
        yield put({
          type: 'putState',
          payload: {
            dataStatus: {
              ...dataStatus,
              [entityId]: STATUS.EXPIRED
            }
          }
        });
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
    receivePermissionFunc(state, { payload: { entityId, permissionData } }) {
      return {
        ...state,
        permissionFuncs: {
          ...state.permissionFuncs,
          [entityId]: permissionData
        },
        dataStatus: {
          ...state.dataStatus,
          [entityId]: STATUS.READY
        }
      };
    }
  }
};
