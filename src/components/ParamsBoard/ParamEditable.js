import React from 'react';
import { Input } from 'antd';
import IntlInput from '../../components/UKComponent/Form/IntlInput';
import IntlText from '../../components/UKComponent/Form/IntlText';
import classnames from 'classnames';
import styles from './styles.less';

class ParamEditable extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    editing: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onBlur: React.PropTypes.func,
    link: React.PropTypes.bool
  };

  static defaultProps = {
    value: '',
    editing: false
  };

  // componentWillReceiveProps(nextProps) {
  //
  // }

  componentDidUpdate() {
    if (this.props.editing) {
     this.input.focus();
    }
  }

  cellClickHandler() {
    this.props.onClick && this.props.onClick();
  }

  render() {
    const { value, editing, onChange, onBlur, maxLength, link, isIntl, value_lang } = this.props; //intl  是否需要国际化输入

    const showText = isIntl ? <IntlText value={value} value_lang={value_lang} /> : value;
    return (
      <div className={classnames(styles.text, { [styles.textEidt]: editing })}>
        {editing
          ? (isIntl ? <IntlInput
                value={value_lang}
                ref={input => { this.input = input; }}
                onChange={(data) => onChange(data)}
                onBlur={onBlur}
                maxLength={maxLength}
              /> : <Input
            value={value}
            ref={input => { this.input = input; }}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            maxLength={maxLength}
          />)
          : link ? <a onClick={this.cellClickHandler.bind(this)}>{showText}</a> : <span>{showText}</span>
        }
      </div>
    );
  }
}

export default ParamEditable;
