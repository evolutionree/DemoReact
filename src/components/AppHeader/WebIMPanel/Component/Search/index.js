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
      focus: false,
      value: ''
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  inputChangeHandler = (e) => {
    this.setState({
      value: e.target.value
    });
    this.props.onChange && this.props.onChange(e.target.value);
  }

  clear = () => {
    this.inputRef.blur();
    this.setState({
      value: ''
    });
    this.props.onChange && this.props.onChange('');
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
        <Icon type="search" style={{ left: this.state.focus ? '-20px' : '20px' }} />
        <input ref={ref => this.inputRef = ref} placeholder="搜索"
               onChange={this.inputChangeHandler}
               onFocus={this.inputFocusHandler}
               onBlur={this.inputBlurHandler}
               value={this.state.value}
               style={{ paddingLeft: this.state.focus ? '12px' : '40px' }} />
        <Icon type="close-circle" style={{ opacity: this.state.focus ? 1 : 0 }} onClick={this.clear} />
      </div>
    );
  }
}

export default Search;
