/**
 * Created by 0291 on 2018/7/16.
 */
import React, { PropTypes, Component } from 'react';
import { Select, Input, Icon } from 'antd';
import classnames from 'classnames';

let currentLocale = window.localStorage.getItem('currentLocale') || 'zh-CN';
if(currentLocale === 'zh-CN') {
  currentLocale = 'cn';
} else {
  currentLocale = 'en';
}

function IntlText({ value, value_lang }) {
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  let text = value;
  if (text === null || text === undefined) {
    text = emptyText;
  } else if (text instanceof Object) {
    text = text[currentLocale] || value
  } else {
    text += '';
  }
  return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</div>;
}

export default IntlText;
