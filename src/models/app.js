import { message, Modal } from 'antd';
import { routerRedux, hashHistory } from 'dva/router';
import storage from '../utils/storage';
import { subscribe as subscribeRequest } from '../utils/request';
import { queryUserInfo, querylanglist } from '../services/structure';

import {
  modifyPassword,
  modifyAvatar,
  getLocalAuthentication,
  logout,
  onTokenChange,
  initRsaPublicKey
} from '../services/authentication';
import { getGlobalMenus } from '../services/webmenus';
import { clearServerCache, queryYearWeekData } from '../services/basicdata';

const KEY_SIDER_FOLD = 'uke100_siderFold';
let logoutInfoBool = false;

export default {
  namespace: 'app',
  state: {
    siderFold: storage.getLocalItem(KEY_SIDER_FOLD) === 'true',
    menus: [],
    showModals: '',
    user: {},
    token: '',
    permissionLevel: 3,
    imageGallery: {},
    mapModal: {},
    noMinWidth: false,

    langlist: [],
    currentLocale: '' //系统设置默认语言【简体中文】
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 首次进入应用时，检查登录状态
      const { token, permissionLevel } = getLocalAuthentication();
      dispatch({ type: 'authCompany' });
      if (!token) {
        localStorage.removeItem('defaultPathType');
        location.href = '/login.html';
        // dispatch(routerRedux.push({ pathname: '/login' }));
      } else {
        dispatch({ type: 'loginSuccess', payload: { token, permissionLevel } });
        dispatch({ type: 'fetchGlobalMenus' });
        dispatch({ type: 'fetchUserInfo' });
        dispatch({ type: 'fetchYearWeekData' });
        dispatch({ type: 'initRsaPublicKey' });

        dispatch({ type: 'querylangs' });
      }
    },
    // session过期，退出登录
    onAjax({ dispatch }) {
      subscribeRequest({
        onRequest: () => { },
        onResponse: (error, response) => {
          message.destroy();
          if (response && response.data && response.data.error_code === -25013 && !logoutInfoBool) {
            logoutInfoBool = true;
            Modal.info({
              title: '被迫下线了,跳转到登录页',
              content: response.data.error_msg,
              onOk() { dispatch({ type: 'app/logout' }); }
            });
          }
        }
      });
    },
    onTokenChange() {
      onTokenChange((oldToken, newToken) => {
        // dispatch({ type: 'app/logout' });
        if (!newToken) {
          location.href = '/login.html';
        } else {
          location.reload();
        }
      });
    }
  },
  effects: {
    *querylangs({ payload }, { select, call, put }) {
      try {
        const { data } = yield call(querylanglist);
        window.localStorage.setItem('langlist', JSON.stringify(data));
        yield put({ type: 'initCurrentLocale', payload: data });
      } catch (e) {
        message.error(e.message);
      }
    },
    *initCurrentLocale({ payload: langlist }, { select, put }) {
      let currentLocale = window.localStorage.getItem('currentLocale') || '';
      if (!currentLocale && langlist instanceof Array && langlist.length > 0) {
        currentLocale = langlist[0].key;
      }
      yield put({ type: 'putState', payload: { currentLocale, langlist } });
    },
    *changeCurrentLocale({ payload: newLocale }, { select, call, put }) { //切换语言
      window.localStorage.setItem('currentLocale', newLocale);
      location.reload();
    },

    *toggleSider({ payload }, { select, put }) {
      const { siderFold } = yield select(state => state.app);
      const bool = payload !== undefined ? payload : !siderFold;
      storage.setLocalItem(KEY_SIDER_FOLD, bool);
      yield put({ type: 'putState', payload: { siderFold: bool } });
    },
    *modifyPassword({ payload }, { select, put, call }) {
      const { userid } = yield select(state => state.app.user);
      const params = { accountid: 0, userid, ...payload };
      try {
        yield call(modifyPassword, params);
        message.success('修改密码成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'relogout' });
      } catch (e) {
        message.error(e.message || '修改密码失败');
      }
    },
    *modifyAvatar({ payload: fileId }, { put, call }) {
      try {
        yield call(modifyAvatar, fileId);
        message.success('修改头像成功');
        yield put({ type: 'modifyAvatarSuccess', payload: fileId });
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        message.error(e.message || '修改头像失败');
      }
    },
    *relogout(_, { call }) {
      yield call(logout);
      localStorage.removeItem('defaultPathType');
      setTimeout(() => (location.href = '/login.html'), 500);
    },
    *logout(action, { call }) {
      yield call(logout);
      // yield put(routerRedux.push({ pathname: '/login' }));
      location.href = '/login.html';
      localStorage.removeItem('defaultPathType');
    },
    *fetchGlobalMenus(action, { call, put }) {
      try {
        const admin = /admin/.test(location.pathname);
        const paas = /paas/.test(location.pathname);
        const type = admin ? 1 : (paas ? 2 : 0);

        const result = yield call(getGlobalMenus, type);

        if (localStorage.getItem('defaultPathType') != type) {
          let defaultPath = '';
          let findFirstPath = true;
          function getDefaultPath(menus) {
            for (let i = 0; i < menus.length; i++) {
              if (menus[i].children && menus[i].children.length > 0) {
                getDefaultPath(menus[i].children);
              } else {
                if (menus[i].isDefaultPage * 1 === 1) {
                  defaultPath = menus[i].path;
                  break;
                }
                if (findFirstPath && menus[i].path) {
                  defaultPath = menus[i].path;
                  findFirstPath = false;
                }
              }
            }
            return defaultPath;
          }

          const firstPagePath = getDefaultPath(result.data);
          if (firstPagePath) {
            hashHistory.push(firstPagePath);
          } else {
            hashHistory.push('/nopermission');
          }
        }

        localStorage.setItem('defaultPathType', type);
        yield put({ type: 'putState', payload: { menus: result.data } });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取菜单入口失败');
      }
    },
    *fetchUserInfo(action, { call, put }) {
      const result = yield call(queryUserInfo);
      const { user, role } = result.data;
      user[0].role = role;
      yield put({ type: 'putState', payload: { user: user[0] } });
    },
    *clearServerCache(action, { call }) {
      try {
        yield call(clearServerCache);
        message.success('清除缓存成功');
      } catch (e) {
        message.error(e.message || '清除缓存失败');
      }
    },
    *fetchYearWeekData(action, { call, put }) {
      const yearWeekData = yield call(queryYearWeekData);
      yield put({
        type: 'putState',
        payload: { yearWeekData }
      });
    },
    *initRsaPublicKey(action, { call, put }) {
      yield call(initRsaPublicKey);
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showModals(state, { payload }) {
      return {
        ...state,
        showModals: payload
      };
    },
    modifyAvatarSuccess(state, { payload: filedId }) {
      return {
        ...state,
        user: {
          ...state.user,
          usericon: filedId
        }
      };
    },
    loginSuccess(state, { payload: { token, permissionLevel } }) {
      window.UMEDITOR_UPLOAD_TOKEN = token;
      return {
        ...state,
        token,
        permissionLevel
      };
    },
    viewImages(state, { payload }) {
      return {
        ...state,
        imageGallery: { images: payload }
      };
    },
    viewMapLocation(state, { payload }) {
      return {
        ...state,
        mapModal: { mapLocation: payload }
      };
    }
  }
};
