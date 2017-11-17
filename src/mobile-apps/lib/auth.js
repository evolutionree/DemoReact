import md5 from 'md5';
import UKBridge from './uk-bridge';
import log from './log';
import { genRandomCode } from './common';
import request from '../../utils/request';
import { setLogin, getLocalAuthentication, login as webLogin } from '../../services/authentication';
import env from './enviroment';

export function hasLogin() {
  const { token, user } = getLocalAuthentication();
  return !!(token && user);
}

export function login() {
  if (env.dev) {
    return mockWebLogin();
  }
  return _requestToken().then(_login);
}

// 方便在本地开发用
function mockWebLogin() {
  log.log('本地调试')
  const params = {
    accountname: 10888008001,
    accountpwd: '123456'
  };
  return webLogin(params);
}

function _requestToken() {
  return new Promise((resolve, reject) => {
    const appId = genRandomCode();
    const securityCode = genRandomCode();
    const randomCode = genRandomCode();
    UKBridge.requestToken(appId, securityCode, randomCode, (response) => {
      const { error, result, data } = response;
      log.log('[bridge]requestToken 返回结果：' + JSON.stringify(response));
      if (result === 1) {
        log.log('获取临时token成功：' + data);
        resolve({ randomCode, token: data });
      } else {
        log.log('获取临时token失败：' + error);
        reject(new Error(error));
      }
    });
  });
}
function _login({ randomCode, token }) {
  log.log('请求登录接口: randomCode ' + randomCode + ' , token ' + token);
  return request('/api/Account/authlogin', {
    method: 'POST',
    body: JSON.stringify({
      AccessToken: token,
      Md5: md5(randomCode + token)
    })
  }).then(response => {
    log.log('登录成功：response ' + JSON.stringify(response));
    const { access_token, usernumber } = response.data;
    setLogin({
      token: access_token,
      user: JSON.stringify({ userNumber: usernumber })
    });
    return { user: usernumber };
  });
}
