/**
 * Created by 0291 on 2018/7/16.
 */
import React, { Component } from 'react';
import { Input, Icon } from 'antd';
import * as _ from 'lodash';
import classnames from 'classnames';
import MD5 from 'md5';
import { translateMap } from '../util/BaiduTranslate';
import styles from './IntlInput.less';

const langlist = JSON.parse(window.localStorage.getItem('langlist')) || [];

const CN = 'CN';

class IntlInput extends Component {
  static propTypes = {
    maxLength: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool
  };
  static defaultProps = {
    // value: {}
  };
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      currentLocale: langlist[0] && langlist[0].key,
      value: this.transformValue(props.value),
      inputValue: this.transformValue(props.value)[langlist[0] && langlist[0].key] || ''
    };
    this.translateLang = _.debounce(this.translateLang, 800);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    if ($(event.target).closest('#dropdownPanel').length) {
      return;
    }
    this.setState({
      panelVisible: false
    });
  };

  componentWillReceiveProps(nextProps) {
    const inputValue = this.transformValue(nextProps.value);
    if (JSON.stringify(this.transformValue(this.props.value)) !== JSON.stringify(inputValue)) {
      this.setState({
        value: inputValue,
        inputValue: inputValue[this.state.currentLocale] || ''
      });
    }
  }

  validator = (rule, value, callback) => {
    const relanglist = JSON.parse(window.localStorage.getItem('langlist'));
    relanglist instanceof Array && relanglist.forEach(item => {
      if (!(value && value[item.key])) {
        callback(item.dispaly + '必填');
      }
    });
    callback();
  }

  transformValue = (value) => { //兼容 国际化开发前的 数据
    return typeof value === 'string' ? { cn: value } : value || {};
  }

  focus = () => {
    this.inputRef.focus();
  }

  openPanel = () => {
    this.setState({
      panelVisible: !this.state.panelVisible
    });
  }

  onSelectLocale = (item) => {
    this.inputRef.focus();
    this.setState({
      inputValue: this.state.value[item.key] || '',
      currentLocale: item.key,
      panelVisible: false
    });
  }

  inputChange = (e) => {
    const value = e.target.value ? e.target.value.trim() : e.target.value;
    this.setState({
      value: {
        ...this.state.value,
        [this.state.currentLocale]: value
      },
      inputValue: value,
      panelVisible: !this.state.value
    }, () => this.translateLang(this.state.value, this.state.currentLocale));
  }

  translateCNToOtherLang = (text, translate_lang, fromLang, toLang) => {
    console.log(text, translate_lang, fromLang, toLang)
    const { onChange } = this.props;

    if (!text) return;

    const appid = '20180727000189469';
    const key = 'lTvPvTz1SzUqP1Lmjeoo';
    const salt = (new Date()).getTime();
    const query = text;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    const from = fromLang;
    const to = toLang;
    const str1 = appid + query + salt + key;
    const sign = MD5(str1);
    $.ajax({ //axios不支持JSONP  so 用jquery 也可以安装jsonp
      url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
      type: 'get',
      dataType: 'jsonp',
      data: {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      },
      success: (result) => { //[{src: "中国", dst: "China"}]
        const data = result.trans_result;
        if (data) {
          const val = {
            ...this.state.value,
            [translate_lang]: data instanceof Array && data[0].dst
          };
          if (onChange) onChange(val);
        } else {
          console.error('翻译出错，错误码：' + result.error_code + '|' + result.error_msg);
        }
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  translateLang = (e, currentLocale) => {
    for (let i = 0; i < langlist.length; i += 1) { //翻译其他 语言
      const translate_lang = langlist[i].key;
      if (translateMap[translate_lang.toLocaleUpperCase()] && (e.cn || (e.target && e.target.value))) { //要翻译的语言版本 值还为空的时候 允许自动翻译
        this.translateCNToOtherLang(e.cn || e.target.value, translate_lang, translateMap[currentLocale.toUpperCase()], translateMap[translate_lang.toLocaleUpperCase()]);
      }
    }
  }

  inputBlur = (e) => {
    const { onChange } = this.props;
    const { currentLocale } = this.state;

    this.translateLang(e, currentLocale);

    const val = {
      ...this.state.value,
      [this.state.currentLocale]: e.target.value
    };
    if (onChange) onChange(val);
  }

  render() {
    const { onPressEnter, placeholder, disabled, maxLength, className } = this.props;

    return (
      <div className={classnames(styles.wrap, className)} id="dropdownPanel">
        <Input onChange={this.inputChange}
          onBlur={this.inputBlur}
          onPressEnter={onPressEnter}
          ref={ref => this.inputRef = ref}
          value={this.state.inputValue}
          maxLength={this.state.currentLocale.toUpperCase() === CN ? `${maxLength}` : null}
          placeholder={placeholder}
          disabled={disabled}
          addonAfter={
            <div onClick={this.openPanel} className={styles.inputAddoAfter}>
              {this.state.currentLocale.toUpperCase()}
              <Icon type="down" style={{ transform: this.state.panelVisible ? 'scale(0.75) rotate(180deg)' : 'scale(0.75) rotate(0deg)' }} />
            </div>
          } />
        <div className={classnames(styles.dropdownPanel, { [styles.visible]: this.state.panelVisible })}>
          <ul>
            {
              langlist instanceof Array && langlist.map((item, index) => {
                return (
                  <li onClick={this.onSelectLocale.bind(this, item)} key={index}>
                    <span className={styles.valueWrap}>{this.state.value[item.key]}</span>
                    <span className={classnames(styles.localName, { [styles.active]: this.state.currentLocale === item.key })}>{item.dispaly}</span>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default IntlInput;
