import axios from 'axios';

function getAccessToken() {
  const access_token = window.localStorage.getItem('access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwidXNlcm5hbWUiOiLns7vnu5_nrqHnkIblkZgiLCJleHAiOjE1MzcxNDUyOTUsImlzcyI6IkNybSJ9.TAuagTY0cJSweNC9BfFZOkhByOGTRJcV4TKM7fjQJtc';
  return access_token;
}

function checkErrorCode(response) {
  const errorCode = response.data.error_code;
  if (!errorCode) {
    return response;
  } else {
    const error = new Error(response.data.error_msg);
    error.error_code = errorCode;
    error.response = response;
    throw error;
  }
}

export function getDeviceHeaders() {
  return {
    Device: 'WEB',
    Vernum: '1.0.0'
  };
}

export function getAuthedHeaders() {
  return {
    ...getDeviceHeaders(),
    Authorization: `Bearer ${getAccessToken()}`
  };
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {Promise<object>}  An object containing either "data" or "err"
 */
export default function request(url, options) {
  const opts = { ...options };
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...getDeviceHeaders()
  };
  if (!/login/.test(url) && !/account\/getpublickey/.test(url)) {
    defaultHeaders.Authorization = `Bearer ${getAccessToken()}`;
  }

  opts.headers = options.headers ? { ...defaultHeaders, ...options.headers }
    : defaultHeaders;

  if (options.body) {
    opts.data = JSON.parse(options.body);
  }

  return axios(url, opts)
    .then(checkErrorCode, err => {
      console.error(err);
      const error = new Error('连接服务器失败，请稍后重试');
      error.response = err.response;
      throw error;
    })
    .then(result => result.data);
}

// export default function requestSync(url, options) {
// }

/**
 * 请求，响应hook
 * @param onRequest
 * @param onResponse
 * @returns {unsubscribe}
 */
export function subscribe({ onRequest, onResponse }) {
  let requestInterceptor = null;
  let responseInterceptor = null;
  if (onRequest) {
    requestInterceptor = axios.interceptors.request.use(config => {
      onRequest(null, config);
      return config;
    }, error => {
      onRequest(error);
      return Promise.reject(error);
    });
  }
  if (onResponse) {
    responseInterceptor = axios.interceptors.response.use(response => {
      onResponse(null, response);
      return response;
    }, error => {
      onResponse(error);
      return Promise.reject(error);
    });
  }
  return function unsubscribe() {
    requestInterceptor && axios.interceptors.request.eject(requestInterceptor);
    responseInterceptor && axios.interceptors.request.eject(responseInterceptor);
  };
}
