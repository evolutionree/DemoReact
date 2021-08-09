import Cookie from 'js-cookie';
import { Base64 } from 'js-base64';
import { JSEncrypt } from 'jsencrypt';
import request from '../utils/request';
import storage from '../utils/storage';

const TOKEN_KEY = 'auth_access_token';
const USER_KEY = 'auth_user';
const PERMISSION_KEY = 'auth_permission_level';  // 0无登录权限 1仅web 1仅管理后台 3都有权限
let rsa_public = ''; // RSA加密公钥

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
 * 注册用户
 * @param params
 * {
    "AccountName":"10888008001",
    "AccountPwd":"999999",
    "UserName":"系统管理员",
    "AccessType":"00",
    "UserIcon":"ICON",
    "UserPhone":"10000000000",
    "UserJob":"最高级管理员",
    "DeptId":"7f74192d-b937-403f-ac2a-8be34714278b"
  }
 * @returns {Promise.<Object>}
 */
export async function registerUser(params) {
  return encryptPassword(params.accountpwd).then(result => {
    return request('/api/account/regist', {
      method: 'post',
      body: JSON.stringify({
        ...params,
        accountpwd: result,
        encrypttype: 1
      })
    });
  });
}

/**
 * 登录
 * @param params
 *  { accountname, accountpwd, rememberpwd }
 * @returns {Promise.<Object>}
 */
export async function login(params, type) {
  const { accountname, accountpwd, rememberpwd,sendcode } = params;
  return encryptPassword(accountpwd, true).then(encryptedPwd => {
    return _login({
      accountname,
      sendcode,
      uniqueid:sessionStorage.getItem('uke_DeviceId'),
      accountpwd: encryptedPwd,
      encrypttype: 1
    });
  }).then(result => {
    const loginInfo = {
      user: {
        userNumber: result.data.usernumber
      },
      token: result.data.access_token,
      permissionLevel: toPermissionLevel(result.data.accesstype), // TODO
      security: result.data.security
    };
    rememberpwd ? setRememberedPwd({ account: accountname, pwd: accountpwd }) : setRememberedPwd(null);
    if (type === 'mobile') {
      setLogin(loginInfo);
    }
    return { loginInfo };
  });
}
/**
 * 登录
 * @param params
 *  {
      "AccountName":"302",
      "AccountPwd":密码文本，若不加密则为明文，若加密，则使用“时间戳_密码”的格式,登录时的时间戳值为getpublickey接口返回的timestamp（1分钟内有效）
      "EncryptType":加密方式，0=不加密，1=RSA方式加密
    }
 * @returns {Promise.<Object>}
 * @private
 */
function _login(params) {
  return request('/api/account/login', {
    method: 'post',
    body: JSON.stringify(params)
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
  const deviceid = sessionStorage.getItem('uke_DeviceId');

  // 解决串号问题
  if (lastToken && lastToken !== token) {
    _onTokenChange(lastToken, token);
  }
  lastToken = token;

  return { deviceid, token, user, permissionLevel };
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
export async function modifyPassword(params, headers = {}) {
  const { accountpwd, orginpwd } = params;
  return encryptPassword([accountpwd, orginpwd]).then(result => {
    const _params = {
      ...params,
      accountpwd: result[0],
      orginpwd: result[1],
      encrypttype: 1
    };
    return request('/api/account/pwd', {
      method: 'post',
      body: JSON.stringify(_params),
      headers
    });
  });
}

export function getSendCode() {
    // return request('/api/account/getverificationcode', {
    //   method: 'get'
    // }).then(result=>{
    //   return result;
    // });
    return '/api/account/getverificationcode?time='+Math.random(1000)+'&uniqueid='+sessionStorage.getItem('uke_DeviceId');
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

/**
 * 加密密码
 * @param password 待加密的密码(可传数组)
 */
export async function encryptPassword(password) {
  return getRsaPublicKey().then(result => {
    const { rsapublickey, timestamp } = result.data;
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(rsapublickey);
    if (typeof password === 'string') {
      return encrypt.encrypt(timestamp + '_' + password);
    } else if (Array.isArray(password)) {
      return password.map(item => encrypt.encrypt(timestamp + '_' + item));
    }
  });
}
function getRsaPublicKey() {
  return request('/api/account/getpublickey', {
    method: 'post'
  });
}
export function encryptPasswordSync(password) {
  const rsapublickey = getRsaPublicKeySync();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(rsapublickey);
  let result = password;
  if (typeof password === 'string') {
    result = rsapublickey ? encrypt.encrypt(password) : password;
  } else if (Array.isArray(password)) {
    result = password.map(item => rsapublickey ? encrypt.encrypt(item) : item);
  }
  return result;
}
function getRsaPublicKeySync() {
  return rsa_public;
}
export function initRsaPublicKey() {
  request('/api/account/getpublickey', {
    method: 'post'
  }).then(result => {
    rsa_public = result.data.rsapublickey;
  });
}

/**
 * 检查页面权限
 * @param params
 * { pageid: "xxx", extradata: {} }
 * @returns {Promise.<Object>}
 */
export async function checkPagePermission(params) {
  if (params.pageid === 'attendance') {
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
  return request('/api/pagepermission', {
    method: 'post',
    body: JSON.stringify(params)
  })
}


// /**
//  * 清除缓存
//  * @returns {Promise.<Object>}
//  */
// export async function connectSocket(userid) {
//   const { token } = getLocalAuthentication();
//   return new Promise(function(resolve, reject) {
//     let socket = new WebSocket('ws://10.187.134.10:732/ws/wechat');
//     socket.onopen = (event) => {
//       socket.send(JSON.stringify({ Cmd: 1, data: { userid: userid, authorizedcode: 'Bearer ' + token } }));
//       socket.onmessage = (event) => {
//         console.log('Client received a message',event)
//         resolve(event);
//       };
//       // socket.onclose = (event) => {
//       //   console.log('Client notified socket has closed',event)
//       // };
//     };
//   }).then((response) => {
//     // const errorCode = response.data.error_code;
//     // if (!errorCode) {
//     //   return response;
//     // } else {
//     //   const error = new Error(response.data.error_msg);
//     //   error.error_code = errorCode;
//     //   error.response = response;
//     //   throw error;
//     // }
//     return '成功';
//   }).then(result => result);
// }

/**
 * webIMSocket连接
 * @returns {Promise.<Object>}
 */
export async function connectWebIMSocket(userid) {
  const { token } = getLocalAuthentication();
  return new Promise(function(resolve, reject) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    let socket;
    if (host === 'localhost:8000') { //本地调试
      socket = new WebSocket('ws://10.187.134.10:732/ws/wechat');
    } else {
      socket = protocol === 'http:' ? new WebSocket('ws://' + host + '/ws/wechat') : new WebSocket('wss://' + host + '/ws/wechat');
    }
    socket.onopen = connectHandler;
    // socket.onmessage = (event) => {
    //   console.log('Client received a message', event);
    // };
    socket.onclose = (event) => {
      console.log('Client notified socket has closed', event);
    };

    socket.onerror = () => {
      reject(new Error('连接webSocker失败，webIM聊天功能暂时无法使用，请稍后重试'));
    }

    function connectHandler() {
      socket.send(JSON.stringify({ Cmd: 1, data: { userid: userid, authorizedcode: 'Bearer ' + token } }));
      resolve(socket);
    }
  }).then((response) => {
    return response;
  }).catch(err=> {
    throw err;
  });
}
