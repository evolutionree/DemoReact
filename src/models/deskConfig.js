/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { getdesktops, enabledesktop, savedesktop, getroles, savedesktoprolerelate } from '../services/deskConfig';

const columns = [{
  title: '工作台名称',
  dataIndex: 'desktopname'
}, {
  title: '工作台说明',
  dataIndex: 'description'
}, {
  title: '状态',
  dataIndex: 'status',
  render: (text) => {
    return ['停用', '启用'][text];
  }
}, {
  title: '已绑定对象',
  dataIndex: 'rolesname'
}, {
  title: '版本后',
  dataIndex: 'version'
}, {
  title: '最后修改时间',
  dataIndex: 'modifytime'
}];

export default {
  namespace: 'deskconfig',
  state: {
    protocol: columns,
    queries: {
      desktopname: '',
      status: 1
    },
    list: [],
    currItems: [],
    showModals: '',
    roles: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/deskconfig') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put, call, select }) {
      yield put({ type: 'queryList' });
      yield put({ type: 'queryRoles' });
    },
    *queryList(action, { put, call, select }) {
      const { queries: { desktopname, status } } = yield select(state => state.deskconfig);
      try {
        const { data } = yield call(getdesktops, { desktopname, status: parseInt(status) });
        yield put({
          type: 'putState',
          payload: {
            list: data,
            currItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *queryRoles(action, { put, call, select }) {
      try {
        const { data } = yield call(getroles);
        yield put({ type: 'putState', payload: { roles: data } });
      } catch (e) {
        console.error(e.message)
        message.error(e.message);
      }
    },
    *search({ payload }, { select, call, put }) {
      yield put({ type: 'putState', payload: payload });
      yield put({ type: 'queryList' });
    },
    *setDeskStatus({ payload: { setStatus } }, { select, call, put }) {
      const { currItems } = yield select(state => state.deskconfig);
      try {
        yield call(enabledesktop, {
          desktopid: currItems[0].desktopid,
          status: setStatus
        });
        message.success(`${['停用', '启用'][setStatus]}成功`);
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    },
    *save({ payload: submitData }, { select, call, put }) {
      const params = submitData;
      try {
        yield call(savedesktop, params);
        message.success(params.desktopid ? '修改成功' : '新增成功');
        yield put({ type: 'putState', payload: { showModals: '' } });
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    },
    *saveRoles({ payload: submitData }, { select, call, put }) {
      try {
        yield call(savedesktoprolerelate, submitData);
        message.success('操作成功');
        yield put({ type: 'putState', payload: { showModals: '' } });
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    queries(state, { payload: queries }) {
      return { ...state, queries };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        protocol: columns,
        queries: {
          desktopname: '',
          status: 1
        },
        list: [],
        currItems: [],
        showModals: '',
        roles: []
      };
    }
  }
};
