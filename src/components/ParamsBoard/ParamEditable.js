import React from 'react';
import { Input } from 'antd';
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
    const { value, editing, onChange, onBlur, maxLength, link } = this.props;
    return (
      <div className={styles.text}>
        {editing
          ? (<Input
                value={value}
                ref={input => { this.input = input; }}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                maxLength={maxLength}
              />)
          : link ? <a onClick={this.cellClickHandler.bind(this)}>{value}</a> : <span>{value}</span>
        }
      </div>
    );
  }
}

export default ParamEditable;
