import {
  connectWebIMSocket
} from '../services/authentication';
import { queryUserInfo } from '../services/structure';

export default {
  namespace: 'webIM',
  state: {
    webIMSocket: null,
    showPanel: '',
    panelInfo: null,
    showChildrenPanel: '',
    childrenPanelInfo: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({ type: 'init' });
      return history.listen(location => {
        dispatch({ type: 'resetState' });  //切换到其他路由页面时  所有有关WebIM的面板隐藏及数据初始化
      });
    }
  },
  effects: {
    *init({ payload }, { select, put }) {
      yield put({ type: 'connectSocket' });
    },
    *connectSocket(action, { select, call, put, take }) { //链接webStocket
      const result = yield call(queryUserInfo);
      const { user } = result.data;
      const userid = user[0].userid;

      const webIMSocket = yield call(connectWebIMSocket, userid);
      yield put({
        type: 'putState',
        payload: { webIMSocket: webIMSocket }
      });
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    showPanel(state, { payload }) {
      return {
        ...state,
        showPanel: '',
        panelInfo: null,
        showChildrenPanel: '',
        childrenPanelInfo: '',
        ...payload
      };
    },
    closeOtherPanel(state) { //关闭webIM 左侧的面板（所有层关闭）
      return {
        ...state,
        showPanel: '',
        panelInfo: null,
        showChildrenPanel: '',
        childrenPanelInfo: ''
      };
    },
    resetState() {
      return {
        showPanel: '',
        panelInfo: null,
        showChildrenPanel: '',
        childrenPanelInfo: ''
      };
    }
  }
};
