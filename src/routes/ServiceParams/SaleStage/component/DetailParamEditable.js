/**
 * Created by 0291 on 2017/8/4.
 */
import React from 'react';
import { Input, Icon, Checkbox } from 'antd';
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

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.icon ? true : false,
      icon: this.props.icon
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      icon: nextProps.icon,
      checked: nextProps.icon ? true : false
    })
  }

  componentDidUpdate() {
    if (this.props.editing) {
      this.input.focus();
    }
  }

  cellClickHandler() {
    this.props.onClick && this.props.onClick();
  }

  checkChange(e) {
    this.setState({
      checked: e.target.checked
    });
    this.props.onChange({ value: this.input.props.value, isneedupfile: e.target.checked ? 1 : 0 });
  }

  render() {
    const { value, editing, onChange, onBlur, maxLength, link } = this.props;
    const { icon } = this.state;
    return (
      <div className={styles.text} style={{ width: 400 }}>
        {editing
          ? <div>
            <Input
              style={{ width: 200 }}
              value={value}
              ref={input => { this.input = input; }}
              onChange={(e) => onChange({ value: e.target.value, isneedupfile: this.state.checked ? 1 : 0})}
              onBlur={onBlur}
              maxLength={maxLength}
            />
            <Checkbox style={{ marginLeft: '10px' }} onChange={this.checkChange.bind(this)} checked={this.state.checked}>上传文档</Checkbox>
          </div>
          : link ? <a onClick={this.cellClickHandler.bind(this)}>{value}</a> : <span>{value}{icon ? <Icon type={icon} style={{ marginLeft: '5px' }} /> : null}</span>
        }
      </div>
    );
  }
}

export default ParamEditable;
