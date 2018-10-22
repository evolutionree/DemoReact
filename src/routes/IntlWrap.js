/**
 * Created by 0291 on 2018/4/26.
 * 国际版(多语言)容器
 */
import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import antdEn from 'antd/lib/locale-provider/en_US';
import antdTW from 'antd/lib/locale-provider/zh_TW';
import intl from 'react-intl-universal';

const locales = {
  'en-US': require('../locales/en.json'),
  'zh-CN': require('../locales/zh.json')
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
      if (currentLocale) {
        let IntlUniversalLang = 'zh-CN';
        if (currentLocale.toUpperCase() === 'CN') {
          IntlUniversalLang = 'zh-CN';
        } else if (currentLocale.toUpperCase() === 'EN') {
          IntlUniversalLang = 'en-US';
        } else if (currentLocale.toUpperCase() === 'TW') {
          IntlUniversalLang = 'zh-TW';
        }
        intl.init({
          currentLocale: IntlUniversalLang, // TODO: determine locale here
          locales
        });
      }
    }

    getAntdLocale() {
      const language = this.props.currentLocale;
      switch (language.toUpperCase()) {
        case 'CN':
          return null;
        case 'EN':
          return antdEn;
        case 'TW':
          return antdTW;
        default:
          return null;
      }
    }

    render() {
      return (
        <LocaleProvider locale={this.getAntdLocale()}>
          <WrappedComponent {...this.props} />
        </LocaleProvider>
      );
    }
  };
}

export default IntlWrap;
