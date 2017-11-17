import log from './log';

const UKBridge = {
  webViewBridge: null,
  connectWebViewJavascriptBridge(callback) {
    if (this.webViewBridge) {
      return callback(this.webViewBridge);
    }
    this._connectWebViewJavascriptBridge(callback);
  },
  _connectWebViewJavascriptBridge(callback) {
    log.log('start connectWebViewJavascriptBridge...');
    this._onWebViewBridgeReady(webViewBridge => {
      this.webViewBridge = webViewBridge;
      this._initWebViewBridge();
      callback(this.webViewBridge);
    });
  },
  _onWebViewBridgeReady(callback) {
    if (window.WebViewJavascriptBridge) {
      callback(window.WebViewJavascriptBridge);
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', () => {
        callback(window.WebViewJavascriptBridge);
      }, false);
    }
  },
  _initWebViewBridge() {
    this.webViewBridge.init(() => {
      log.log('WebViewJavascriptBridge initialized...');
    });
  },
  requestToken(appId, securityCode, randomCode, callBackFunc) {
    const params = {
      appId,
      securityCode,
      randomCode
    };
    this.webViewBridge.callHandler('requestToken', params, callBackFunc);
  },
  setReportFilter(filter, callBackFunc) {
    const params = {
      filter
    };
    this.webViewBridge.callHandler('setReportFilter', params, callBackFunc);
  },
  linkToPage(entityid, recid) {
    const params = {
      entityid,
      recid
    };
    this.webViewBridge.callHandler('linkToPage', params);
  }
};

export default UKBridge;
