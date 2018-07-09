import { message } from 'antd';
import {
  connectWebIMSocket
} from '../services/authentication';
import { queryUserInfo, getrecentchat, getgrouplist, updategroupName } from '../services/structure';

export default {
  namespace: 'webIM',
  state: {
    //socket对象
    webIMSocket: null,

    //打开那个面板 及窗口信息
    showPanel: '',
    panelInfo: {},
    showChildrenPanel: '',
    childrenPanelInfo: '',

    //本地记录的收发即时通讯消息，刷新浏览器则清空
    messagelist: [],

    //上下文菜单
    contextMenuInfo: {},

    //最近聊天
    recentChatList: [],
    recent_list_loading: false,

    //群组
    groupChatList: [],
    group_list_loading: false,

    spotNewMsgList: JSON.parse(localStorage.getItem('spotNewMsgList')),

    showPicture: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({ type: 'init' });
      return history.listen(location => {
        //dispatch({ type: 'closePanel' });  //切换到其他路由页面时  所有有关WebIM的面板隐藏
      });
    }
  },
  effects: {
    *init({ payload }, { select, put }) {
      yield put({ type: 'connectSocket__' });
      yield put({ type: 'queryRecentList__' });
      yield put({ type: 'queryGroupList__' });
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
    *queryRecentList__(action, { select, call, put, take }) {
      yield put({
        type: 'putState',
        payload: { recent_list_loading: true }
      });
      try {
        const { data } = yield call(getrecentchat);
        const transformData = data instanceof Array && data.map(item => {
          return {
            ...item,
            date: item.recentlydate
          };
        })
        yield put({
          type: 'putState',
          payload: { recentChatList: transformData, recent_list_loading: false }
        });
      } catch (e) {
        message.error(e.message || '查询最近聊天列表失败');
        yield put({
          type: 'putState',
          payload: { recent_list_loading: false }
        });
      }
    },
    *queryGroupList__(action, { select, call, put, take }) {
      yield put({
        type: 'putState',
        payload: { group_list_loading: true }
      });
      try {
        const { data } = yield call(getgrouplist);
        const transformData = data instanceof Array && data.map(item => {
            return {
              ...item,
              chatid: item.chatgroupid,
              chatname: item.chatgroupname,
              date: item.recupdated
            };
        })
        yield put({
          type: 'putState',
          payload: { groupList: transformData, group_list_loading: false }
        });
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '查询群组列表失败');
        yield put({
          type: 'putState',
          payload: { group_list_loading: false }
        });
      }
    },
    *updateGroupInfo({ payload: groupName }, { select, call, put, take }) {
      let { panelInfo } = yield select(state => state.webIM);
      try {
        yield call(updategroupName, { groupId: panelInfo.chatid, groupName });
        yield put({ type: 'queryRecentList__' });
        yield put({ type: 'queryGroupList__' });
        yield put({
          type: 'putState',
          payload: { panelInfo: { ...panelInfo, chatname: groupName } }
        });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
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
      let spotNewMsgList = JSON.parse(localStorage.getItem('spotNewMsgList'));
      if (payload.showPanel === 'IMPanel' || payload.showPanel === 'miniIMPanel') { //打开了对话窗口
        delete spotNewMsgList[payload.panelInfo.chatid];
        localStorage.setItem('spotNewMsgList', JSON.stringify(spotNewMsgList));
      }
      return {
        ...state,
        showPanel: '',
        panelInfo: {},
        showChildrenPanel: '',
        childrenPanelInfo: '',
        showGrandsonPanel: '',
        grandsonPanelInfo: '',
        ...payload,
        spotNewMsgList
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
    putReceiveOrSendMessage(state, { payload: message }) {
      return {
        ...state,
        messagelist: [...state.messagelist, message]
      };
    },
    setContextMenu(state, { payload: contextMenuInfo }) {
      return {
        ...state,
        contextMenuInfo
      };
    },
    setSpotNewMsgList(state, { payload: newSpotNewMsgList }) {
      localStorage.setItem('spotNewMsgList', JSON.stringify(newSpotNewMsgList));
      return {
        ...state,
        spotNewMsgList: newSpotNewMsgList
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
