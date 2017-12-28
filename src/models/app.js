import { message } from 'antd';
import { routerRedux } from 'dva/router';
import storage from '../utils/storage';
import { subscribe as subscribeRequest } from '../utils/request';
import { queryUserInfo } from '../services/structure';
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
    noMinWidth: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 首次进入应用时，检查登录状态
      const { token, permissionLevel } = getLocalAuthentication();
      dispatch({ type: 'authCompany' });
      if (!token) {
        location.href = '/login.html';
        // dispatch(routerRedux.push({ pathname: '/login' }));
      } else {
        dispatch({ type: 'loginSuccess', payload: { token, permissionLevel } });
        dispatch({ type: 'fetchGlobalMenus' });
        dispatch({ type: 'fetchUserInfo' });
        dispatch({ type: 'fetchYearWeekData' });
        dispatch({ type: 'initRsaPublicKey' });
      }
    },
    // session过期，退出登录
    onAjax({ dispatch }) {
      subscribeRequest({
        onRequest: () => {},
        onResponse: (error, response) => {
          if (response && response.data && response.data.error_code === -25013) {
            dispatch({ type: 'app/logout' });
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
    *logout(action, { call }) {
      yield call(logout);
      // yield put(routerRedux.push({ pathname: '/login' }));
      location.href = '/login.html';
    },
    *fetchGlobalMenus(action, { call, put }) {
      try {
        const type = /admin/.test(location.pathname) ? 1 : 0;
        const result = yield call(getGlobalMenus, type);
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
      console.log('fetchUserInfo', user);
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
