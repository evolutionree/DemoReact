import React, { Component } from 'react';
import { Icon, message } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import classNames from 'classnames';
import IntlInput from '../IntlInput';
import IntlText from '../IntlText';
import { dynamicRequest } from '../../../../services/entcomm';
import styles from './index.less';

class IntlEdittableCell extends Component {
  constructor(props) {
    super(props);
    const { record } = props;
    this.state = {
      text: record.displayname,
      value: record.displayname_lang,
      editable: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { record: oldRecord } = this.props;
    const { record } = nextProps;
    for (const key in record.displayname_lang) {
      if ((oldRecord.displayname_lang && oldRecord.displayname_lang[key]) !== (record.displayname_lang && record.displayname_lang[key])) {
        this.setState({
          text: record.displayname,
          value: record.displayname_lang
        });
      }
    }
  }

  handleChange = (value) => this.setState({ value });

  check = (e) => {
    const { api, onActive } = this.props;
    if (e) e.stopPropagation();
    if (onActive) onActive(false);
    this.setState({ editable: false });
    this.submitValue(api);
  }

  edit = (e) => {
    const { callback, onActive } = this.props;
    // if (e) e.stopPropagation();
    if (callback) callback(this);
    this.setState({ editable: true });
    if (onActive) onActive(true);
  }

  submitValue = (api) => {
    const { record: { fieldid, displayname_lang }, dispatch, otherParams, onChange, getFieldsValue } = this.props;
    const { value } = this.state;

    if (!api) {
      message.warn('IntlEdittableCell缺少api属性');
      return;
    }

    if (_.isEqual(displayname_lang, value)) return;

    const params = otherParams ? {
      ...otherParams,
      newgroupname: value && value.cn,
      newgroupname_lang: JSON.stringify(value)
    } : { fieldid, displayname_lang: value };

    dynamicRequest(api, params)
      .then(res => {
        const { error_msg } = res;
        message.success(error_msg || '修改成功');
        if (!otherParams) dispatch({ type: 'entityFields/query' });
        if (onChange) onChange(value);
      }).catch(e => {
        message.error(e.message || '修改失败');
      });
  }

  onChangeItem = (e) => {
    if (this.state.editable) return;
    const { onChange, otherParams } = this.props;
    const { value } = this.state;
    if (otherParams && onChange) onChange(value, e);
  }

  render() {
    const { className, active, hoverStyle, style } = this.props;
    const { text, value, editable } = this.state;
    const wrap = classNames({
      [styles.editableCell]: true,
      [editable ? hoverStyle : className]: true,
      [styles.activeStyle]: active && !editable
    });

    return (
      <div className={wrap} style={style} onClick={this.onChangeItem}>
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

export default connect(() => ({}), dispatch => ({ dispatch }))(IntlEdittableCell);
