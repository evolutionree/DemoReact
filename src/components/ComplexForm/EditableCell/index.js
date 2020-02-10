import React, { Component } from 'react';
import { Input, Icon, message } from 'antd';
import styles from './index.less';

export default class EditableCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      editable: props.editable
    }
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = (e) => {
    e.stopPropagation();
    if (!this.state.value) return message.warn('值不能为空');
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = (e) => {
    e.stopPropagation();
    this.setState({ editable: true });
  }
  render() {
    const { value, editable, placeholder = '未填写' } = this.state;
    return (

      <div className={styles.editableCell}>
        {
          editable ?
            <div className={styles.editableCellInputWrapper}>
              <Input
                onClick={e => e.stopPropagation()}
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
                placeholder={placeholder}
              />
              <Icon
                type="check"
                className={styles.editableCellIconCheck}
                onClick={this.check}
              />
            </div>
            :
            <div className={styles.editableCellTextWrapper}>
              {value || ' '}
              <Icon
                type="edit"
                className={styles.editableCellIcon}
                onClick={this.edit}
              />
            </div>
        }
      </div>
    );
  }
}
