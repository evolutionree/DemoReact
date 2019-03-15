import React, { Component } from 'react';
import { Icon, message } from 'antd';
import _ from 'lodash';
import IntlInput from '../IntlInput';
import IntlText from '../IntlText';
import { dynamicRequest } from '../../../../services/entcomm';
import styles from './index.less';

export default class IntlEdittableCell extends Component {
  constructor(props) {
    super(props);
    const { record } = props;
    this.state = {
      text: record.displayname,
      value: record.displayname_lang,
      editable: false
    };
  }

  handleChange = (value) => this.setState({ value });

  check = () => {
    const { onChange, api } = this.props;
    this.setState({ editable: false });
    if (onChange) onChange(this.state.value);
    this.submitValue(api);
  }

  edit = () => this.setState({ editable: true });

  submitValue = (api) => {
    const { record: { fieldid, displayname_lang } } = this.props;
    const { value } = this.state;

    if (!api) {
      message.warn('IntlEdittableCell缺少api属性');
      return;
    }
    if (_.isEqual(displayname_lang, value)) return;

    const params = { fieldid, displayname_lang: value };
    dynamicRequest(api, params)
    .then(res => {
      const { error_msg } = res;
      message.success(error_msg || '修改成功');
    }).catch(e => {
      message.error(e.message || '修改失败');
    });
  }

  render() {
    const { text, value, editable } = this.state;

    return (
      <div className={styles.editableCell}>
        {
          editable ?
            <div className={styles.editableCellInputWrapper}>
              <IntlInput
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className={styles.editableCellIconCheck}
                onClick={this.check}
              />
            </div>
            :
            <div className={styles.editableCellTextWrapper}>
              <IntlText value={text} value_lang={value} />
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
