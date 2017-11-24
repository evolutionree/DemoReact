import Cookie from 'js-cookie';
import { Base64 } from 'js-base64';
import request from '../utils/request';
import storage from '../utils/storage';

const TOKEN_KEY = 'auth_access_token';
const USER_KEY = 'auth_user';
const PERMISSION_KEY = 'auth_permission_level';  // 0无登录权限 1仅web 1仅管理后台 3都有权限

// 串号问题
let lastToken = '';
const tokenChangeListener = [];

function _onTokenChange(oldVal, newVal) {
  tokenChangeListener.forEach((listener) => {
    listener(oldVal, newVal);
  });
}

/**
 * 监听token改变（另一个页签退出或者重新登录时触发，避免串号）
 * @param callback
 */
export function onTokenChange(callback) {
  tokenChangeListener.push(callback);
}

/**
 * 登录
 * @param params { username, password }
 * @returns {Promise.<Object>}
 */
export async function login(params) {
  const { accountname, accountpwd, rememberpwd } = params;
  return request('/api/account/login', {
    method: 'post',
    body: JSON.stringify({ accountname, accountpwd })
  }).then(result => {
    const loginInfo = {
      user: {
        userNumber: result.data.usernumber
      },
      token: result.data.access_token,
      permissionLevel: toPermissionLevel(result.data.accesstype) // TODO
    };
    rememberpwd ? setRememberedPwd({ account: accountname, pwd: accountpwd }) : setRememberedPwd(null);
    setLogin(loginInfo);
    return { loginInfo };
  });
}

/**
 * <Option value="00">无限制</Option>
  <Option value="01">仅WEB端</Option>
  <Option value="02">仅手机端</Option>
  <Option value="10">仅管理后台</Option>
  <Option value="11">WEB端+管理后台</Option>
  <Option value="12">手机端+管理后台</Option>
  <Option value="13">手机端+WEB端</Option>
 */
function toPermissionLevel(accessType) {
  switch (accessType) {
    case '00':
    case '11':
      return 3;
    case '10':
    case '12':
      return 2;
    case '01':
    case '13':
      return 1;
    default:
      return 0;
  }
}

export function setLogin({ user, token, permissionLevel }) {
  window.UMEDITOR_UPLOAD_TOKEN = token; // umeditor 获取token
  Cookie.set(TOKEN_KEY, token);
  Cookie.set(USER_KEY, JSON.stringify(user));
  Cookie.set(PERMISSION_KEY, permissionLevel + '');
}

/**
 * 从本地获取登录状态
 * @returns {Object}
 */
export function getLocalAuthentication() {
  // const token = storage.getLocalItem(TOKEN_KEY);
  // const user = storage.getLocalItem(USER_KEY);
  const token = Cookie.get(TOKEN_KEY);
  const user = Cookie.get(USER_KEY);
  const permissionLevel = +(Cookie.get(PERMISSION_KEY) || 3);

  // 解决串号问题
  if (lastToken && lastToken !== token) {
    _onTokenChange(lastToken, token);
  }
  lastToken = token;

  return { token, user, permissionLevel };
}

/**
 * 退出登录
 * @returns {void}
 */
export function logout() {
  // storage.removeLocalItem(TOKEN_KEY);
  // storage.removeLocalItem(USER_KEY);
  Cookie.remove(TOKEN_KEY);
  Cookie.remove(USER_KEY);
  Cookie.remove(PERMISSION_KEY);

  lastToken = '';
}

/**
 * 修改用户密码
 * @param params
 * {
    "AccountId":0, // 固定传0
    "UserId":1,
    "AccountPwd":"新密码",
    "OrginPwd":"老密码"
  }
 * @returns {Promise.<Object>}
 */
export async function modifyPassword(params) {
  return request('/api/account/pwd', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 修改用户头像
 * @param fileId
 * @returns {Promise.<Object>}
 */
export async function modifyAvatar(fileId) {
  return request('/api/account/modifyphoto', {
    method: 'post',
    body: JSON.stringify({ usericon: fileId })
  });
}

export function getRememberedPwd() {
  const jsonStr = storage.getLocalItem('uke100_pwd');
  if (jsonStr) {
    return JSON.parse(Base64.decode(jsonStr));
  }
  return null;
}

export function setRememberedPwd(rememberedPwd) {
  if (!rememberedPwd) {
    storage.removeLocalItem('uke100_pwd');
    return;
  }
  const jsonStr = JSON.stringify(rememberedPwd);
  storage.setLocalItem('uke100_pwd', Base64.encode(jsonStr));
}

export function getAppDownloadUrl() {
  return request('/api/account/downloadapp', {
    method: 'get'
  });
}
