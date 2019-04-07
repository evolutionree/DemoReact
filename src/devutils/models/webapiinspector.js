import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { queryWebApiList } from '../services/webapiinspector';


export default {
  namespace: 'webapiinspector',
  state: {
    queries: {},
    list: [],
    total: 0,
    currentItems: [],
    entitySearchKey: '',
    webapis: [],
    showModals: '',
    modalPending: false,
    Haspaaspermission: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/webapiinspector') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryList({ payload }, { select, call, put }){
        console.log('进入queryList');
        var param = {} ;
        const { data } = yield call( queryWebApiList , param);
        yield put({ type: 'putState', payload: { webapis: data } });
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    resetState() {
      return {
        queries: {},
        list: [],
        total: 0,
        currentItems: [],
        entitySearchKey: '',
        webapis: [],
        showModals: '',
        modalPending: false
      }
    }
  }
};
