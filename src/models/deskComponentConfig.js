/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { getdeskcomponentlist, deskcomponentsave, enabledesktopcomponent } from '../services/deskConfig';

const columns = [{
  title: '组件名称',
  dataIndex: 'comname'
}, {
  title: '状态',
  dataIndex: 'status',
  render: (text) => {
    return ['停用', '启用'][text];
  }
}, {
  title: '组件宽度',
  dataIndex: 'comwidth'
}, {
  title: '最小高度',
  dataIndex: 'mincomheight'
}, {
  title: '最大高度',
  dataIndex: 'maxcomheight'
}, {
  title: '处理页面',
  dataIndex: 'comurl'
}, {
  title: '参数',
  dataIndex: 'comargs'
}, {
  title: '说明',
  dataIndex: 'comdesciption'
}];

export default {
  namespace: 'deskcomponentconfig',
  state: {
    protocol: columns,
    queries: {
      comname: '',
      status: 1
    },
    list: [],
    currItems: [],
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/deskcomponentconfig') {
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
    },
    *queryList(action, { put, call, select }) {
      const { queries: { comname, status } } = yield select(state => state.deskcomponentconfig);
      try {
        const { data } = yield call(getdeskcomponentlist, { comname, status: parseInt(status) });
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
    *search({ payload }, { select, call, put }) {
      yield put({ type: 'putState', payload: payload });
      yield put({ type: 'queryList' });
    },
    *setComponentStatus({ payload: { setStatus } }, { select, call, put }) {
      const { currItems } = yield select(state => state.deskcomponentconfig);
      try {
        yield call(enabledesktopcomponent, {
          dscomponetid: currItems[0].dscomponetid,
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
      const params = {
        ...submitData,
        comwidth: parseInt(submitData.comwidth)
      };

      try {
        yield call(deskcomponentsave, params);
        message.success(params.dscomponetid ? '修改成功' : '新增成功');
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
          comname: '',
          status: 1
        },
        list: [],
        currItems: [],
        showModals: ''
      };
    }
  }
};
