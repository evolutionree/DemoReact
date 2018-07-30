/**
 * Created by 0291 on 2018/7/16.
 */
import React, { PropTypes, Component } from 'react';
import { Input, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import MD5 from 'md5';
import { translateMap } from '../util/BaiduTranslate';
import styles from './IntlInput.less';

let langlist = JSON.parse(window.localStorage.getItem('langlist')) || [];

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
    value: {}
  };
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      currentLocale: langlist[0] && langlist[0].key,
      value: this.transformValue(this.props.value),
      inputValue: this.transformValue(this.props.value)[langlist[0] && langlist[0].key] || ''
    };
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

  transformValue = (value) => { //兼容 国际化开发前的 数据
    return typeof value === 'string' ? { cn: value } : value ? value : {};
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
    this.setState({
      value: {
        ...this.state.value,
        [this.state.currentLocale]: e.target.value
      },
      inputValue: e.target.value,
      panelVisible: this.state.value ? false : true
    });
  }

  translateCNToOtherLang = (text, translate_lang, fromLang, toLang) => {
    if (!text) {
      return;
    }
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
          let val = {
            ...this.state.value,
            [translate_lang]: data instanceof Array && data[0].dst
          };
          this.props.onChange && this.props.onChange(val);
        } else {
          console.error('翻译出错，错误码：' + result.error_code + '|' + result.error_msg);
        }
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  inputBlur = (e) => {
    for (let i = 0; i < langlist.length; i++) { //翻译其他 语言
      const translate_lang = langlist[i].key;
      if (translateMap[translate_lang.toLocaleUpperCase()] && !this.state.value[translate_lang]) { //要翻译的语言版本 值还为空的时候 允许自动翻译
        this.translateCNToOtherLang(e.target.value, translate_lang, translateMap[this.state.currentLocale.toUpperCase()], translateMap[translate_lang.toLocaleUpperCase()]);
      }
    }

    let val = {
      ...this.state.value,
      [this.state.currentLocale]: e.target.value
    };
    this.props.onChange && this.props.onChange(val);
  }

  render() {
    return (
      <div className={styles.wrap} id="dropdownPanel">
        <Input onChange={this.inputChange}
               onBlur={this.inputBlur}
               ref={ref => this.inputRef = ref}
               value={this.state.inputValue}
               maxLength={this.props.maxLength}
               placeholder={this.props.placeholder}
               disabled={this.props.disabled}
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
