/**
 * Created by 0291 on 2017/7/31.
 */
import React from 'react';
import { Input, InputNumber, message } from 'antd';
import styles from './styles.less';

class ParamEditable extends React.Component {
  static propTypes = {
    value: React.PropTypes.any,
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
     // this.input.focus();
    }
  }

  cellClickHandler() {
    this.props.onClick && this.props.onClick();
  }

  inputNumberChange(value) {
    if (/^[1-9][0-9]{0,1}$/.test(value)) {
      this.props.onChange && this.props.onChange(value);
    }else {
      message.warning('请输入1-99之间的整数');
    }

  }

  render() {
    const { value, editing, onChange, onBlur, maxLength, link, name } = this.props;
    return (
      <div className={styles.text}>
        {editing
          ? name === 'winrate' ? <InputNumber step={1} min={1} max={99}  value={value.toString().indexOf('%') > -1 ? (value.split('%')[0]) : value} onChange={this.inputNumberChange.bind(this)} /> : <Input
            value={value}
            ref={input => { this.input = input; }}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            maxLength={maxLength}
          />
          : link ? <a onClick={this.cellClickHandler.bind(this)}>{value}</a> : <span>{value}</span>
        }
      </div>
    );
  }
}

export default ParamEditable;
