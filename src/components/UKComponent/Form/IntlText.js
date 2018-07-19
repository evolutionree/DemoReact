/**
 * Created by 0291 on 2018/7/16.
 */
import React from 'react';
import { connect } from 'dva';

function IntlText({ value, value_lang, currentLocale }) {
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  let text = value_lang ? value_lang : value;
  if (text === null || text === undefined) {
    text = emptyText;
  } else if (text instanceof Object) {
    text = text[currentLocale] || value;
  } else {
    text += '';
  }
  return <span style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</span>;
}

export default connect(
  state => {
    return {
      currentLocale: state.app.currentLocale,
      langlist: state.app.langlist
    };
  }
)(IntlText);
