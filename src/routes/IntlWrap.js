/**
 * Created by 0291 on 2018/4/26.
 * 国际版(多语言)容器
 */
import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';
import antdEn from 'antd/lib/locale-provider/en_US';
import { addLocaleData, IntlProvider, FormattedMessage } from 'react-intl';
import intl from 'react-intl-universal';
const locales = {
  "en-US": require('../locales/en.json'),
  "zh-CN": require('../locales/zh.json')
};

const IntlWrap = WrappedComponent => {
  return class extends Component {
    componentDidMount() {
      this.initLocale(this.props.currentLocale);
    }

    componentWillReceiveProps(nextProps) {
      this.initLocale(nextProps.currentLocale);
    }

    initLocale(currentLocale) {
      console.log(currentLocale)
      intl.init({
        currentLocale, // TODO: determine locale here
        locales
      });
    }
    getCurrentAppLocale() {
      const language = this.props.currentLocale;
      switch (language) {
        case 'zh-CN':
          return zhCN;
        default:
          return enUS;
      }
    }

    getAntdLocale() {
      const language = this.props.currentLocale;
      switch (language) {
        case 'zh-CN':
          return null;
        case 'en-US':
          return antdEn;
        default:
          return null;
      }
    }

    render() {
      this.appLocale = this.getCurrentAppLocale();
      addLocaleData(this.appLocale.data);
      return (
        <LocaleProvider locale={this.getAntdLocale()}>
          <IntlProvider
            locale={this.appLocale.locale}
            messages={this.appLocale.messages}
          >
            <WrappedComponent {...this.props} />
          </IntlProvider>
        </LocaleProvider>
      );
    }
  };
}

export default IntlWrap;
