import { message } from 'antd';
import {
  connectWebIMSocket
} from '../services/authentication';
import { queryUserInfo, getrecentchat } from '../services/structure';

export default {
  namespace: 'webIM',
  state: {
    webIMSocket: null,
    showPanel: '',
    panelInfo: {},
    showChildrenPanel: '',
    childrenPanelInfo: '',
    messagelist: null,
    contextMenuInfo: {}, //上下文菜单

    recentChatList: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({ type: 'init' });
      return history.listen(location => {
        dispatch({ type: 'closePanel' });  //切换到其他路由页面时  所有有关WebIM的面板隐藏
      });
    }
  },
  effects: {
    *init({ payload }, { select, put }) {
      yield put({ type: 'connectSocket__' });
      yield put({ type: 'queryRecentList' });
    },
    *connectSocket__(action, { select, call, put, take }) { //链接webStocket
      const result = yield call(queryUserInfo);
      const { user } = result.data;
      const userid = user[0].userid;

      const webIMSocket = yield call(connectWebIMSocket, userid);
      yield put({
        type: 'putState',
        payload: { webIMSocket: webIMSocket }
      });
    },
    *queryRecentList(action, { select, call, put, take }) {
      try {
        yield call(getrecentchat);
      } catch (e) {
        message.error(e.message || '查询最近聊天列表失败');
      }
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
        panelInfo: {},
        showChildrenPanel: '',
        childrenPanelInfo: '',
        ...payload
      };
    },
    closeOtherPanel(state) { //关闭webIM 左侧的面板（所有层关闭）
      return {
        ...state,
        showPanel: '',
        panelInfo: {},
        showChildrenPanel: '',
        childrenPanelInfo: ''
      };
    },
    receivemessage(state, { payload: message }) {
      return {
        ...state,
        messagelist: state.messagelist ? [...state.messagelist, message] : [message]
      };
    },
    setContextMenu(state, { payload: contextMenuInfo }) {
      return {
        ...state,
        contextMenuInfo
      };
    },
    closePanel() {
      return {
        showPanel: '',
        panelInfo: {},
        showChildrenPanel: '',
        childrenPanelInfo: '',
        contextMenuInfo: {}
      };
    }
  }
};
