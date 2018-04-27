/**
 * Created by 0291 on 2018/4/26.
 * 国际版(多语言)容器
 */
import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-Hans-CN';
import { addLocaleData, IntlProvider, FormattedMessage } from 'react-intl';

const getCurrentAppLocale = () => {
  const language = 'zh-Hans-CN';
  switch (language) {
    case 'zh-Hans-CN':
      return zhCN;
    default:
      return enUS;
  }
}

const chooseLocale = () => {
  switch (navigator.language.split('_')[0]) {
    case 'en':
      return 'en_US';
    case 'zh':
      return 'zh_CN';
    default:
      return 'zh_CN';
  }
}

window.appLocale = getCurrentAppLocale();
addLocaleData(window.appLocale.data);

const IntlWrap = WrappedComponent => {
  return class extends Component {
    render() {
      return (
        <LocaleProvider locale={window.appLocale.antd}>
          <IntlProvider
            locale={window.appLocale.locale}
            messages={window.appLocale.messages}
          >
            <WrappedComponent {...this.props} />
          </IntlProvider>
        </LocaleProvider>
      );
    }
  };
}
export default IntlWrap;
