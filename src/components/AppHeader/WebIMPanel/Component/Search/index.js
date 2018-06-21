/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import styles from './index.less';


class Search extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {
      focus: false
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  inputChangeHandler = (e) => {
    this.props.onChange && this.props.onChange(e.target.value);
  }

  inputFocusHandler = (e) => {
    this.setState({
      focus: true
    });
  }

  inputBlurHandler = (e) => {
    this.setState({
      focus: false
    });
  }

  render() {
    return (
      <div className={styles.searchWrap} style={{ ...this.props.style }}>
        <Icon type="search" style={{ display: this.state.focus ? 'none' : 'block' }} />
        <input placeholder="搜索"
               onChange={this.inputChangeHandler}
               onFocus={this.inputFocusHandler}
               onBlur={this.inputBlurHandler}
               style={{ paddingLeft: this.state.focus ? '12px' : '40px' }} />
        <Icon type="close-circle" style={{ display: this.state.focus ? 'block' : 'none' }} />
      </div>
    );
  }
}

export default Search;
