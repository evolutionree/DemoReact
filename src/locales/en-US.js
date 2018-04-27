/**
 * Created by 0291 on 2018/4/26.
 */
import antdEn from 'antd/lib/locale-provider/en_US';
import appLocaleData from 'react-intl/locale-data/en';
import enMessages from './en.json';

export default {
  messages: {
    ...enMessages
  },
  antd: antdEn,
  locale: 'en-US',
  data: appLocaleData
}
