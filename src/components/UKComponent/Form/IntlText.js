/**
 * Created by 0291 on 2018/7/16.
 */
import React from 'react';
import { connect } from 'dva';

function IntlText2({ value, value_lang, currentLocale }) {
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  let text = value_lang || value;
  if (text === null || text === undefined) {
    text = emptyText;
  } else if (text instanceof Object) {
    text = text[currentLocale] || value;
  } else {
    text += '';
  }
  return <span style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</span>;
}


function IntlText1({ name, value, currentLocale }) {
  if (value === null || value === undefined) {
    return '';
  }
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  const value_lang = value && value[name + '_lang'];

  let text = value_lang ? value_lang : value[name];
  if (text === null || text === undefined) {
    text = emptyText;
  } else if (text instanceof Object) { //当前存在国际化数据
    text = text[currentLocale] || value[name]; //可能国际化的某种版本语言不存在  则取默认的的值显示
  } else {
    text += '';
  }
  return <span style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</span>;
}

function IntlText(props) { //JSX提供两种方式写法
  if (props.name) { //<IntlText name="menuName" value={menu} />
    return IntlText1(props);
  } else { //<IntlText value={menu.menuName} value_lang={menu.menuName_lang} />
    return IntlText2(props);
  }
}

export function getIntlText(name, value) { //js写法
  if (value === null || value === undefined) return '';
  const currentLocale = window.localStorage.getItem('currentLocale') || '';
  const value_lang = value && value[name + '_lang'];
  let text = value_lang || value[name];
  if (text === null || text === undefined) {
    text = '';
  } else if (text instanceof Object) { //当前存在国际化数据
    text = text[currentLocale] || value[name]; //可能国际化的某种版本语言不存在  则取默认的的值显示
  }
  return text;
}

export default connect(
  state => {
    return {
      currentLocale: state.app.currentLocale
    };
  }
)(IntlText);
